import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';

config({ path: resolve(process.cwd(), '.env') });

function getConnectionConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) return { connectionString };

  const host = process.env.PGHOST ?? process.env.POSTGRES_HOST ?? 'localhost';
  const user = process.env.PGUSER ?? process.env.POSTGRES_USER;
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DB;
  const portRaw = process.env.PGPORT ?? process.env.POSTGRES_PORT;

  if (!user || !password || !database) {
    throw new Error(
      'Missing database configuration. Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE (or POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB).'
    );
  }

  return {
    host,
    user,
    password,
    database,
    port: portRaw ? Number(portRaw) : 5432,
  };
}

async function main() {
  const schemaPath = resolve(process.cwd(), 'scripts', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');

  const client = new Client(getConnectionConfig());
  await client.connect();

  try {
    await client.query(sql);
    console.log('DB inicializado com sucesso:', schemaPath);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
