import { todosTable } from '@app/db/schemas/todos';

export type Todo = typeof todosTable.$inferSelect;
export type NewTodo = typeof todosTable.$inferInsert;
