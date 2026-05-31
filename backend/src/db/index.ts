// import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database(process.env.DATABASE_URL || './local.db');

export const db = drizzle(sqlite);


