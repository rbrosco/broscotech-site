const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:F2Wgk8qLrT7mXvYpQ9nCz3d@127.0.0.1:5432/postgres',
  });
  await client.connect();
  console.log('Connected.');
  
  try {
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name VARCHAR(255);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS final_date VARCHAR(20);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS language VARCHAR(50);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS framework VARCHAR(50);');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS integrations TEXT;');
    await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS admin_status VARCHAR(20);');
    console.log('Columns added successfully.');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    await client.end();
  }
}

migrate();
