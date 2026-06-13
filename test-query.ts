import 'dotenv/config';
import { db } from './src/lib/drizzle.ts';
import { projects } from './src/lib/schema.ts';
import { desc } from 'drizzle-orm';

async function main() {
  try {
    const list = await db.select().from(projects).orderBy(desc(projects.updated_at)).limit(1);
    console.log('Query result:', list);
    process.exit(0);
  } catch (err) {
    console.error('Error executing query:', err);
    process.exit(1);
  }
}

main();
