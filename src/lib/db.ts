import { Pool } from "pg";

declare global {
   
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return new Pool({ connectionString });
  }

  const host = process.env.PGHOST ?? process.env.POSTGRES_HOST;
  const user = process.env.PGUSER ?? process.env.POSTGRES_USER;
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DB;
  const portRaw = process.env.PGPORT ?? process.env.POSTGRES_PORT;

  if (!host || !user || !password || !database) {
    // During build phase there's no DB connection - pool will fail only on actual query
    return new Pool({
      host: host ?? 'localhost',
      user: user ?? 'postgres',
      password: password ?? '',
      database: database ?? 'postgres',
      port: portRaw ? Number(portRaw) : 5432,
    });
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
