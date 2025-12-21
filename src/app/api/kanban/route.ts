import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";
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
  const pool = getPool();

  const projectResult = await pool.query(
    "SELECT id, title FROM projects WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1",
    [userId]
  );

  let projectId: number;
  let projectTitle: string;

  if (projectResult.rowCount && projectResult.rows[0]) {
    projectId = Number(projectResult.rows[0].id);
    projectTitle = String(projectResult.rows[0].title);

    if (projectTitle === 'Demo Project') {
      await pool.query('UPDATE projects SET title = $1 WHERE id = $2', ['Seu Projeto', projectId]);
      projectTitle = 'Seu Projeto';
    }
  } else {
    const created = await pool.query(
      "INSERT INTO projects (user_id, title, status, progress) VALUES ($1, $2, $3, $4) RETURNING id, title",
      [userId, "Seu Projeto", "Em planejamento", 0]
    );
    projectId = Number(created.rows[0].id);
    projectTitle = String(created.rows[0].title);
  }

  const colsRes = await pool.query(
    "SELECT id, title, position FROM kanban_columns WHERE project_id = $1 ORDER BY position ASC, id ASC",
    [projectId]
  );

  const existing = colsRes.rows as Array<{ id: string | number; title: string; position: number }>;

  if (existing.length === 0) {
    for (const c of DEFAULT_COLUMNS) {
      await pool.query(
        "INSERT INTO kanban_columns (project_id, title, position) VALUES ($1, $2, $3)",
        [projectId, c.title, c.position]
      );
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
          await pool.query(
            "UPDATE kanban_columns SET title = $1, position = $2 WHERE id = $3",
            [mapped.title, mapped.position, Number(col.id)]
          );
        }
      }
    }

    // Garante que todas as colunas desejadas existam e que a posição esteja correta.
    const refreshed = await pool.query(
      "SELECT id, title FROM kanban_columns WHERE project_id = $1",
      [projectId]
    );
    const byTitle = new Map<string, number>();
    for (const row of refreshed.rows as Array<{ id: string | number; title: string }>) {
      byTitle.set(String(row.title), Number(row.id));
    }

    for (const c of DEFAULT_COLUMNS) {
      const existingId = byTitle.get(c.title);
      if (!existingId) {
        await pool.query(
          "INSERT INTO kanban_columns (project_id, title, position) VALUES ($1, $2, $3)",
          [projectId, c.title, c.position]
        );
      } else {
        await pool.query("UPDATE kanban_columns SET position = $1 WHERE id = $2", [c.position, existingId]);
      }
    }
  }

  // Remove colunas extras (como a coluna de teste) se não tiverem cards.
  // Mantém apenas o fluxo padrão acima.
  await pool.query(
    "DELETE FROM kanban_columns c WHERE c.project_id = $1 AND NOT (c.title = ANY($2::text[])) AND NOT EXISTS (SELECT 1 FROM kanban_cards k WHERE k.column_id = c.id)",
    [projectId, DEFAULT_COLUMNS.map((c) => c.title)]
  );

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

    const colsRes = await getPool().query(
      "SELECT id, project_id, title, position FROM kanban_columns WHERE project_id = $1 ORDER BY position ASC, id ASC",
      [projectId]
    );

    const cardsRes = await getPool().query(
      "SELECT id, column_id, title, description, position FROM kanban_cards WHERE column_id = ANY($1::bigint[]) ORDER BY position ASC, id ASC",
      [colsRes.rows.map((r) => Number(r.id))]
    );

    const cardsByColumn = new Map<number, KanbanCard[]>();
    for (const row of cardsRes.rows as Array<KanbanCard>) {
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

    const columns: KanbanColumn[] = (colsRes.rows as ColumnRow[]).map((c) => {
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
      const countRes = await getPool().query(
        "SELECT COUNT(*)::int AS cnt FROM kanban_columns WHERE project_id = $1",
        [projectId]
      );
      const cnt = Number(countRes.rows[0]?.cnt ?? 0);
      if (cnt >= DEFAULT_COLUMNS.length) {
        return NextResponse.json(
          { message: "Limite de colunas atingido." },
          { status: 400 }
        );
      }

      const posRes = await getPool().query(
        "SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM kanban_columns WHERE project_id = $1",
        [projectId]
      );
      const nextPos = Number(posRes.rows[0]?.next_pos ?? 0);

      const inserted = await getPool().query(
        "INSERT INTO kanban_columns (project_id, title, position) VALUES ($1, $2, $3) RETURNING id, project_id, title, position",
        [projectId, title, nextPos]
      );

      return NextResponse.json({ column: inserted.rows[0] }, { status: 201 });
    }

    if (body.type === "card") {
      const title = body.title?.trim();
      const columnId = body.columnId ? Number(body.columnId) : NaN;
      const description = body.description?.trim() || null;

      if (!title || !Number.isFinite(columnId)) {
        return NextResponse.json({ message: "columnId e title são obrigatórios." }, { status: 400 });
      }

      // Ensure column belongs to user's project
      const colRes = await getPool().query(
        "SELECT id FROM kanban_columns WHERE id = $1 AND project_id = $2 LIMIT 1",
        [columnId, projectId]
      );
      if (!colRes.rowCount) {
        return NextResponse.json({ message: "Coluna inválida." }, { status: 400 });
      }

      const posRes = await getPool().query(
        "SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM kanban_cards WHERE column_id = $1",
        [columnId]
      );
      const nextPos = Number(posRes.rows[0]?.next_pos ?? 0);

      const inserted = await getPool().query(
        "INSERT INTO kanban_cards (column_id, title, description, position) VALUES ($1, $2, $3, $4) RETURNING id, column_id, title, description, position",
        [columnId, title, description, nextPos]
      );

      return NextResponse.json({ card: inserted.rows[0] }, { status: 201 });
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

  const pool = getPool();

  try {
    const { projectId } = await ensureDefaultProjectAndColumns(userId);

    // Validate destination column belongs to user
    const colRes = await pool.query(
      "SELECT id FROM kanban_columns WHERE id = $1 AND project_id = $2 LIMIT 1",
      [toColumnId, projectId]
    );
    if (!colRes.rowCount) {
      return NextResponse.json({ message: "Coluna inválida." }, { status: 400 });
    }

    await pool.query("BEGIN");

    // Lock card row
    const cardRes = await pool.query(
      "SELECT id, column_id, position FROM kanban_cards WHERE id = $1 FOR UPDATE",
      [cardId]
    );
    const current = cardRes.rows[0] as { id: number; column_id: number; position: number } | undefined;
    if (!current) {
      await pool.query("ROLLBACK");
      return NextResponse.json({ message: "Card não encontrado." }, { status: 404 });
    }

    const fromColumnId = Number(current.column_id);

    // Shift positions in destination column to make space
    await pool.query(
      "UPDATE kanban_cards SET position = position + 1 WHERE column_id = $1 AND position >= $2",
      [toColumnId, toPosition]
    );

    // Move card
    await pool.query(
      "UPDATE kanban_cards SET column_id = $1, position = $2 WHERE id = $3",
      [toColumnId, toPosition, cardId]
    );

    // Compact positions in source column if moved across
    if (fromColumnId !== toColumnId) {
      await pool.query(
        "WITH ordered AS (SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC, id ASC) - 1 AS new_pos FROM kanban_cards WHERE column_id = $1) UPDATE kanban_cards c SET position = o.new_pos FROM ordered o WHERE c.id = o.id",
        [fromColumnId]
      );
    }

    // Compact destination column
    await pool.query(
      "WITH ordered AS (SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC, id ASC) - 1 AS new_pos FROM kanban_cards WHERE column_id = $1) UPDATE kanban_cards c SET position = o.new_pos FROM ordered o WHERE c.id = o.id",
      [toColumnId]
    );

    await pool.query("COMMIT");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    try {
      await getPool().query("ROLLBACK");
    } catch {
      // ignore
    }
    console.error("kanban PATCH error", error);
    return NextResponse.json({ message: "Erro ao mover card." }, { status: 500 });
  }
}

type DeleteBody = { cardId?: number };

export async function DELETE(req: Request) {
  const user = requireAuth(req.headers);
  const userId = user?.id ? Number(user.id) : NaN;
  if (!Number.isFinite(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: DeleteBody;
  try {
    body = (await req.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ message: "JSON inválido." }, { status: 400 });
  }

  const cardId = body.cardId ? Number(body.cardId) : NaN;
  if (!Number.isFinite(cardId)) {
    return NextResponse.json({ message: "cardId é obrigatório." }, { status: 400 });
  }

  try {
    await getPool().query("DELETE FROM kanban_cards WHERE id = $1", [cardId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("kanban DELETE error", error);
    return NextResponse.json({ message: "Erro ao deletar card." }, { status: 500 });
  }
}
