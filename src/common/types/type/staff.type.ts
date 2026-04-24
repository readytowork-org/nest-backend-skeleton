import { staffs } from '@app/db/schemas';

export type Staff = typeof staffs.$inferSelect;
export type NewStaff = typeof staffs.$inferInsert;
