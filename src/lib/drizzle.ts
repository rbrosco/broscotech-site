import { drizzle } from 'drizzle-orm/node-postgres';
import { getPool } from './db';

const pool = getPool();

export const db = drizzle(pool);