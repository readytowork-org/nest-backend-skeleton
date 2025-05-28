import { UserRole } from '@app/modules/users/types/user.role.enum';
import { User } from '@app/modules/users/types/user.types';
export interface TokenPayload {
  sub: number;
  email: string;
  name: string | null;
  picture: string | null;
  role: UserRole;
}

export interface UserData {
  email: string;
  password: string;
  name: string;
  authProvider: 'local' | 'google' | 'amazon';
  profilePicture: string | null;
  role?: UserRole;
}

export type AuthenticatedUser = Pick<User, 'id' | 'email'> & {
  name: string | null;
  token: string;
  picture?: string | null;
  role: UserRole;
};

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface AmazonUser {
  email: string;
  name: string;
  userId: string;
  picture?: string;
  accessToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  name: string | null;
  picture: string | null;
  role: UserRole;
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
}

export type AuthProvider = 'local' | 'google' | 'amazon';
