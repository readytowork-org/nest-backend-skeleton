export enum UserRole {
  ADMIN = 'ADMIN',
  TELLER = 'TELLER',
  USER = 'USER',
}

export const USER_ROLES = [
  UserRole.ADMIN,
  UserRole.TELLER,
  UserRole.USER,
] as const;
