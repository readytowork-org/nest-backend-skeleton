import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schemas from '@app/db/schemas';

export type DrizzleExecutor = MySql2Database<typeof schemas>;
