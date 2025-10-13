import { UserRole } from '@app/common/types/enum/user.role.enum';

export interface TokenPayload {
  sub: number; // user id
  email: string;
  name: string;
  authProvider: string;
  profilePicture: string | null;
  role: UserRole;
  iat?: number; // issued at
  exp?: number; // expires at
}

export interface UserData {
  email: string;
  password: string;
  name: string;
  authProvider: 'local' | 'google' | 'amazon' | 'line';
  profilePicture: string | null;
  role: UserRole;
  phoneNumber?: string;
}

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  authProvider: string;
  profilePicture: string | null;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
}

export type AuthProvider = 'local' | 'google' | 'amazon' | 'line';
