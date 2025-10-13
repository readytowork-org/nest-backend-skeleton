import { userSchema } from '@app/db/schemas/users';

export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;
