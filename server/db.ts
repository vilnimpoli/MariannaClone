import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Тимчасово створюємо мок-об'єкти для тестування без бази даних
let pool: any;
let db: any;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using mock database for testing");
  
  // Мок-об'єкти для тестування
  pool = {
    query: async () => ({ rows: [] }),
    end: async () => {},
  };
  
  db = {
    select: () => ({ from: () => [] }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  };
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };