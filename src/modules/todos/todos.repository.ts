import { Injectable } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';

@Injectable()
export class TodosRepository {
  constructor() {} // private readonly logger: AppLogger, // private readonly db,

  async create(userId: number, createTodoDto: CreateTodoDto) {
    // return this.db.todo.create({
    //   data: {
    //     ...createTodoDto,
    //     dueDate: createTodoDto.dueDate ? new Date(createTodoDto.dueDate) : null,
    //     userId,
    //   },
    // });
  }

  async findAll(userId: number) {
    // return this.db.todo.findMany({
    //   where: { userId },
    //   orderBy: { createdAt: 'desc' },
    // });
  }

  async findOne(id: number, userId: number) {
    // return this.db.todo.findFirst({
    //   where: { id, userId },
    // });
  }

  async update(id: number, userId: number, updateTodoDto: UpdateTodoDto) {
    // return this.db.todo.update({
    //   where: { id },
    //   data: {
    //     ...updateTodoDto,
    //     dueDate: updateTodoDto.dueDate
    //       ? new Date(updateTodoDto.dueDate)
    //       : undefined,
    //   },
    // });
  }

  async remove(id: number, userId: number) {
    // return this.db.todo.delete({
    //   where: { id },
    // });
  }

  async exists(id: number, userId: number): Promise<boolean> {
    // const todo = await this.db.todo.findFirst({
    //   where: { id, userId },
    //   select: { id: true },
    // });
    // return !!todo;
    return true;
  }
}
