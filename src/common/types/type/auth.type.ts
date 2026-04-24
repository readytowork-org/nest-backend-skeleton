import { USER_ROLE, USER_ROLE_DB } from '@app/common/types/enum/user.role.enum';

export interface TokenPayload {
  sub: number; // user id
  membershipId: string | null; // member id for players
  email: string;
  name: string;
  role: USER_ROLE_DB;
  iat?: number; // issued at
  exp?: number; // expires at
}

export interface UserData {
  email: string;
  password: string;
  name: string;
  authProvider: AuthProvider;
  profilePicture: string | null;
  role: USER_ROLE;
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
  role: USER_ROLE;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role?: string;
  isActive?: number;
}

export type AuthProviderUser = {
  email: string;
  accessToken: string;
  providerId: string;
  name?: string;
  profilePicture?: string;
  role: USER_ROLE;
};

export type AuthProvider = 'local' | 'google';

export type XRequestedWithEnum = 'player';
