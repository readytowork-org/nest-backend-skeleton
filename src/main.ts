import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService, ValidationPipe, VersioningType } from '@nestjs/common';
import { AppLogger } from '@app/config/logger/app-logger.service';

async function bootstrap() {
  const bootstrapLogger = AppLogger.forRoot('NestJS-App') as LoggerService;
  const app = await NestFactory.create(AppModule, {
    logger: bootstrapLogger,
  });
  const logger = app.get(AppLogger);

  // Enable CORS
  app.enableCors();

  // global validation pipe
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

  // enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/',
    defaultVersion: 'v1',
  });

  if (process.env.NODE_ENV != 'production') {
    // swagger implementation
    const config = new DocumentBuilder()
      .setTitle(`${process.env.NODE_ENV} Nest App Backend`)
      .setDescription('The bare skeleton API description')
      .setVersion('1.0')
      .addTag('Healthz', 'Get the status of the server')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // logging the server status
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}
bootstrap();
