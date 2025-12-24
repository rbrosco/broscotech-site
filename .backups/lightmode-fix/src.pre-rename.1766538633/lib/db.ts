import { Pool } from "pg";

declare global {
   
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new Pool({ connectionString });
  }

  const host = process.env.PGHOST;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;
  const portRaw = process.env.PGPORT;

  if (!host || !user || !password || !database) {
    throw new Error(
      "Missing database configuration. Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE (and optional PGPORT)."
    );
  }

  const port = portRaw ? Number(portRaw) : 5432;

  return new Pool({
    host,
    user,
    password,
    database,
    port,
  });
}

export function getPool(): Pool {
  if (globalThis.__pgPool) return globalThis.__pgPool;

  const pool = createPool();

  // In dev, cache across HMR / route reloads.
  if (process.env.NODE_ENV !== "production") {
    globalThis.__pgPool = pool;
  }

  return pool;
}
