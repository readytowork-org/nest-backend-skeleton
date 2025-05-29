import { UserRole } from '@app/modules/users/types/user.role.enum';
import { User, SafeUser } from '@app/modules/users/types/user.types';

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
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  sub: number; // user id
  email: string;
  tokenType: 'refresh';
  iat?: number; // issued at
  exp?: number; // expires at
}

export interface UserData {
  email: string;
  password: string;
  name: string;
  authProvider: 'local' | 'google' | 'amazon';
  profilePicture: string | null;
  role: UserRole;
}

export type AuthenticatedUser = Pick<User, 'id' | 'email'> & {
  name: string | null;
  token: string;
  picture?: string | null;
  role: UserRole;
};

export interface LoginResponseData extends SafeUser {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
  statusCode: number;
}

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

export type AuthProvider = 'local' | 'google' | 'amazon';
