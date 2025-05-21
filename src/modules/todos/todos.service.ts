import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { TodoRepository } from './repositories/todo.repository';
import { AppLogger } from '@common/logger/app-logger.service';

@Injectable()
export class TodosService {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(TodosService.name);
  }

  async create(userId: number, createTodoDto: CreateTodoDto) {
    this.logger.log(`Creating todo for user: ${userId}`);
    return this.todoRepository.create(userId, createTodoDto);
  }

  async findAll(userId: number) {
    this.logger.log(`Finding all todos for user: ${userId}`);
    return this.todoRepository.findAll(userId);
  }

  async findOne(id: number, userId: number) {
    this.logger.log(`Finding todo with id: ${id} for user: ${userId}`);

    const todo = await this.todoRepository.findOne(id, userId);

    if (!todo) {
      this.logger.warn(`Todo with id: ${id} not found`);
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  async update(id: number, userId: number, updateTodoDto: UpdateTodoDto) {
    this.logger.log(`Updating todo with id: ${id} for user: ${userId}`);

    // Check if todo exists and belongs to the user
    const exists = await this.todoRepository.exists(id, userId);

    if (!exists) {
      this.logger.warn(
        `Todo with id: ${id} not found or not owned by user: ${userId}`,
      );
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return this.todoRepository.update(id, userId, updateTodoDto);
  }

  async remove(id: number, userId: number) {
    this.logger.log(`Removing todo with id: ${id} for user: ${userId}`);

    // Check if todo exists and belongs to the user
    const exists = await this.todoRepository.exists(id, userId);

    if (!exists) {
      this.logger.warn(
        `Todo with id: ${id} not found or not owned by user: ${userId}`,
      );
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return this.todoRepository.remove(id, userId);
  }
}
