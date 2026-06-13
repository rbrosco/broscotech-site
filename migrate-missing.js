const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgres://postgres:kR9tW2mX7vL4qZ1bP8jY3%40nM6x9Z4wK2hK9mR3vW2p_X7zL4fB9jT1nY8x6w-L3mK7pQ@127.0.0.1:5432/easyprojects_db',
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
