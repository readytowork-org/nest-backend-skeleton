/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@app/modules/users/types/user.role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../types/auth.types';
import { AppLogger } from '@app/config/logger/app-logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(RolesGuard.name);
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

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
