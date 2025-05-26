import { Injectable } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { DrizzleService } from '@app/db';
import { todosTable } from '@app/db/schemas/todos';
import { and, eq, isNull } from 'drizzle-orm';
import { TodoRepositoryInterface } from './interface/todos.repo.interface';
import { Todo } from './types/todo.types';

@Injectable()
export class TodosRepository implements TodoRepositoryInterface {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: number, createTodoDto: CreateTodoDto): Promise<Todo> {
    const result = await this.drizzle.db.insert(todosTable).values({
      ...createTodoDto,
      dueDate: createTodoDto.dueDate ? new Date(createTodoDto.dueDate) : null,
      userId,
      createdAt: new Date(),
    });

    // Get the created todo
    const todos = await this.drizzle.db
      .select()
      .from(todosTable)
      .where(eq(todosTable.id, result[0].insertId))
      .limit(1);

    return todos[0];
  }

  async findAll(userId: number): Promise<Todo[]> {
    return this.drizzle.db
      .select()
      .from(todosTable)
      .where(
        and(
          eq(todosTable.userId, userId),
          isNull(todosTable.deletedAt), // Only get non-deleted todos
        ),
      )
      .orderBy(todosTable.createdAt);
  }

  async findOne(id: number, userId: number): Promise<Todo[]> {
    return this.drizzle.db
      .select()
      .from(todosTable)
      .where(
        and(
          eq(todosTable.id, id),
          eq(todosTable.userId, userId),
          isNull(todosTable.deletedAt), // Only get non-deleted todos
        ),
      )
      .limit(1);
  }

  async update(
    id: number,
    userId: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    await this.drizzle.db
      .update(todosTable)
      .set({
        ...updateTodoDto,
        dueDate: updateTodoDto.dueDate
          ? new Date(updateTodoDto.dueDate)
          : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(todosTable.id, id),
          eq(todosTable.userId, userId),
          isNull(todosTable.deletedAt), // Only update non-deleted todos
        ),
      );

    // Get the updated todo
    const todos = await this.drizzle.db
      .select()
      .from(todosTable)
      .where(
        and(
          eq(todosTable.id, id),
          eq(todosTable.userId, userId),
          isNull(todosTable.deletedAt),
        ),
      )
      .limit(1);

    return todos[0];
  }

  // Soft delete (sets deletedAt timestamp)
  async remove(id: number, userId: number): Promise<void> {
    await this.drizzle.db
      .update(todosTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(todosTable.id, id),
          eq(todosTable.userId, userId),
          isNull(todosTable.deletedAt), // Only soft-delete non-deleted todos
        ),
      );
  }

  // Hard delete (actually removes from database) - optional method
  async hardDelete(id: number, userId: number): Promise<void> {
    await this.drizzle.db
      .delete(todosTable)
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)));
  }

  async exists(id: number, userId: number): Promise<boolean> {
    const todo = await this.drizzle.db
      .select({ id: todosTable.id })
      .from(todosTable)
      .where(
        and(
          eq(todosTable.id, id),
          eq(todosTable.userId, userId),
          isNull(todosTable.deletedAt), // Only check non-deleted todos
        ),
      )
      .limit(1);

    return todo.length > 0;
  }
}
