import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schemas from '@app/db/schemas';

// export type DBClient = MySql2Database<typeof schemas>;

export class DBClientObj extends MySql2Database<typeof schemas> {
}
