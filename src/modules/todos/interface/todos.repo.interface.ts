import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto';
import { Todo } from '../types/todo.types';

export interface TodoRepositoryInterface {
  create(userId: number, createTodoDto: CreateTodoDto): Promise<Todo>;
  findAll(userId: number): Promise<Todo[]>;
  findOne(id: number, userId: number): Promise<Todo[]>;
  update(
    id: number,
    userId: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<Todo>;
  remove(id: number, userId: number): Promise<void>;
  exists(id: number, userId: number): Promise<boolean>;
}
