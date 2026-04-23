import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  tinyint,
  varchar,
} from 'drizzle-orm/mysql-core';
import { timestamps } from '@app/common';

export const staffs = mysqlTable('staffs', {
  id: int().autoincrement().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: mysqlEnum(['STAFF', 'ADMIN']).default('STAFF').notNull(),
  isActive: tinyint('is_active').default(0).notNull(),
  lastLoginAt: datetime('last_login_at', { mode: 'string' }),
  notes: text(),
  ...timestamps,
});
