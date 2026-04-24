import { timestamp } from 'drizzle-orm/mysql-core';

export const timestamps = {
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .onUpdateNow()
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { mode: 'string' }),
};
