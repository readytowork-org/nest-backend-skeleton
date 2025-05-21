# Code Organization

This document outlines the code organization patterns and standards for the NestJS Todo application.

## Directory Structure

The application uses a domain-driven, modular approach to organize code:

```
src/
├── modules/      # Feature modules organized by domain
├── common/       # Shared utilities and components
├── core/         # Core functionality and infrastructure
├── config/       # Application configuration
```

## Module Structure

Each feature module follows a consistent structure:

```
modules/todos/
├── dto/                     # Data Transfer Objects
│   ├── create-todo.dto.ts
│   └── update-todo.dto.ts
├── repositories/            # Data access layer
│   └── todo.repository.ts
├── entities/                # Entity definitions (if needed)
├── interfaces/              # Type definitions and interfaces
├── todos.controller.ts      # HTTP endpoints
├── todos.service.ts         # Business logic
└── todos.module.ts          # Module definition
```

## Layer Responsibilities

The application follows a clear separation of concerns:

1. **Controller Layer**: Handles HTTP requests and responses

   - Input validation
   - Route handling
   - Response formatting

2. **Service Layer**: Contains business logic

   - Business rules
   - Data validation
   - Orchestration between different components

3. **Repository Layer**: Manages data access
   - Database operations
   - Query building
   - Data mapping

## Dependency Flow

Dependencies should flow inward:

- Controllers depend on Services
- Services depend on Repositories
- Repositories depend on the Database

## Import Standards

Use path aliases instead of relative paths for imports:

```typescript
// Good: Using path aliases
import { TodoRepository } from '@modules/todos/repositories/todo.repository';
import { AppLogger } from '@common/logger/app-logger.service';

// Bad: Using relative paths
import { TodoRepository } from '../../../modules/todos/repositories/todo.repository';
```

## Available Path Aliases

| Alias        | Maps to         | Purpose                    |
| ------------ | --------------- | -------------------------- |
| `@app/*`     | `src/*`         | Application-level imports  |
| `@modules/*` | `src/modules/*` | Feature module imports     |
| `@common/*`  | `src/common/*`  | Shared utility imports     |
| `@core/*`    | `src/core/*`    | Core functionality imports |
| `@config/*`  | `src/config/*`  | Configuration imports      |

## Example Usage

### Module Definition

```typescript
// src/modules/todos/todos.module.ts
import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TodoRepository } from './repositories/todo.repository';

@Module({
  controllers: [TodosController],
  providers: [TodosService, TodoRepository],
  exports: [TodosService],
})
export class TodosModule {}
```

### Service Implementation

```typescript
// src/modules/todos/todos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from './repositories/todo.repository';
import { CreateTodoDto, UpdateTodoDto } from './dto/todo.dto';
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

  // Other methods...
}
```

## Best Practices

1. **Single Responsibility Principle**: Each class should have a single responsibility
2. **Separation of Concerns**: Keep different layers separate
3. **Dependency Injection**: Use constructor injection for dependencies
4. **Use TypeScript Features**: Leverage types, interfaces, and enums for better code quality
5. **Consistent Naming**: Follow the naming conventions outlined in the Development Guide
6. **Path Aliases**: Use path aliases for imports to improve maintainability
