import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { kanban_cards, kanban_columns, projects, users } from "@/lib/schema";
import { requireAuth } from "@/lib/middlewareAuth";

export const runtime = "nodejs";

const DEFAULT_COLUMNS = [
  { title: "Inicio (Do Projeto)", position: 0 },
  { title: "Discussão (Sobre o Projeto)", position: 1 },
  { title: "Tipo de Projeto", position: 2 },
  { title: "1 Fase (Prévia do Projeto)", position: 3 },
  { title: "2 Fase (Segunda Prévia)", position: 4 },
  { title: "Finalização", position: 5 },
  { title: "Faturamento", position: 6 },
  { title: "Concluido", position: 7 },
  { title: "Não aceito", position: 8 },
] as const;

type KanbanCard = {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  position: number;
};

type KanbanColumn = {
  id: number;
  project_id: number;
  title: string;
  position: number;
  cards: KanbanCard[];
};

type ColumnRow = {
  id: string | number;
  project_id: string | number;
  title: string;
  position: number;
};

async function ensureDefaultProjectAndColumns(userId: number) {
  const projectResult = await db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(eq(projects.user_id, userId))
    .orderBy(asc(projects.created_at))
    .limit(1);

  let projectId: number;
  let projectTitle: string;

  if (projectResult[0]) {
    projectId = Number(projectResult[0].id);
    projectTitle = String(projectResult[0].title);

    if (projectTitle === 'Demo Project') {
      await db.update(projects).set({ title: 'Seu Projeto' }).where(eq(projects.id, projectId));
      projectTitle = 'Seu Projeto';
    }
  } else {
    const created = await db
      .insert(projects)
      .values({ user_id: userId, title: "Seu Projeto", status: "Em planejamento", progress: 0 })
      .returning({ id: projects.id, title: projects.title });
    projectId = Number(created[0].id);
    projectTitle = String(created[0].title);
  }

  const existing = await db
    .select({ id: kanban_columns.id, title: kanban_columns.title, position: kanban_columns.position })
    .from(kanban_columns)
    .where(eq(kanban_columns.project_id, projectId))
    .orderBy(asc(kanban_columns.position), asc(kanban_columns.id));

  if (existing.length === 0) {
    for (const c of DEFAULT_COLUMNS) {
      await db.insert(kanban_columns).values({ project_id: projectId, title: c.title, position: c.position });
    }
  } else {
    // Se o projeto ainda estiver com o padrão antigo (To Do / In Progress / Done), renomeia as 3 primeiras
    // para preservar cards e depois cria as demais colunas.
    const hasLegacy = existing.some((c) => ["To Do", "In Progress", "Done"].includes(String(c.title)));
    if (hasLegacy) {
      const legacyMap = new Map<string, { title: string; position: number }>([
        ["To Do", DEFAULT_COLUMNS[0]],
        ["In Progress", DEFAULT_COLUMNS[1]],
        ["Done", DEFAULT_COLUMNS[2]],
      ]);

      for (const col of existing) {
        const mapped = legacyMap.get(String(col.title));
        if (mapped) {
          await db
            .update(kanban_columns)
            .set({ title: mapped.title, position: mapped.position })
            .where(eq(kanban_columns.id, Number(col.id)));
        }
      }
    }

    // Garante que todas as colunas desejadas existam e que a posição esteja correta.
    const byTitle = new Map<string, number>();
    const refreshed = await db
      .select({ id: kanban_columns.id, title: kanban_columns.title })
      .from(kanban_columns)
      .where(eq(kanban_columns.project_id, projectId));
    for (const row of refreshed as Array<{ id: number; title: string | null }>) {
      byTitle.set(String(row.title), Number(row.id));
    }

    for (const c of DEFAULT_COLUMNS) {
      const existingId = byTitle.get(c.title);
      if (!existingId) {
        await db.insert(kanban_columns).values({ project_id: projectId, title: c.title, position: c.position });
      } else {
        await db.update(kanban_columns).set({ position: c.position }).where(eq(kanban_columns.id, existingId));
      }
    }
  }

  // Remove colunas extras (como a coluna de teste) se não tiverem cards.
  // Mantém apenas o fluxo padrão acima.
  // Mantém apenas colunas padrão quando não tiverem cards
  await db.execute(sql`
    DELETE FROM kanban_columns c
    WHERE c.project_id = ${projectId}
      AND NOT (c.title = ANY(${DEFAULT_COLUMNS.map((c) => c.title)}::text[]))
      AND NOT EXISTS (SELECT 1 FROM kanban_cards k WHERE k.column_id = c.id)
  `);

  return { projectId, projectTitle };
}

export async function GET(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, projectTitle } = await ensureDefaultProjectAndColumns(userId);

    const cols = await db
      .select({ id: kanban_columns.id, project_id: kanban_columns.project_id, title: kanban_columns.title, position: kanban_columns.position })
      .from(kanban_columns)
      .where(eq(kanban_columns.project_id, projectId))
      .orderBy(asc(kanban_columns.position), asc(kanban_columns.id));

    const colIds = cols.map((c) => Number(c.id));
    const cards = colIds.length
      ? await db
          .select({ id: kanban_cards.id, column_id: kanban_cards.column_id, title: kanban_cards.title, description: kanban_cards.description, position: kanban_cards.position })
          .from(kanban_cards)
          .where(inArray(kanban_cards.column_id, colIds))
          .orderBy(asc(kanban_cards.position), asc(kanban_cards.id))
      : [];

    const cardsByColumn = new Map<number, KanbanCard[]>();
    for (const row of cards as Array<KanbanCard>) {
      const colId = Number(row.column_id);
      const list = cardsByColumn.get(colId) ?? [];
      list.push({
        id: Number(row.id),
        column_id: colId,
        title: String(row.title),
        description: row.description ?? null,
        position: Number(row.position),
      });
      cardsByColumn.set(colId, list);
    }

    const columns: KanbanColumn[] = (cols as unknown as ColumnRow[]).map((c) => {
      const id = Number(c.id);
      return {
        id,
        project_id: Number(c.project_id),
        title: String(c.title),
        position: Number(c.position),
        cards: cardsByColumn.get(id) ?? [],
      };
    });

    return NextResponse.json(
      {
        project: { id: projectId, title: projectTitle },
        columns,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("kanban GET error", error);
    return NextResponse.json(
      { message: "Erro ao carregar Kanban. Verifique se as tabelas existem." },
      { status: 500 }
    );
  }
}

type PostBody =
  | { type: "column"; title?: string }
  | { type: "card"; columnId?: number; title?: string; description?: string };

export async function POST(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  try {
    const { projectId } = await ensureDefaultProjectAndColumns(userId);

    if (body.type === "column") {
      const title = body.title?.trim();
      if (!title) return NextResponse.json({ message: "title é obrigatório." }, { status: 400 });

      // Limite para não "zuar" o Kanban: não permite criar colunas além do fluxo padrão.
      const countRes = await db
        .select({ cnt: sql`COUNT(*)::int` })
        .from(kanban_columns)
        .where(eq(kanban_columns.project_id, projectId));
      const cnt = Number(countRes[0]?.cnt ?? 0);
      if (cnt >= DEFAULT_COLUMNS.length) {
        return NextResponse.json(
          { message: "Limite de colunas atingido." },
          { status: 400 }
        );
      }

      const posRes = await db
        .select({ next_pos: sql`COALESCE(MAX(position), -1) + 1` })
        .from(kanban_columns)
        .where(eq(kanban_columns.project_id, projectId));
      const nextPos = Number(posRes[0]?.next_pos ?? 0);

      const inserted = await db
        .insert(kanban_columns)
        .values({ project_id: projectId, title, position: nextPos })
        .returning({ id: kanban_columns.id, project_id: kanban_columns.project_id, title: kanban_columns.title, position: kanban_columns.position });

      return NextResponse.json({ column: inserted[0] }, { status: 201 });
    }

    if (body.type === "card") {
      const title = body.title?.trim();
      const columnId = body.columnId ? Number(body.columnId) : NaN;
      const description = body.description?.trim() || null;

      if (!title || !Number.isFinite(columnId)) {
        return NextResponse.json({ message: "columnId e title são obrigatórios." }, { status: 400 });
      }

      // Ensure column belongs to user's project
      const colRes = await db
        .select({ id: kanban_columns.id })
        .from(kanban_columns)
        .where(and(eq(kanban_columns.id, columnId), eq(kanban_columns.project_id, projectId)))
        .limit(1);
      if (!colRes[0]) {
        return NextResponse.json({ message: "Coluna inválida." }, { status: 400 });
      }

      const posRes = await db
        .select({ next_pos: sql`COALESCE(MAX(position), -1) + 1` })
        .from(kanban_cards)
        .where(eq(kanban_cards.column_id, columnId));
      const nextPos = Number(posRes[0]?.next_pos ?? 0);

      const inserted = await db
        .insert(kanban_cards)
        .values({ column_id: columnId, title, description, position: nextPos })
        .returning({ id: kanban_cards.id, column_id: kanban_cards.column_id, title: kanban_cards.title, description: kanban_cards.description, position: kanban_cards.position });

      return NextResponse.json({ card: inserted[0] }, { status: 201 });
    }

    return NextResponse.json({ message: "type inválido." }, { status: 400 });
  } catch (error) {
    console.error("kanban POST error", error);
    return NextResponse.json({ message: "Erro ao criar." }, { status: 500 });
  }
}

type PatchBody = {
  cardId?: number;
  toColumnId?: number;
  toPosition?: number;
};

export async function PATCH(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const cardId = body.cardId ? Number(body.cardId) : NaN;
  const toColumnId = body.toColumnId ? Number(body.toColumnId) : NaN;
  const toPosition = Number.isFinite(body.toPosition as number) ? Number(body.toPosition) : NaN;

  if (!Number.isFinite(cardId) || !Number.isFinite(toColumnId) || !Number.isFinite(toPosition)) {
    return NextResponse.json({ message: "cardId, toColumnId e toPosition são obrigatórios." }, { status: 400 });
  }

  try {
    const { projectId } = await ensureDefaultProjectAndColumns(userId);

    const roleRes = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const role = roleRes[0]?.role;
    if (role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Validate destination column belongs to user
    const colRes = await db
      .select({ id: kanban_columns.id })
      .from(kanban_columns)
      .where(and(eq(kanban_columns.id, toColumnId), eq(kanban_columns.project_id, projectId)))
      .limit(1);

    if (!colRes[0]) {
      return NextResponse.json({ message: "Coluna de destino inválida." }, { status: 400 });
    }

    // Reordenação com transação via Drizzle
    await db.transaction(async (tx) => {
      const cardRes = await tx.execute(sql`
        SELECT k.id, k.column_id, k.position
        FROM kanban_cards k
        JOIN kanban_columns c ON c.id = k.column_id
        WHERE k.id = ${cardId} AND c.project_id = ${projectId}
        LIMIT 1
      `);

      const cardRow = (cardRes.rows as Array<{ column_id: number; position: number }>)[0];
      if (!cardRow) {
        throw new Error('CARD_NOT_FOUND');
      }

      const fromColumnId = Number(cardRow.column_id);
      const fromPosition = Number(cardRow.position);

      if (fromColumnId === toColumnId) {
        const countRes = await tx.execute(sql`
          SELECT COUNT(*)::int AS cnt FROM kanban_cards WHERE column_id = ${fromColumnId}
        `);
        const countRow = (countRes.rows as Array<{ cnt?: number | string }>)[0];
        const cnt = Number(countRow?.cnt ?? 0);
        const maxIndex = Math.max(0, cnt - 1);
        const targetPos = Math.max(0, Math.min(maxIndex, toPosition));

        if (targetPos !== fromPosition) {
          if (targetPos > fromPosition) {
            await tx.execute(sql`
              UPDATE kanban_cards
              SET position = position - 1
              WHERE column_id = ${fromColumnId} AND position > ${fromPosition} AND position <= ${targetPos}
            `);
          } else {
            await tx.execute(sql`
              UPDATE kanban_cards
              SET position = position + 1
              WHERE column_id = ${fromColumnId} AND position >= ${targetPos} AND position < ${fromPosition}
            `);
          }
          await tx.execute(sql`UPDATE kanban_cards SET position = ${targetPos} WHERE id = ${cardId}`);
        }
        return;
      }

      // Moving across columns
      await tx.execute(sql`
        UPDATE kanban_cards
        SET position = position - 1
        WHERE column_id = ${fromColumnId} AND position > ${fromPosition}
      `);

      const destCountRes = await tx.execute(sql`
        SELECT COUNT(*)::int AS cnt FROM kanban_cards WHERE column_id = ${toColumnId}
      `);
      const destCountRow = (destCountRes.rows as Array<{ cnt?: number | string }>)[0];
      const destCnt = Number(destCountRow?.cnt ?? 0);
      const targetPos = Math.max(0, Math.min(destCnt, toPosition));

      await tx.execute(sql`
        UPDATE kanban_cards
        SET position = position + 1
        WHERE column_id = ${toColumnId} AND position >= ${targetPos}
      `);

      await tx.execute(sql`
        UPDATE kanban_cards
        SET column_id = ${toColumnId}, position = ${targetPos}
        WHERE id = ${cardId}
      `);
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'CARD_NOT_FOUND') {
      return NextResponse.json({ message: "Card inválido." }, { status: 400 });
    }
    console.error("kanban PATCH error", error);
    return NextResponse.json({ message: "Erro ao mover card." }, { status: 500 });
  }
}