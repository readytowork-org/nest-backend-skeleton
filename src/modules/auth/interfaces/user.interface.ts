export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
}
