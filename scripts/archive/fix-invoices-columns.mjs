/**
 * Script one-off: adiciona à tabela `invoices` (produção) as colunas que
 * a entity InvoiceEntity já espera mas que nunca foram criadas no banco
 * real — causando `column i.client_document does not exist` (42703) em
 * qualquer SELECT/INSERT feito pelo TypeORM em /api/invoices.
 *
 * NUNCA usar TYPEORM_SYNCHRONIZE=true para isso — ver AGENTS.md / lições
 * registradas: o schema de produção usa tipos legados e synchronize tenta
 * ALTER TABLE destrutivo em produção.
 *
 * Uso: node --env-file=.env scripts/fix-invoices-columns.mjs
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

  await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_document VARCHAR(20);`);
  await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);`);
  await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);`);
  await client.query(`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS asaas_customer_id VARCHAR(100);`);

  const check = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'invoices'
    ORDER BY ordinal_position;
  `);
  console.log('Tabela invoices corrigida. Colunas atuais:');
  console.table(check.rows);

  await client.end();
}

main().catch((err) => {
  console.error('Falha ao corrigir tabela invoices:', err);
  process.exit(1);
});
