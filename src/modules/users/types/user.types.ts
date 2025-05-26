import { usersTable } from '@app/db/schemas/users';

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

// Explicit interface for better type safety - matching the actual database schema
export interface UserEntity {
  id: number;
  email: string;
  password: string;
  name: string;
  authProvider: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Safe user type for API responses (without sensitive data)
export interface SafeUser {
  id: number;
  email: string;
  name: string;
  authProvider: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
