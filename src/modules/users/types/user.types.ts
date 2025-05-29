import { userSchema } from '@app/db/schemas/users';
import { UserRole } from './user.role.enum';

export type User = typeof userSchema.$inferSelect;
export type NewUser = typeof userSchema.$inferInsert;

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
  email: string;
  name: string;
  auth_provider: string;
  profile_picture: string | null;
  role: UserRole;
}
