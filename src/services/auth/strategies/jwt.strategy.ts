import { AppLogger } from '@app/config/logger/app-logger.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envVars } from '@app/config/env/env.validation';
import { AuthUser, JwtPayload, USER_ROLE } from '@app/common/types';
import { StaffService } from '@app/api/admin/staffs/staff.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly logger: AppLogger,
    private readonly staffService: StaffService,
  ) {
    const jwtSecret = envVars.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    this.logger.log(
      'JWT authentication strategy initialized',
      JwtStrategy.name,
    );
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    try {
      this.logger.debug(
        `Validating JWT payload for user: ${payload.email}`,
        JwtStrategy.name,
      );
      const userResult = await this.staffService.findByEmail(payload.email);
      if (!userResult) {
        this.logger.warn(
          `JWT validation failed - user not found: (email: ${payload.email})`,
          JwtStrategy.name,
        );
        throw new UnauthorizedException('Invalid token - user not found');
      }
      this.logger.debug(
        `JWT validated successfully for user: ${payload.sub} (${payload.email}) with role: ${payload.role}`,
        JwtStrategy.name,
      );
      return {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        role: userResult.role,
        isActive: userResult.isActive,
      } as AuthUser;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `JWT validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
