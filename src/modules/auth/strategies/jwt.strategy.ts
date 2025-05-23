import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { ConfigService } from '@nestjs/config';
import { AuthUser, JwtPayload } from '../interfaces/auth.interface';
import { UsersService } from '@app/modules/users/users.service';

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
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.userService.findUnique(payload.email);

    if (!user) {
      this.logger.warn(`JWT validation failed for user ID: ${payload.sub}`);
      throw new UnauthorizedException('Invalid token');
    }

    this.logger.debug(`JWT validated for user: ${user.id}`);

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };
  }
}
