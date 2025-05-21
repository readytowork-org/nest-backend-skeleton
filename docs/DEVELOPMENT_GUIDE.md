# Development Guide

This document provides a comprehensive guide to the development workflow, project structure, and best practices for the NestJS Todo application.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Workflow](#development-workflow)
3. [Adding a New Module](#adding-a-new-module)
4. [Import Conventions](#import-conventions)
5. [Coding Standards](#coding-standards)
6. [Testing](#testing)
7. [Documentation](#documentation)

## Project Structure

The application follows a modular, domain-driven structure with clear separation of concerns:

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module of the application
├── modules/                         # Feature modules
│   ├── todos/                       # Todo feature module
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── entities/                # Entity definitions (if any)
│   │   ├── repositories/            # Repository layer
│   │   ├── todos.controller.ts      # HTTP controller
│   │   ├── todos.service.ts         # Business logic
│   │   └── todos.module.ts          # Module definition
│   ├── auth/                        # Authentication module
│   └── users/                       # User module
├── common/                          # Shared resources
│   ├── decorators/                  # Custom decorators
│   ├── filters/                     # Exception filters
│   ├── guards/                      # Global guards
│   ├── interceptors/                # Global interceptors
│   ├── interfaces/                  # Common interfaces
│   ├── middleware/                  # Custom middleware
│   ├── pipes/                       # Custom pipes
│   └── logger/                      # Logger implementation
├── config/                          # Configuration
│   ├── env.validation.ts            # Environment validation
├── core/                            # Core functionality
│   ├── database/                    # Database related code
│   │   └── prisma/                  # Prisma ORM
│   ├── exceptions/                  # Custom exceptions
│   └── utilities/                   # Common utility functions
└── prisma/                          # Prisma schema and migrations
```

## Development Workflow

### Setting Up Your Development Environment

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Generate Prisma client:
   ```bash
   pnpm prisma:generate
   ```
5. Run database migrations:
   ```bash
   pnpm prisma:migrate:dev
   ```
6. Start the development server:
   ```bash
   pnpm start:dev
   ```

### Development Process

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Implement your changes** following the project structure and coding standards

3. **Write tests** for your implementation

4. **Run linting** to ensure code quality:

   ```bash
   pnpm lint
   ```

5. **Run tests** to ensure functionality:

   ```bash
   pnpm test
   ```

6. **Submit a pull request** for code review

## Adding a New Module

When adding a new feature module, follow these steps:

1. **Create the module structure** following the domain-driven design pattern:

   ```bash
   mkdir -p src/modules/your-module/{dto,repositories,entities}
   ```

2. **Create the main module files**:

   - `your-module.module.ts`: Module definition
   - `your-module.controller.ts`: HTTP endpoints
   - `your-module.service.ts`: Business logic

3. **Define your DTOs** in the `dto` folder for request validation and documentation

4. **Implement your repositories** in the `repositories` folder for data access

5. **Register your module** in the main `app.module.ts` file

### Example: Creating a Comments Module

Here's an example of adding a new "comments" module for todo items:

1. First, create the module structure:

   ```bash
   mkdir -p src/modules/comments/{dto,repositories}
   ```

2. Create the module files:

   ```bash
   touch src/modules/comments/comments.module.ts
   touch src/modules/comments/comments.controller.ts
   touch src/modules/comments/comments.service.ts
   touch src/modules/comments/dto/comment.dto.ts
   touch src/modules/comments/repositories/comment.repository.ts
   ```

3. Implement the module definition in `comments.module.ts`:

   ```typescript
   import { Module } from '@nestjs/common';
   import { CommentsController } from './comments.controller';
   import { CommentsService } from './comments.service';
   import { CommentRepository } from './repositories/comment.repository';

   @Module({
     controllers: [CommentsController],
     providers: [CommentsService, CommentRepository],
     exports: [CommentsService],
   })
   export class CommentsModule {}
   ```

4. Register the module in `app.module.ts`:

   ```typescript
   import { CommentsModule } from '@modules/comments/comments.module';

   @Module({
     imports: [
       // ... other modules
       CommentsModule,
     ],
   })
   export class AppModule {}
   ```

## Import Conventions

Use path aliases for clean and maintainable imports:

```typescript
// Correct (using path aliases)
import { CommentsService } from '@modules/comments/comments.service';
import { AppLogger } from '@common/logger/app-logger.service';
import { PrismaService } from '@core/database/prisma/prisma.service';

// Incorrect (using relative paths)
import { CommentsService } from '../../modules/comments/comments.service';
import { AppLogger } from '../../../common/logger/app-logger.service';
```

The following path aliases are available:

| Alias        | Points to       | Use for                  |
| ------------ | --------------- | ------------------------ |
| `@app/*`     | `src/*`         | Root application imports |
| `@modules/*` | `src/modules/*` | Feature modules          |
| `@common/*`  | `src/common/*`  | Common/shared utilities  |
| `@core/*`    | `src/core/*`    | Core functionality       |
| `@config/*`  | `src/config/*`  | Configuration            |

## Coding Standards

- Follow ESLint and Prettier rules defined in the project
- Use TypeScript's strong typing system for all variables and functions
- Document public APIs and complex functions with JSDoc comments
- Follow the Single Responsibility Principle (SRP)
- Use Dependency Injection for component dependencies
- Make use of NestJS decorators for defining routes, validation, etc.

### Naming Conventions

- **Files**: Use kebab-case for file names (`todo.repository.ts`, `create-todo.dto.ts`)
- **Classes**: Use PascalCase for class names (`TodoService`, `CreateTodoDto`)
- **Methods & Properties**: Use camelCase for methods and properties (`findAllByUser`, `userId`)
- **Interfaces**: Use PascalCase prefixed with `I` (`ITodoService`, `IUser`)
- **Enums**: Use PascalCase (`TodoStatus`, `UserRole`)

## Testing

The project uses Jest for testing:

- **Unit tests**: Tests individual components in isolation
- **Integration tests**: Tests component interactions
- **E2E tests**: Tests the entire application flow

Follow these naming conventions for test files:

- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

## Documentation

### API Documentation

The API is documented using Swagger/OpenAPI. To access the documentation:

1. Start the server: `pnpm start:dev`
2. Navigate to: `http://localhost:3000/api`

### Code Documentation

- Use JSDoc comments for functions, classes, and methods
- Document parameters, return types, and potential exceptions
- Keep documentation up to date with code changes

### Adding Swagger Documentation

Use NestJS Swagger decorators to document your APIs:

```typescript
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    // Implementation
  }
}
```

### Contributing to Documentation

If you modify existing modules or add new ones, make sure to:

1. Update or add API documentation using Swagger decorators
2. Update relevant README or markdown files
3. Document complex business logic with inline comments
4. Update this development guide if necessary
