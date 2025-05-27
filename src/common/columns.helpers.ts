import { timestamp } from 'drizzle-orm/mysql-core';

export const timestamps = {
  updatedAt: timestamp('updated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};
