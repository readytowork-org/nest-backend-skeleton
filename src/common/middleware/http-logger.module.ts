import { Module, MiddlewareConsumer } from '@nestjs/common';
import { HttpLoggerMiddleware } from './http-logger.middleware';

@Module({
  providers: [HttpLoggerMiddleware],
  exports: [HttpLoggerMiddleware],
})
export class HttpLoggerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
