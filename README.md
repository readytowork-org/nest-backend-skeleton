# NestJS Skeleton

A robust and scalable NestJS application skeleton with built-in best practices, authentication, and database integration.

## 🚀 Features

- 🔐 Built-in authentication system
- 📦 MySQL database with Drizzle ORM
- 🧪 Comprehensive testing setup
- 📝 API documentation with Swagger
- 🔄 Hot-reload development environment
- 🎯 TypeScript support
- 📊 Database migrations and seeding
- 🛡️ Security best practices
- 🏥 Health check endpoints

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- Yarn or npm
- PostgreSQL (v14 or later)
- Git

## 🛠️ Installation

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

## 🏗️ Project Structure

```
├── api
│   ├── admin                             - admin modules
│   │   ├── admin.module..ts
│   │   ├── admin.routes.ts
│   │   └── staffs                        - staff child modules
│   │       ├── staff.controller.ts
│   │       ├── staff.module.ts
│   │       ├── staff.repository.ts
│   │       └── staff.service.ts
│   ├── auth                              - auth modules
│   │   ├── auth-response.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.dto.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── healthz                           - healthcheck modules
│   │   ├── healthz.controller.ts
│   │   └── healthz.module.ts
│   ├── index.ts
│   └── seed                              - seed modules
│       ├── seed.module.ts
│       └── seed.service.ts
├── app.controller.ts                     
├── app.module.ts
├── app.service.ts
├── common                                - common modules
│   ├── api_response
│   ├── constants
│   ├── database
│   ├── exception
│   ├── filters
│   ├── index.ts
│   ├── middleware
│   └── types
├── config     
│   ├── config-loader
│   ├── env
│   ├── index.ts
│   ├── interceptors
│   ├── logger
│   └── orm
├── db
│   ├── drizzle
│   ├── index.ts
│   ├── migrations
│   └── schemas
├── main.ts
├── services
│   ├── auth
│   │   ├── decorators
│   │   ├── guards
│   │   └── strategies
│   ├── email
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   ├── pagination
│   └── storage
└── utils            
```

## 🚀 Getting Started

### Development

```bash
# Start in development mode with hot-reload
yarn start:dev

# Start in debug mode
yarn start:debug

# Start in production mode
yarn build
yarn start:prod


#Using docker
docker compose up
```



### Database Management

```bash
# Generate migrations
yarn drizzle-kit generate:pg

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

## 📚 API Documentation

- Swagger UI is available at `/api/docs`
- API endpoints are documented with proper decorators and comments

## 🔧 Common Tasks

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

1. Update schema in `src/db/schemas`
2. Generate migration:

```bash
yarn drizzle-kit generate:pg
```

3. Run migration:

```bash
yarn migrate
```

## 🚨 Troubleshooting

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

## 📦 Deployment

1. Build the application:

```bash
yarn build
```

2. Set production environment variables

3. Start the server:

```bash
yarn start:prod
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📞 Support

For issues and questions:

- Create a GitHub issue
- Check existing documentation
- Review NestJS documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## dev env
https://readytowork.atlassian.net/wiki/spaces/RW/pages/3417276516/nestjs+backend+env+rtw-np

## dev URLS
health: https://nest-backend-skeleton-dot-rtw-np.as.r.appspot.com/api/v1/healthz
swagger : https://nest-backend-skeleton-dot-rtw-np.as.r.appspot.com/api