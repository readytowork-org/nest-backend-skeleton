# NestJS Todo Application Documentation

Welcome to the documentation for the NestJS Todo application. This guide will help you understand the project structure, development workflow, and best practices.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Getting Started](#getting-started)
3. [Development Guide](#development-guide)
4. [API Documentation](#api-documentation)
5. [Additional Resources](#additional-resources)

## Project Structure

The application follows a domain-driven, modular structure with clear separation of concerns:

- [Folder Structure](./FOLDER_STRUCTURE.md) - Overview of the application's folder organization
- [Code Organization](./CODE_ORGANIZATION.md) - Detailed explanation of code organization patterns
- [Path Aliases](./PATH_ALIASES.md) - Guide to using path aliases for cleaner imports

## Getting Started

To get started with development:

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your environment variables
3. Install dependencies: `pnpm install`
4. Generate Prisma client: `pnpm prisma:generate`
5. Run database migrations: `pnpm prisma:migrate:dev`
6. Start the development server: `pnpm start:dev`

The API documentation is available at `http://localhost:3000/api` when the server is running.

## Development Guide

Follow these guides for developing features and maintaining the codebase:

- [Development Guide](./DEVELOPMENT_GUIDE.md) - Comprehensive guide to development workflow
- [Feature Workflow](./FEATURE_WORKFLOW.md) - Step-by-step guide for adding new features
- [Testing Strategy](./TESTING.md) - Guide to testing practices (unit, integration, e2e)

## API Documentation

The API is documented using Swagger/OpenAPI. To access the documentation:

1. Start the server: `pnpm start:dev`
2. Navigate to: `http://localhost:3000/api`

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/) - Official NestJS documentation
- [Prisma Documentation](https://www.prisma.io/docs/) - Official Prisma documentation
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Official TypeScript documentation
