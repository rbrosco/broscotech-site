require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      ALTER TABLE ai_messages
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    await client.query('COMMIT');
    console.log('Coluna image_url adicionada com sucesso na tabela ai_messages!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro na migração:', e);
  } finally {
    client.release();
    pool.end();
  }
}

run();
