import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/typeorm';
import { KanbanCardEntity, KanbanColumnEntity, ProjectEntity } from '@/lib/entities';
import { requireAuth } from '@/lib/middlewareAuth';
import { In } from 'typeorm';

// Pipeline padrão de colunas
const DEFAULT_PIPELINE = [
  'Inicio (Do Projeto)',
  'Discussão (Sobre o Projeto)',
  'Tipo de Projeto',
  '1 Fase (Prévia do Projeto)',
  '2 Fase (Segunda Prévia)',
  'Finalização',
  'Faturamento',
  'Concluído',
  'Não aceito'
];

/**
 * Progresso (%) do projeto = posição da coluna mais avançada que tem pelo
 * menos 1 card, sobre o total de colunas "de avanço" do pipeline.
 * "Não aceito" não conta pra frente (é saída/rejeição, não avanço) — se um
 * card cai lá, ignoramos essa coluna no cálculo. Se a única coluna com
 * cards for "Não aceito", o progresso fica 0.
 */
function calcProgressFromColumns(columns: { id: number; title: string; position: number }[], cardCountByColumn: Map<number, number>): number {
  const progressColumns = columns
    .filter((c) => c.title.trim().toLowerCase() !== 'não aceito')
    .sort((a, b) => a.position - b.position);

  if (progressColumns.length === 0) return 0;

  let lastIndexWithCards = -1;
  progressColumns.forEach((col, idx) => {
    if ((cardCountByColumn.get(col.id) ?? 0) > 0) lastIndexWithCards = idx;
  });

  if (lastIndexWithCards === -1) return 0;

  const totalSteps = progressColumns.length - 1;
  if (totalSteps <= 0) return 100;

  return Math.round((lastIndexWithCards / totalSteps) * 100);
}

async function recalcProjectProgress(dataSource: Awaited<ReturnType<typeof getDataSource>>, projectId: number) {
  const columnRepo = dataSource.getRepository(KanbanColumnEntity);
  const cardRepo = dataSource.getRepository(KanbanCardEntity);
  const projectRepo = dataSource.getRepository(ProjectEntity);

  const columns = await columnRepo.find({ where: { project_id: projectId } });
  const columnIds = columns.map((c) => Number(c.id));
  const cardCountByColumn = new Map<number, number>();

  if (columnIds.length > 0) {
    const cards = await cardRepo.find({ where: { column_id: In(columnIds) } });
    for (const card of cards) {
      const colId = Number(card.column_id);
      cardCountByColumn.set(colId, (cardCountByColumn.get(colId) ?? 0) + 1);
    }
  }

  const progress = calcProgressFromColumns(
    columns.map((c) => ({ id: Number(c.id), title: c.title, position: c.position ?? 0 })),
    cardCountByColumn
  );

  await projectRepo.update({ id: projectId }, { progress, updated_at: new Date().toISOString() });
  return progress;
}

async function ensureProjectHasColumns(dataSource: Awaited<ReturnType<typeof getDataSource>>, projectId: number) {
  const columnRepo = dataSource.getRepository(KanbanColumnEntity);
  const cardRepo = dataSource.getRepository(KanbanCardEntity);

  const existingCols = await columnRepo.find({ where: { project_id: projectId } });

  if (existingCols.length === 0) {
    const defaultCardsMap: Record<string, Array<{ title: string; description: string }>> = {
      'Inicio (Do Projeto)': [{ title: 'Alinhamento inicial do projeto', description: 'Reunião de kickoff e levantamento de necessidades.' }],
      'Discussão (Sobre o Projeto)': [{ title: 'Definição da arquitetura e escopo', description: 'Mapeamento das funcionalidades principais.' }],
      'Tipo de Projeto': [{ title: 'Aprovação do modelo de desenvolvimento', description: 'Escolha da stack tecnológica e cronograma.' }],
      '1 Fase (Prévia do Projeto)': [{ title: 'Desenvolvimento do protótipo UI/UX', description: 'Criação das telas principais do sistema.' }],
      '2 Fase (Segunda Prévia)': [{ title: 'Integração de APIs e Banco de Dados', description: 'Conexão das rotas de backend com PostgreSQL.' }],
      'Finalização': [{ title: 'Testes de homologação', description: 'Validação final das funcionalidades e entrega.' }],
    };

    for (let i = 0; i < DEFAULT_PIPELINE.length; i++) {
      const title = DEFAULT_PIPELINE[i];
      const col = await columnRepo.save(columnRepo.create({ project_id: projectId, title, position: i }));

      const initialCards = defaultCardsMap[title];
      if (initialCards && col) {
        for (let j = 0; j < initialCards.length; j++) {
          await cardRepo.save(cardRepo.create({
            column_id: Number(col.id),
            title: initialCards[j].title,
            description: initialCards[j].description,
            position: j,
          }));
        }
      }
    }
  }
}

async function getOrCreateProjectForUser(dataSource: Awaited<ReturnType<typeof getDataSource>>, userId: number) {
  const projectRepo = dataSource.getRepository(ProjectEntity);

  const existing = await projectRepo.find({ where: { user_id: userId }, order: { id: 'ASC' }, take: 1 });

  let project = existing[0];
  if (!project) {
    project = await projectRepo.save(
      projectRepo.create({ user_id: userId, title: 'Seu Projeto', status: 'Em planejamento', progress: 0 })
    );
  }

  await ensureProjectHasColumns(dataSource, Number(project.id));
  return project;
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');

    const dataSource = await getDataSource();
    const projectRepo = dataSource.getRepository(ProjectEntity);

    let project: ProjectEntity | null = null;
    if (projectIdParam) {
      // Admins can load any project; clients can only load their own
      const found = await projectRepo.findOne({ where: { id: Number(projectIdParam) } });
      if (found && (isAdmin || found.user_id === userId)) {
        project = found;
        await ensureProjectHasColumns(dataSource, Number(project.id));
      } else {
        return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
      }
    } else {
      // Fallback: return the user's first project
      project = await getOrCreateProjectForUser(dataSource, userId);
    }

    const columnRepo = dataSource.getRepository(KanbanColumnEntity);
    const cardRepo = dataSource.getRepository(KanbanCardEntity);

    const columns = await columnRepo.find({
      where: { project_id: Number(project.id) },
      order: { position: 'ASC' },
    });

    // Buscar apenas os cards das colunas deste projeto
    const columnIds = columns.map((col) => Number(col.id));
    let cards: KanbanCardEntity[] = [];
    if (columnIds.length > 0) {
      cards = await cardRepo.find({
        where: { column_id: In(columnIds) },
        order: { position: 'ASC' },
      });
    }

    // Garantir que card.column_id e col.id são number
    const cardsByColumn = new Map<number, KanbanCardEntity[]>();
    for (const card of cards) {
      const colId = Number(card.column_id);
      if (!cardsByColumn.has(colId)) cardsByColumn.set(colId, []);
      cardsByColumn.get(colId)!.push(card);
    }

    const resultColumns = columns.map((col) => ({
      ...col,
      cards: cardsByColumn.get(Number(col.id)) ?? [],
    }));

    return NextResponse.json({
      project: { id: project.id, title: project.title, progress: project.progress ?? 0 },
      columns: resultColumns,
    });
  } catch (error) {
    console.error('Erro em /api/kanban GET:', error);
    return NextResponse.json({ message: 'Erro interno ao carregar Kanban.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) {
      return NextResponse.json({ message: 'Acesso negado. Apenas admins podem modificar.' }, { status: 403 });
    }

    const body = await request.json();
    const type = String(body.type ?? '');

    const dataSource = await getDataSource();
    const columnRepo = dataSource.getRepository(KanbanColumnEntity);
    const cardRepo = dataSource.getRepository(KanbanCardEntity);

    let projectIdToUse: number;
    if (body.projectId) {
      projectIdToUse = Number(body.projectId);
    } else {
      const userId = Number(auth.id);
      const project = await getOrCreateProjectForUser(dataSource, userId);
      projectIdToUse = Number(project.id);
    }

    if (type === 'column') {
      const title = String(body.title ?? '').trim();
      if (!title) return NextResponse.json({ message: 'Título da coluna é obrigatório.' }, { status: 400 });

      const existingCols = await columnRepo.find({ where: { project_id: projectIdToUse } });

      const position = existingCols.length;
      const created = await columnRepo.save(columnRepo.create({ project_id: projectIdToUse, title, position }));

      return NextResponse.json({ column: created, message: 'Coluna criada.' });
    }

    if (type === 'card') {
      const columnId = Number(body.columnId ?? NaN);
      const title = String(body.title ?? '').trim();
      const description = typeof body.description === 'string' ? body.description : null;
      const responsavel = typeof body.responsavel === 'string' && body.responsavel.trim() ? body.responsavel.trim() : null;
      const dueDate = typeof body.dueDate === 'string' && body.dueDate.trim() ? body.dueDate.trim() : null;
      const priority = typeof body.priority === 'string' && ['baixa', 'media', 'alta'].includes(body.priority) ? body.priority : null;

      if (!Number.isFinite(columnId) || !title) {
        return NextResponse.json({ message: 'Dados do card inválidos.' }, { status: 400 });
      }

      const existingCards = await cardRepo.find({ where: { column_id: Number(columnId) } });

      const position = existingCards.length;
      const created = await cardRepo.save(cardRepo.create({
        column_id: Number(columnId),
        title,
        description,
        position,
        responsavel,
        due_date: dueDate,
        priority,
      }));

      const newProgress = await recalcProjectProgress(dataSource, projectIdToUse);

      return NextResponse.json({ card: created, message: 'Card criado.', progress: newProgress });
    }

    return NextResponse.json({ message: 'Tipo de operação inválido.' }, { status: 400 });
  } catch (error) {
    console.error('Erro em /api/kanban POST:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar Kanban.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) {
      return NextResponse.json({ message: 'Acesso negado. Apenas admins podem modificar.' }, { status: 403 });
    }

    const body = await request.json();
    const cardId = Number(body.cardId ?? NaN);
    if (!Number.isFinite(cardId)) {
      return NextResponse.json({ message: 'cardId é obrigatório.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const cardRepo = dataSource.getRepository(KanbanCardEntity);
    const columnRepo = dataSource.getRepository(KanbanColumnEntity);

    const card = await cardRepo.findOne({ where: { id: Number(cardId) } });
    if (!card) {
      return NextResponse.json({ message: 'Card não encontrado.' }, { status: 404 });
    }

    // Resolve o projeto dono do card (via coluna atual) para recalcular o progresso no final.
    const currentColumn = await columnRepo.findOne({ where: { id: Number(card.column_id) } });
    let projectId = currentColumn?.project_id ?? null;

    const toColumnId = Number(body.toColumnId ?? NaN);
    const toPosition = Number(body.toPosition ?? NaN);
    const isMove = Number.isFinite(toColumnId) && Number.isFinite(toPosition);

    if (isMove) {
      await cardRepo.update({ id: Number(cardId) }, { column_id: Number(toColumnId) });

      const cardsInColumn = await cardRepo.find({
        where: { column_id: Number(toColumnId) },
        order: { position: 'ASC' },
      });
      const reordered = cardsInColumn.map((c, index) => ({ ...c, position: index }));
      await Promise.all(
        reordered.map((c) => cardRepo.update({ id: Number(c.id) }, { position: c.position }))
      );

      // Após mover, o projeto dono pode ter mudado de coluna (mesmo projeto, coluna nova).
      const newColumn = await columnRepo.findOne({ where: { id: Number(toColumnId) } });
      projectId = newColumn?.project_id ?? projectId;
    }

    // Edição de conteúdo do card (título/descrição/responsável/data/prioridade) — todos opcionais.
    const patch: Partial<KanbanCardEntity> = {};
    if (typeof body.title === 'string' && body.title.trim()) patch.title = body.title.trim();
    if (typeof body.description === 'string') patch.description = body.description || null;
    if (typeof body.responsavel === 'string') patch.responsavel = body.responsavel.trim() || null;
    if (typeof body.dueDate === 'string') patch.due_date = body.dueDate || null;
    if (typeof body.priority === 'string') {
      patch.priority = ['baixa', 'media', 'alta'].includes(body.priority) ? body.priority : null;
    }
    if (Object.keys(patch).length > 0) {
      await cardRepo.update({ id: Number(cardId) }, patch);
    }

    let newProgress: number | null = null;
    if (projectId) {
      newProgress = await recalcProjectProgress(dataSource, Number(projectId));
    }

    const updated = await cardRepo.findOne({ where: { id: Number(cardId) } });

    return NextResponse.json({ message: 'Card atualizado.', card: updated, progress: newProgress });
  } catch (error) {
    console.error('Erro em /api/kanban PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao atualizar card.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }
    const isAdmin = ((auth as { role?: string }).role === 'admin');
    if (!isAdmin) {
      return NextResponse.json({ message: 'Acesso negado. Apenas admins podem modificar.' }, { status: 403 });
    }

    const body = await request.json();
    const cardId = Number(body.cardId ?? NaN);

    if (!Number.isFinite(cardId)) {
      return NextResponse.json({ message: 'cardId inválido.' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const cardRepo = dataSource.getRepository(KanbanCardEntity);
    const columnRepo = dataSource.getRepository(KanbanColumnEntity);

    const existing = await cardRepo.findOne({ where: { id: Number(cardId) } });
    if (!existing) {
      return NextResponse.json({ message: 'Card não encontrado.' }, { status: 404 });
    }

    const column = await columnRepo.findOne({ where: { id: Number(existing.column_id) } });

    await cardRepo.delete({ id: Number(cardId) });

    let newProgress: number | null = null;
    if (column?.project_id) {
      newProgress = await recalcProjectProgress(dataSource, Number(column.project_id));
    }

    return NextResponse.json({ message: 'Card excluído.', progress: newProgress });
  } catch (error) {
    console.error('Erro em /api/kanban DELETE:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir card.' }, { status: 500 });
  }
}
