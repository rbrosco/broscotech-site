import 'dotenv/config';
import { getPool } from './src/lib/db.ts';

async function test() {
  try {
    const pool = getPool();
    const res = await pool.query('SELECT 1 as result');
    console.log('OK! Query result:', res.rows);
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e);
    process.exit(1);
  }
}

test();
