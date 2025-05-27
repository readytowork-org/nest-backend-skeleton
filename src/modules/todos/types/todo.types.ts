import { todoSchema } from '@app/db/schemas/todos';

export type Todo = typeof todoSchema.$inferSelect;
export type NewTodo = typeof todoSchema.$inferInsert;
