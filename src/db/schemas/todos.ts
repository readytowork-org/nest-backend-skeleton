import { timestamps } from '@app/common/columns.helpers';
import {
  mysqlTable,
  int,
  serial,
  varchar,
  datetime,
  boolean,
} from 'drizzle-orm/mysql-core';
import { usersTable } from './users';

export const todosTable = mysqlTable('todos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  completed: boolean('completed').notNull().default(false),
  dueDate: datetime('due_date'),
  userId: int('user_id').references(() => usersTable.id),
  ...timestamps,
});
