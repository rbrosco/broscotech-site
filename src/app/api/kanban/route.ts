import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle';
import { kanban_cards, kanban_columns, projects } from '@/lib/schema';
import { requireAuth } from '@/lib/middlewareAuth';
import { asc, eq } from 'drizzle-orm';

async function getOrCreateProjectForUser(userId: number) {
  const existing = await db
    .select()
    .from(projects)
    .where(eq(projects.user_id, userId as number))
    .orderBy(projects.id)
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(projects)
    .values({ user_id: userId, title: 'Seu Projeto', status: 'Em planejamento', progress: 0 })
    .returning();

  return created;
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request.headers as unknown as { get(name: string): string | null });
    if (!auth || !auth.id) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const userId = Number(auth.id);
    const project = await getOrCreateProjectForUser(userId);

    const columns = await db
      .select()
      .from(kanban_columns)
      .where(eq(kanban_columns.project_id, project.id as number))
      .orderBy(asc(kanban_columns.position));

    const cards = await db
      .select()
      .from(kanban_cards)
      .orderBy(asc(kanban_cards.position));

    const cardsByColumn = new Map<number, typeof cards>();
    for (const card of cards) {
      if (!cardsByColumn.has(card.column_id)) cardsByColumn.set(card.column_id, []);
      cardsByColumn.get(card.column_id)!.push(card);
    }

    const resultColumns = columns.map((col) => ({
      ...col,
      cards: cardsByColumn.get(col.id) ?? [],
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
        .where(eq(kanban_columns.project_id, project.id as number));

      const position = existingCols.length;
      const [created] = await db
        .insert(kanban_columns)
        .values({ project_id: project.id, title, position })
        .returning();

      return NextResponse.json({ column: created, message: 'Coluna criada.' });
    }

    if (type === 'card') {
      const columnId = Number(body.columnId ?? NaN);
      const title = String(body.title ?? '').trim();
      if (!Number.isFinite(columnId) || !title) {
        return NextResponse.json({ message: 'Dados do card inválidos.' }, { status: 400 });
      }

      const existingCards = await db
        .select()
        .from(kanban_cards)
        .where(eq(kanban_cards.column_id, columnId as number));

      const position = existingCards.length;
      const [created] = await db
        .insert(kanban_cards)
        .values({ column_id: columnId, title, position })
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
      .where(eq(kanban_cards.id, cardId as number))
      .limit(1);

    if (!card) {
      return NextResponse.json({ message: 'Card não encontrado.' }, { status: 404 });
    }

    await db
      .update(kanban_cards)
      .set({ column_id: toColumnId })
      .where(eq(kanban_cards.id, cardId as number));

    const cardsInColumn = await db
      .select()
      .from(kanban_cards)
      .where(eq(kanban_cards.column_id, toColumnId as number))
      .orderBy(asc(kanban_cards.position));

    const reordered = cardsInColumn.map((c, index) => ({ ...c, position: index }));

    await Promise.all(
      reordered.map((c) =>
        db.update(kanban_cards).set({ position: c.position }).where(eq(kanban_cards.id, c.id as number))
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
      .where(eq(kanban_cards.id, cardId as number))
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
