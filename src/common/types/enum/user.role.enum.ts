export enum USER_ROLE {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export type USER_ROLE_DB = 'PLAYER' | 'ADMIN' | 'STAFF';

export const USER_ROLES = [
  USER_ROLE.PLAYER,
  USER_ROLE.STAFF,
  USER_ROLE.ADMIN,
] as const;

export const APP_USER_ROLES = [USER_ROLE.STAFF, USER_ROLE.ADMIN] as const;

export type RequestUserRole = (typeof USER_ROLES)[number];
