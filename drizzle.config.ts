import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

export default defineConfig({
  dialect: 'mysql', // 'mysql' | 'sqlite' | 'turso'
  schema: './src/db/schemas',
  out: './src/db/migrations',
  dbCredentials: databaseUrl
    ? { url: databaseUrl }
    : {
        host: dbHost!,
        port: parseInt(dbPort!, 10),
        user: dbUsername!,
        password: dbPassword!,
        database: dbName!,
      },
  verbose: true,
  strict: true,
});
