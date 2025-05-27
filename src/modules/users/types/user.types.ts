import { userSchema } from '@app/db/schemas/users';

// Use Drizzle's built-in type inference - these are all we need
export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;

// Derived types for different use cases
export type CreateUserInput = Omit<
  NewUser,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
export type UpdateUserInput = Partial<Omit<NewUser, 'id' | 'createdAt'>>;
export type SafeUser = Omit<User, 'password' | 'deletedAt'>;

// Auth provider type from schema
export type AuthProvider = 'local' | 'google' | 'amazon';
