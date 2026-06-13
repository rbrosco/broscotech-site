import { db } from './src/lib/drizzle';
import { users } from './src/lib/schema';
async function run() {
  const allUsers = await db.select().from(users).limit(5);
  console.log(allUsers);
  process.exit(0);
}
run();
