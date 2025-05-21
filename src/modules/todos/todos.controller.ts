import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthUser } from '@modules/auth/interfaces/user.interface';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AppLogger } from '@common/logger/app-logger.service';

@ApiTags('Todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(TodosController.name);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({ status: 201, description: 'Todo successfully created' })
  create(@CurrentUser() user: AuthUser, @Body() createTodoDto: CreateTodoDto) {
    this.logger.log('Creating todo');
    return this.todosService.create(user.id, createTodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all todos for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all todos' })
  findAll(@CurrentUser() user: AuthUser) {
    this.logger.log('Finding all todos');
    return this.todosService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Return the todo' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    this.logger.log(`Finding todo with id: ${id}`);
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
    this.logger.log(`Updating todo with id: ${id}`);
    return this.todosService.update(+id, user.id, updateTodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiParam({ name: 'id', description: 'Todo ID' })
  @ApiResponse({ status: 200, description: 'Todo successfully deleted' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    this.logger.log(`Removing todo with id: ${id}`);
    return this.todosService.remove(+id, user.id);
  }
}
