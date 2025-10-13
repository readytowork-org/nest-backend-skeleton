export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export const USER_ROLES = [
  UserRole.ADMIN,
  UserRole.USER,
] as const;

export type RequestUserRole = (typeof USER_ROLES)[number];
