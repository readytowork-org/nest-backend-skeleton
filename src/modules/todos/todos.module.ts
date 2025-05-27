import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodoRepository } from './todo.repository';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodoRepository],
})
export class TodosModule {}
