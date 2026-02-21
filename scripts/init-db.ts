import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';

async function main() {
  const schemaPath = resolve(process.cwd(), 'scripts', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf8');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não definido. Ex: postgres://USER:PASS@HOST:5432/DB');
  }

  const client = new Client({ connectionString });
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
