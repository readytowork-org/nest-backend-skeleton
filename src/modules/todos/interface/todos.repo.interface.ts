import { CreateTodoDto, UpdateTodoDto } from '../dto/todo.dto';

export interface TodoRepositoryInterface {
  create(userId: number, createTodoDto: CreateTodoDto): Promise<any>;
  findAll(userId: number): Promise<any[]>;
  findOne(id: number, userId: number): Promise<any | null>;
  update(
    id: number,
    userId: number,
    updateTodoDto: UpdateTodoDto,
  ): Promise<any>;
  remove(id: number, userId: number): Promise<any>;
  exists(id: number, userId: number): Promise<boolean>;
}
