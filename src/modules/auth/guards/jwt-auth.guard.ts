import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLogger } from '../../../common/logger/app-logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly logger: AppLogger) {
    super();
  }

  canActivate(context: ExecutionContext) {
    this.logger.debug('Validating JWT token');
    return super.canActivate(context);
  }
}
