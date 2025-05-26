import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { AuthUser } from '../auth/interfaces/auth.interface';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth.types';

@Controller('todos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'Todo successfully created' })
  create(@CurrentUser() user: AuthUser, @Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(user.id, createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all todos' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.todosService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Return the todo' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.todosService.findOne(+id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Todo successfully updated' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(+id, user.id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a todo (sets deletedAt timestamp)' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Todo successfully soft deleted' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.todosService.remove(+id, user.id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a todo from database' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Todo permanently deleted' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  hardDelete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.todosService.hardDelete(+id, user.id);
  }
}
