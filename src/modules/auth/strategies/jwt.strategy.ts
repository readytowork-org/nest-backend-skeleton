import { AppLogger } from '@app/config/logger/app-logger.service';
import { UsersService } from '@app/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, JwtPayload } from '../types/auth.types';
import { UserRole } from '@app/modules/users/types/user.role.enum';
import { envVars } from '@app/config/env/env.validation';

interface ValidatedUser {
  id: number;
  email: string;
  name: string;
  authProvider: string;
  profilePicture: string | null;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly logger: AppLogger,

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

    this.logger.setContext(JwtStrategy.name);
    this.logger.log('JWT authentication strategy initialized');
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    try {
      this.logger.debug(`Validating JWT payload for user: ${payload.email}`);

      // For refresh tokens, we need to fetch user from database
      // For access tokens, we can use the payload data directly if it's complete
      if (!payload.name || !payload.authProvider || !payload.role) {
        // Incomplete payload, fetch from database
        const userResult = await this.userService.findUnique(payload.email);

        if (!userResult) {
          this.logger.warn(
            `JWT validation failed - user not found for email: ${payload.email} (ID: ${payload.sub})`,
          );
          throw new UnauthorizedException('Invalid token - user not found');
        }

        const user = userResult as ValidatedUser;

        this.logger.debug(
          `JWT validated successfully for user: ${user.id} (${user.email}) with role: ${user.role}`,
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }

      // Complete payload from access token
      this.logger.debug(
        `JWT validated successfully for user: ${payload.sub} (${payload.email}) with role: ${payload.role}`,
      );

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
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
