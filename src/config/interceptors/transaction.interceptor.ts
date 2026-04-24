import { AppLogger } from '@app/config';
import { OrmService } from '@app/config/orm/orm.interface';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { MySql2Transaction } from 'drizzle-orm/mysql2';
import { Observable, from, firstValueFrom } from 'rxjs';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly orm: OrmService,
    private readonly logger: AppLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return from(
      this.orm.db.transaction(async (trx: MySql2Transaction<any, any>) => {
        const request = context.switchToHttp().getRequest();
        request.trx = trx; // attach tx to request
        try {
          const result: any = await firstValueFrom(next.handle());
          this.logger.log('Transaction committed');
          return result;
        } catch (error) {
          this.logger.log('Transaction rolled back', error as string);
          throw error;
        }
      }),
    );
  }
}
