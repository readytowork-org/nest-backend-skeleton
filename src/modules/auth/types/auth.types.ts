import { User, AuthProvider } from '@app/modules/users/types/user.types';

// Auth input types (replacing DTOs)
export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

// Auth response types
export type AuthenticatedUser = Pick<User, 'id' | 'email'> & {
  name: string | null;
  token: string;
  picture?: string | null;
};

// OAuth provider types
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

// JWT types
export interface JwtPayload {
  sub: number;
  email: string;
  name: string | null;
  picture: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
}

// User creation type for auth context
export type AuthUserData = {
  email: string;
  password: string;
  name: string;
  authProvider: AuthProvider;
  profilePicture: string | null;
};
