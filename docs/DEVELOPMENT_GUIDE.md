# Development Guide

## Prerequisites

- Node.js (v18 or later)
- Yarn or npm
- PostgreSQL (v14 or later)
- Git

## Initial Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd nestjs-skeleton
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Configure your `.env` file with:

- Database credentials
- JWT secret
- Other environment-specific variables

## Development Workflow

### Starting the Development Server

```bash
# Start in development mode with hot-reload
yarn start:dev

# Start in debug mode
yarn start:debug

# Start in production mode
yarn build
yarn start:prod
```

### Database Management

```bash
# Generate migrations
yarn drizzle-kit generate

# Run migrations
yarn migrate

# Seed the database
yarn seed
```

### Testing

```bash
# Run unit tests
yarn test

# Run e2e tests
yarn test:e2e

# Generate test coverage
yarn test:cov
```

### Code Quality

```bash
# Lint code
yarn lint

# Format code
yarn format

# Check types
yarn type-check
```

## Project Structure

```
src/
├── config/         # Configuration files
├── modules/        # Feature modules
├── common/         # Shared utilities
├── database/       # Database configuration
└── main.ts         # Application entry point
```

## Best Practices

1. **Code Organization**

   - Keep modules focused and single-responsibility
   - Use path aliases for imports
   - Follow the established folder structure

2. **Testing**

   - Write unit tests for services and utilities
   - Write e2e tests for API endpoints
   - Maintain good test coverage

3. **Error Handling**

   - Use custom exception filters
   - Implement proper error logging
   - Return consistent error responses

4. **Security**
   - Never commit sensitive data
   - Use environment variables for secrets
   - Implement proper authentication/authorization

## Common Tasks

### Adding a New Module

1. Generate module:

```bash
nest g module modules/your-module
```

2. Create necessary files:

```bash
nest g controller modules/your-module
nest g service modules/your-module
```

3. Update module configuration in `src/config/modules.config.ts`

### Database Changes

1. Update schema in `src/database/schema`
2. Generate migration:

```bash
yarn drizzle-kit generate
```

3. Run migration:

```bash
yarn migrate
```

### API Documentation

- Swagger UI is available at `/api/docs`
- Update DTOs with proper decorators
- Add descriptive comments for endpoints

## Troubleshooting

### Common Issues

1. **Database Connection**

   - Check PostgreSQL is running
   - Verify credentials in `.env`
   - Check database exists

2. **Port Conflicts**

   - Check if port 3000 is available
   - Update port in `.env` if needed

3. **Type Errors**
   - Run `yarn type-check`
   - Update TypeScript types
   - Check for missing dependencies

## Deployment

1. Build the application:

```bash
yarn build
```

2. Set production environment variables

3. Start the server:

```bash
yarn start:prod
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Support

For issues and questions:

- Create a GitHub issue
- Check existing documentation
- Review NestJS documentation
