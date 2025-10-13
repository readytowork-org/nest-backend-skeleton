import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLogger } from '../../../config/logger/app-logger.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenExpiredError } from '@nestjs/jwt';
import { ErrorMessages, ExpiredTokenException } from '@app/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly logger: AppLogger,
    private reflector: Reflector,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) return true;

    this.logger.debug('Validating JWT token');

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (info instanceof TokenExpiredError) {
      throw new ExpiredTokenException(ErrorMessages.EXPIRED_TOKEN);
    }
    if (err || !user) {
      throw new UnauthorizedException('Token Validation failed');
    }
    return user;
  }
}
