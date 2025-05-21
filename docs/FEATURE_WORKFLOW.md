# Feature Development Workflow

This document provides a step-by-step guide for adding new features to the NestJS Todo application.

## Quick Reference

1. [Planning](#1-planning)
2. [Implementation](#2-implementation)
3. [Testing](#3-testing)
4. [Documentation](#4-documentation)
5. [Code Review](#5-code-review)

## 1. Planning

### 1.1 Define Feature Requirements

Before writing any code, clearly define:

- What is the feature supposed to do?
- Who will use it?
- What are the inputs and expected outputs?
- What are the edge cases and error scenarios?

### 1.2 Design Database Schema

If your feature requires database changes:

- Identify which tables/models need to be created or modified
- Define relationships between entities
- Consider indexing for performance

### 1.3 Create API Specification

Define your API endpoints:

- HTTP methods (GET, POST, PATCH, DELETE)
- Route paths
- Request parameters (path, query, body)
- Response structures and status codes
- Authentication and authorization requirements

## 2. Implementation

### 2.1 Create a Feature Branch

Start by creating a new branch from `main`:

```bash
git checkout -b feature/your-feature-name
```

### 2.2 Create Directory Structure

Follow the established pattern for your new module:

```bash
mkdir -p src/modules/your-module/{dto,repositories,entities}
```

### 2.3 Implement Data Transfer Objects (DTOs)

Create DTOs for input validation and API documentation:

```typescript
// src/modules/your-module/dto/create-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'New Item', description: 'The name of the item' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ example: 'Item description', required: false })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean' })
  active?: boolean;
}
```

### 2.4 Implement Repository Layer

Create repositories for data access:

```typescript
// src/modules/your-module/repositories/item.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma/prisma.service';
import { CreateItemDto, UpdateItemDto } from '../dto/item.dto';
import { AppLogger } from '@common/logger/app-logger.service';

@Injectable()
export class ItemRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  async create(userId: number, createItemDto: CreateItemDto) {
    this.logger.debug(`Creating item for user: ${userId}`);
    return this.prisma.item.create({
      data: {
        ...createItemDto,
        userId,
      },
    });
  }

  // Other CRUD operations...
}
```

### 2.5 Implement Service Layer

Create services for business logic:

```typescript
// src/modules/your-module/items.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from './repositories/item.repository';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { AppLogger } from '@common/logger/app-logger.service';

@Injectable()
export class ItemsService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ItemsService.name);
  }

  async create(userId: number, createItemDto: CreateItemDto) {
    this.logger.log(`Creating item for user: ${userId}`);
    return this.itemRepository.create(userId, createItemDto);
  }

  // Other business logic methods...
}
```

### 2.6 Implement Controller Layer

Create controllers for handling HTTP requests:

```typescript
// src/modules/your-module/items.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/item.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { AuthUser } from '@modules/auth/interfaces/user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppLogger } from '@common/logger/app-logger.service';

@ApiTags('Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(ItemsController.name);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item successfully created' })
  create(@CurrentUser() user: AuthUser, @Body() createItemDto: CreateItemDto) {
    this.logger.log('Creating item');
    return this.itemsService.create(user.id, createItemDto);
  }

  // Other controller methods...
}
```

### 2.7 Create Module Definition

Create a module to bundle everything together:

```typescript
// src/modules/your-module/items.module.ts
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ItemRepository } from './repositories/item.repository';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, ItemRepository],
  exports: [ItemsService],
})
export class ItemsModule {}
```

### 2.8 Register Module in App Module

Add your module to the main app module:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from '@modules/your-module/items.module';
// Other imports...

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Other modules...
    ItemsModule,
  ],
  // ...
})
export class AppModule {}
```

## 3. Testing

### 3.1 Write Unit Tests

Create unit tests for each component:

```typescript
// src/modules/your-module/items.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemRepository } from './repositories/item.repository';
import { AppLogger } from '@common/logger/app-logger.service';
import { NotFoundException } from '@nestjs/common';

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: ItemRepository;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn(),
  };

  const mockLogger = {
    setContext: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: ItemRepository, useValue: mockRepository },
        { provide: AppLogger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<ItemRepository>(ItemRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test methods...
});
```

### 3.2 Write E2E Tests

Create end-to-end tests for API endpoints:

```typescript
// test/items.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@core/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Items Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    // Setup test data and authentication
    // ...
  });

  afterAll(async () => {
    // Clean up test data
    // ...
    await app.close();
  });

  it('/items (POST) should create a new item', async () => {
    return request(app.getHttpServer())
      .post('/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Item',
        description: 'Test Description',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Item');
      });
  });

  // Other tests...
});
```

### 3.3 Run Tests

Execute your tests to ensure everything works correctly:

```bash
# Run unit tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## 4. Documentation

### 4.1 Add Swagger Documentation

Make sure all API endpoints are properly documented:

- Use `@ApiTags` to group endpoints
- Use `@ApiOperation` to describe what each endpoint does
- Use `@ApiResponse` to document possible responses
- Use `@ApiParam` to document path parameters
- Use `@ApiQuery` to document query parameters
- Use `@ApiBody` to document request bodies

### 4.2 Update Technical Documentation

Update or create markdown files in the `docs` directory:

- Document new entities and their relationships
- Document new API endpoints
- Document any new configuration parameters
- Document any special business rules or gotchas

## 5. Code Review

### 5.1 Self-Review

Before submitting your code for review:

- Run linting: `pnpm lint`
- Run tests: `pnpm test`
- Check test coverage: `pnpm test:cov`
- Make sure all API endpoints are documented
- Ensure code follows project standards

### 5.2 Submit Pull Request

Create a pull request with a clear description:

- **Title**: Brief but descriptive
- **Description**: What the feature does, any significant architecture decisions, potential risks
- **Testing**: Instructions for manual testing
- **Checklist**: Tests written, code linted, documentation updated

### 5.3 Address Feedback

After code review:

- Address all feedback promptly
- Re-request review after making changes
- Work with the team to resolve any disagreements

## Example: Adding a Comments Feature

Here's a concrete example of adding a comments feature for todos:

### Step 1: Define Feature

- Allow users to add comments to todos
- Only the todo owner can add comments
- Comments have text content, creation date, and user ID
- Comments can be listed, created, and deleted

### Step 2: Create Database Schema

In Prisma schema:

```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  todoId    Int
  userId    Int
  todo      Todo     @relation(fields: [todoId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])

  @@index([todoId])
  @@index([userId])
}

model Todo {
  // existing fields
  comments Comment[]
}
```

### Step 3: Implement Feature

Follow the steps above to create:

- DTOs for creating comments
- Comments repository
- Comments service
- Comments controller
- Comments module
- Tests and documentation

### Step 4: Register Module

Add the CommentsModule to the app.module.ts imports.

### Step 5: Deploy and Monitor

After approval, merge to main and monitor for any issues in production.
