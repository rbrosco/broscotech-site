const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgres://postgres:kR9tW2mX7vL4qZ1bP8jY3%40nM6x9Z4wK2hK9mR3vW2p_X7zL4fB9jT1nY8x6w-L3mK7pQ@127.0.0.1:5432/easyprojects_db',
  });
  
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
