import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, LoggerService } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from '@common/logger/app-logger.service';
import * as session from 'express-session';

async function bootstrap() {
  // Create a logger instance for bootstrapping
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const bootstrapLogger = AppLogger.forRoot('NestJS-App') as LoggerService;

  // Use the bootstrap logger for app creation
  const app = await NestFactory.create(AppModule, {
    logger: bootstrapLogger,
  });

  // Get the application logger instance for the running app
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const logger = app.get(AppLogger);

  // Enable CORS
  app.enableCors();

  // Add express-session middleware for Passport authentication
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000 * 60 * 24, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('NestJS Todo API with JWT authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Use the logger to log startup information
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  logger.log(`Application is running on: http://localhost:${port}`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}

// Start the application
bootstrap();
