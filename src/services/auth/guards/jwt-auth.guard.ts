import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLogger } from '@config/logger/app-logger.service';
import { Reflector } from '@nestjs/core';
import { TokenExpiredError } from '@nestjs/jwt';
import {
  AccountSuspendedException,
  ErrorMessages,
  ExpiredTokenException,
} from '@app/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthUser } from '@common/types/type/auth.type';

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

  handleRequest<TUser = AuthUser>(
    err: any,
    user: AuthUser | null,
    info: any,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw new ExpiredTokenException(ErrorMessages.EXPIRED_TOKEN);
    }

    if (!user) {
      throw new UnauthorizedException('Token Validation failed');
    }

    if (user.isActive === 0) {
      this.logger.warn(
        `Access denied for suspended/inactive player: ${user.id} (${user.email})`,
      );
      throw new AccountSuspendedException(ErrorMessages.ACCOUNT_SUSPENDED);
    }

    return user as TUser;
  }
}
