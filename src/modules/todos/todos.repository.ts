import { Injectable } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { DrizzleService } from '@app/db';
import { todosTable } from '@app/db/schemas/todos';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class TodosRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: number, createTodoDto: CreateTodoDto) {
    return this.drizzle.db.insert(todosTable).values({
      ...createTodoDto,
      dueDate: createTodoDto.dueDate ? new Date(createTodoDto.dueDate) : null,
      userId,
      createdAt: new Date(),
    });
  }

  async findAll(userId: number) {
    return this.drizzle.db
      .select()
      .from(todosTable)
      .where(eq(todosTable.userId, userId))
      .orderBy(todosTable.createdAt);
  }

  async findOne(id: number, userId: number) {
    return this.drizzle.db
      .select()
      .from(todosTable)
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
      .limit(1);
  }

  async update(id: number, userId: number, updateTodoDto: UpdateTodoDto) {
    return this.drizzle.db
      .update(todosTable)
      .set({
        ...updateTodoDto,
        dueDate: updateTodoDto.dueDate
          ? new Date(updateTodoDto.dueDate)
          : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)));
  }

  async remove(id: number, userId: number) {
    return this.drizzle.db
      .update(todosTable)
      .set({ deletedAt: new Date() })
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)));
  }

  async exists(id: number, userId: number): Promise<boolean> {
    const todo = await this.drizzle.db
      .select({ id: todosTable.id })
      .from(todosTable)
      .where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)))
      .limit(1);

    return todo.length > 0;
  }
}
