const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgres://postgres:kR9tW2mX7vL4qZ1bP8jY3%40nM6x9Z4wK2hK9mR3vW2p_X7zL4fB9jT1nY8x6w-L3mK7pQ@127.0.0.1:5432/easyprojects_db',
  });
  await client.connect();
  console.log('Connected.');
  
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(100) PRIMARY KEY,
        user_id BIGINT,
        project_id BIGINT,
        message TEXT NOT NULL,
        card_id BIGINT,
        to_column_id BIGINT,
        read BOOLEAN DEFAULT false,
        timestamp BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table notifications created successfully.');
  } catch (err) {
    console.error('Error creating notifications table:', err);
  } finally {
    await client.end();
  }
}

migrate();
