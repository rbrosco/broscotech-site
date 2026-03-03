import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { kanban_cards, kanban_columns, projects } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { asc, eq, inArray } from 'drizzle-orm';

async function getOrCreateProjectForUser(userId: number) {
  const existing = await db
    .select()
    .from(projects)
    .where(eq(projects.user_id, userId))
    .orderBy(projects.id)
    .limit(1);

  let project = existing[0];
  if (!project) {
    const [created] = await db
      .insert(projects)
      .values({ user_id: userId, title: 'Seu Projeto', status: 'Em planejamento', progress: 0 })
      .returning();
    project = created;
  }

  // Pipeline padrão único para todos os projetos
  const pipeline = [
    'Backlog',
    'Levantamento de Requisitos',
    'Planejamento',
    'Design UI/UX',
    'Desenvolvimento',
    'Code Review',
    'Testes',
    'Homologação',
    'Deploy',
    'Aguardando Cliente',
    'Concluído',
  ];
  const existingCols = await db
    .select()
    .from(kanban_columns)
    .where(eq(kanban_columns.project_id, project.id));
  if (existingCols.length !== pipeline.length || existingCols.some((col, idx) => col.title !== pipeline[idx])) {
    // Remove todas as colunas antigas se não baterem com o padrão
    if (existingCols.length > 0) {
      await db.delete(kanban_columns).where(eq(kanban_columns.project_id, project.id));
    }
    // Cria as colunas padrão
    for (let i = 0; i < pipeline.length; i++) {
      await db.insert(kanban_columns).values({ project_id: project.id, title: pipeline[i], position: i });
    }
  }
  return project;
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');
    let project = null;
    if (projectIdParam) {
      // Buscar o projeto do usuário pelo projectId informado
      const found = await db
        .select()
        .from(projects)
        .where(eq(projects.id, Number(projectIdParam)))
        .limit(1);
      if (found[0] && found[0].user_id === userId) {
        project = found[0];
      } else {
        // projectId inválido ou não pertence ao usuário
        return NextResponse.json({ message: 'Projeto não encontrado.' }, { status: 404 });
      }
    } else {
      // Fallback: retorna o primeiro projeto do usuário
      project = await getOrCreateProjectForUser(userId);
    }

    const columns = await db
      .select()
      .from(kanban_columns)
      .where(eq(kanban_columns.project_id, Number(project.id)))
      .orderBy(asc(kanban_columns.position));

    // Buscar apenas os cards das colunas deste projeto
    const columnIds = columns.map((col) => Number(col.id));
    let cards: Array<Record<string, unknown>> = [];
    if (columnIds.length > 0) {
      cards = await db
        .select()
        .from(kanban_cards)
        .where(inArray(kanban_cards.column_id, columnIds))
        .orderBy(asc(kanban_cards.position));
    }

    // Garantir que card.column_id e col.id são number
    const cardsByColumn = new Map<number, Array<Record<string, unknown>>>();
    for (const card of cards) {
      const colId = Number(card.column_id);
      if (!cardsByColumn.has(colId)) cardsByColumn.set(colId, []);
      cardsByColumn.get(colId)!.push(card);
    }

    const resultColumns = columns.map((col) => ({
      ...col,
      cards: cardsByColumn.get(Number(col.id)) ?? [],
    }));

    return NextResponse.json({ project: { id: project.id, title: project.title }, columns: resultColumns });
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

    const body = await request.json();
    const type = String(body.type ?? '');

    const userId = Number(auth.id);
    const project = await getOrCreateProjectForUser(userId);

    if (type === 'column') {
      const title = String(body.title ?? '').trim();
      if (!title) return NextResponse.json({ message: 'Título da coluna é obrigatório.' }, { status: 400 });

      const existingCols = await db
        .select()
        .from(kanban_columns)
        .where(eq(kanban_columns.project_id, Number(project.id)));

      const position = existingCols.length;
      const [created] = await db
        .insert(kanban_columns)
        .values({ project_id: Number(project.id), title, position })
        .returning();

      return NextResponse.json({ column: created, message: 'Coluna criada.' });
    }

    if (type === 'card') {
      const columnId = Number(body.columnId ?? NaN);
      const title = String(body.title ?? '').trim();
      const description = typeof body.description === 'string' ? body.description : null;
      if (!Number.isFinite(columnId) || !title) {
        return NextResponse.json({ message: 'Dados do card inválidos.' }, { status: 400 });
      }

      const existingCards = await db
        .select()
        .from(kanban_cards)
        .where(eq(kanban_cards.column_id, Number(columnId)));

      const position = existingCards.length;
      const [created] = await db
        .insert(kanban_cards)
        .values({ column_id: Number(columnId), title, description, position })
        .returning();

      return NextResponse.json({ card: created, message: 'Card criado.' });
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

    const body = await request.json();
    const cardId = Number(body.cardId ?? NaN);
    const toColumnId = Number(body.toColumnId ?? NaN);
    const toPosition = Number(body.toPosition ?? NaN);

    if (!Number.isFinite(cardId) || !Number.isFinite(toColumnId) || !Number.isFinite(toPosition)) {
      return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const [card] = await db
      .select()
      .from(kanban_cards)
      .where(eq(kanban_cards.id, Number(cardId)))
      .limit(1);

    if (!card) {
      return NextResponse.json({ message: 'Card não encontrado.' }, { status: 404 });
    }

    await db
      .update(kanban_cards)
      .set({ column_id: Number(toColumnId) })
      .where(eq(kanban_cards.id, Number(cardId)));

    const cardsInColumn = await db
      .select()
      .from(kanban_cards)
      .where(eq(kanban_cards.column_id, Number(toColumnId)))
      .orderBy(asc(kanban_cards.position));

    const reordered = cardsInColumn.map((c, index) => ({ ...c, position: index }));

    await Promise.all(
      reordered.map((c) =>
        db.update(kanban_cards).set({ position: c.position }).where(eq(kanban_cards.id, Number(c.id)))
      )
    );

    return NextResponse.json({ message: 'Card movido.' });
  } catch (error) {
    console.error('Erro em /api/kanban PATCH:', error);
    return NextResponse.json({ message: 'Erro interno ao mover card.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const cardId = Number(body.cardId ?? NaN);

    if (!Number.isFinite(cardId)) {
      return NextResponse.json({ message: 'cardId inválido.' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(kanban_cards)
      .where(eq(kanban_cards.id, Number(cardId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ message: 'Card não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Card excluído.' });
  } catch (error) {
    console.error('Erro em /api/kanban DELETE:', error);
    return NextResponse.json({ message: 'Erro interno ao excluir card.' }, { status: 500 });
  }
}
