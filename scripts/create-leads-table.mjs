/**
 * Script one-off: cria a tabela `leads` (captação de CTAs do site) se
 * ainda não existir. NUNCA usar TYPEORM_SYNCHRONIZE=true para isso —
 * ver AGENTS.md / lições registradas: o schema de produção usa tipos
 * legados (text/timestamp) e synchronize tenta ALTER TABLE destrutivo.
 *
 * Uso: node --env-file=.env scripts/create-leads-table.mjs
 */
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const client = connectionString
  ? new pg.Client({ connectionString })
  : new pg.Client({
      host: process.env.PGHOST || 'localhost',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'postgres',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    });

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT,
      interest_type TEXT NOT NULL,
      interest_id TEXT,
      interest_label TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  // Idempotente: se a tabela já existia sem alguma coluna, adiciona.
  await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest_type TEXT NOT NULL DEFAULT 'service';`);
  await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest_id TEXT;`);
  await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest_label TEXT;`);
  await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';`);
  await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS message TEXT;`);
  await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now();`);

  const check = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'leads'
    ORDER BY ordinal_position;
  `);
  console.log('Tabela leads OK. Colunas:');
  console.table(check.rows);

  await client.end();
}

main().catch((err) => {
  console.error('Falha ao criar tabela leads:', err);
  process.exit(1);
});
