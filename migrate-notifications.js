const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:F2Wgk8qLrT7mXvYpQ9nCz3d@127.0.0.1:5432/postgres',
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
