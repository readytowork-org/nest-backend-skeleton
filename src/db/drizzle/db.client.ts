import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schemas from '../schemas';

export type DBClient = MySql2Database<typeof schemas>;
