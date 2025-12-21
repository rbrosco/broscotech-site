import { drizzle } from 'drizzle-orm';
import { Pool } from 'pg';
import { getPool } from './db';

const pool = getPool();

export const db = drizzle(pool);