/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLE } from '@common/types/enum/user.role.enum';
import { ROLES_KEY } from '@app/services/auth/decorators/roles.decorator';
import { AuthUser } from '@common/types/type/auth.type';
import { AppLogger } from '@config/logger/app-logger.service';
import { IS_PUBLIC_KEY } from '@app/services/auth/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(RolesGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) return true;

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      this.logger.warn('No user found in request for role validation');
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      this.logger.warn(`User ${user.id} has no role assigned`);
      throw new ForbiddenException('User has no role assigned');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.id} with role ${user.role} attempted to access resource requiring roles: ${requiredRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    this.logger.debug(
      `User ${user.id} with role ${user.role} granted access to resource requiring roles: ${requiredRoles.join(', ')}`,
    );

    return true;
  }
}
