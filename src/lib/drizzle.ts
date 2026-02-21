import { drizzle } from 'drizzle-orm/node-postgres';
import { getPool } from './db';

let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDbInstance(): ReturnType<typeof drizzle> {
	if (!dbInstance) {
		dbInstance = drizzle(getPool());
	}

	return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop, receiver) {
		return Reflect.get(getDbInstance(), prop, receiver);
	},
});