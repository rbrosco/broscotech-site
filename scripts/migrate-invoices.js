const { Client } = require('pg');

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL não definido. Ex: DATABASE_URL=postgres://USER:PASS@HOST:5432/DB node scripts/migrate-invoices.js');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(50) PRIMARY KEY,
        project_id BIGINT,
        client_name VARCHAR(255) NOT NULL,
        value INTEGER NOT NULL,
        issue_date VARCHAR(20) NOT NULL,
        due_date VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pendente',
        description TEXT,
        asaas_id VARCHAR(100),
        asaas_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Invoices table created successfully.");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

migrate();
