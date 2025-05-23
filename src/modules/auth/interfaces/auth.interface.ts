export type AuthenticatedUser = Pick<any, 'id' | 'email'> & {
  name: string | null;
  token: string;
  picture?: string | null;
};

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
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
}
