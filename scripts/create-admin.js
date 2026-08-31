const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const pg = require('pg');
require('dotenv').config();

async function createAdmin() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
  
  const client = new pg.Client({ connectionString });
  await client.connect();

  const passwordHash = await bcrypt.hash('admin', 10);
  const now = new Date();

  // Check if admin user already exists
  const checkRes = await client.query(`SELECT id FROM "users" WHERE login = $1 OR email = $2`, ['admin', 'admin@easydev.com.br']);

  if (checkRes.rows.length > 0) {
    // Update existing user to admin with new password
    const userId = checkRes.rows[0].id;
    await client.query(`
      UPDATE "users" 
      SET name = $1, login = $2, email = $3, password = $4, role = $5, updated_at = $6 
      WHERE id = $7
    `, ['Administrador', 'admin', 'admin@easydev.com.br', passwordHash, 'admin', now, userId]);
    console.log(`[SUCCESS] Usuário admin (ID ${userId}) atualizado com sucesso!`);
  } else {
    // Insert new admin user
    const insertRes = await client.query(`
      INSERT INTO "users" (name, login, email, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, login, email, role
    `, ['Administrador', 'admin', 'admin@easydev.com.br', passwordHash, 'admin', now, now]);
    console.log(`[SUCCESS] Usuário admin criado com sucesso:`, insertRes.rows[0]);
  }

  await client.end();
}

createAdmin().catch((err) => {
  console.error('[ERROR] Falha ao criar admin:', err);
  process.exit(1);
});
