import { timestamps } from '@app/common/columns.helpers';
import {
  mysqlTable,
  int,
  varchar,
  datetime,
  boolean,
} from 'drizzle-orm/mysql-core';
import { userSchema } from './users';

export const todoSchema = mysqlTable('todos', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  completed: boolean('completed').notNull().default(false),
  dueDate: datetime('due_date'),
  userId: int('user_id').references(() => userSchema.id),
  ...timestamps,
});
