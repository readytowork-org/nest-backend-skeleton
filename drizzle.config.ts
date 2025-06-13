import { defineConfig } from 'drizzle-kit';
import configService from './src/config/config-loader';

const dbPort = configService.get<string>('DB_PORT');
const dbUsername = configService.get<string>('DB_USERNAME');
const dbPassword = configService.get<string>('DB_PASSWORD');
const dbName = configService.get<string>('DB_NAME');
const dbHost =
  configService.get<string>('ENVIRONMENT') != 'local'
    ? `/cloudsql/${configService.get<string>('DB_HOST')}`
    : configService.get<string>('DB_HOST');

export default defineConfig({
  dialect: 'mysql', // 'mysql' | 'sqlite' | 'turso'
  schema: './src/db/schemas',
  out: './src/db/migrations',
  dbCredentials: {
    host: dbHost!,
    port: parseInt(dbPort!, 10),
    user: dbUsername!,
    password: dbPassword!,
    database: dbName!,
  },
  verbose: true,
  strict: true,
});
