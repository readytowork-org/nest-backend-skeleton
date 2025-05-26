/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { AppLogger } from '@app/config/logger/app-logger.service';
import { UsersService } from '@app/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser, JwtPayload } from '../types/auth.types';

interface ValidatedUser {
  id: number;
  email: string;
  name: string;
  authProvider: string;
  profilePicture: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userResult = await this.userService.findUnique(payload.email);

      if (!userResult) {
        this.logger.warn(
          `JWT validation failed - user not found for email: ${payload.email} (ID: ${payload.sub})`,
        );
        throw new UnauthorizedException('Invalid token - user not found');
      }

      // Type assertion to our known interface
      const user = userResult as ValidatedUser;

      this.logger.debug(
        `JWT validated successfully for user: ${user.id} (${user.email})`,
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
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
