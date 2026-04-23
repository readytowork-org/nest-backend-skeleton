import { DBClientObj } from '@config/orm/drizzle/db.client';

export const ORM_SERVICE = 'ORM_SERVICE';

export abstract class OrmService {
  db: DBClientObj;
}
