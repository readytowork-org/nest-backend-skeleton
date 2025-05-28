/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepositoryInterface } from './interface/auth.repo.interface';

import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import {
  AmazonUser,
  AuthenticatedUser,
  GoogleUser,
  TokenPayload,
  UserData,
  LoginResponse,
  RegisterResponse,
  RefreshTokenPayload,
} from './types/auth.types';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { UserRole } from '../users/types/user.role.enum';

@Injectable()
export class AuthRepository implements AuthRepositoryInterface {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthRepository.name);
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, password, name, role } = registerDto;

    const existingUser = await this.userService.findUnique(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(password, 10);
    const userData: UserData = {
      email,
      password: hashedPassword,
      name: name || 'User',
      authProvider: 'local',
      profilePicture: null,
      role: role || UserRole.USER,
    };

    await this.userService.create(userData);

    return {
      message: 'User registered successfully',
      statusCode: 201,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    const user = await this.userService.findUnique(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.authProvider !== 'local') {
      throw new UnauthorizedException(
        `Please sign in with ${user.authProvider}`,
      );
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser> {
    const { email, firstName, lastName, picture } = googleUser;
    const name = `${firstName} ${lastName}`.trim() || 'Google User';

    const existingUser = await this.userService.findUnique(email);
    if (existingUser) {
      if (existingUser.authProvider !== 'google') {
        await this.userService.update(existingUser.id, {
          authProvider: 'google',
          profilePicture: picture || null,
        });
      }
      const token = this.generateAccessToken(existingUser);
      return { ...existingUser, token };
    }

    const userData: UserData = {
      email,
      name,
      password: '',
      authProvider: 'google',
      profilePicture: picture || null,
      role: UserRole.USER,
    };

    const newUser = await this.userService.create(userData);
    const token = this.generateAccessToken(newUser);
    return { ...newUser, token };
  }

  async validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<AuthenticatedUser> {
    const { email, name, picture } = amazonUser;

    const existingUser = await this.userService.findUnique(email);
    if (existingUser) {
      if (existingUser.authProvider !== 'amazon') {
        await this.userService.update(existingUser.id, {
          authProvider: 'amazon',
          profilePicture: picture || null,
        });
      }
      const token = this.generateAccessToken(existingUser);
      return { ...existingUser, token };
    }

    const userData: UserData = {
      email,
      name: name || 'Amazon User',
      password: '',
      role: UserRole.USER,
      authProvider: 'amazon',
      profilePicture: picture || null,
    };

    const newUser = await this.userService.create(userData);
    const token = this.generateAccessToken(newUser);
    return { ...newUser, token };
  }

  private generateAccessToken(user: {
    id: number;
    email: string;
    name: string;
    authProvider: string;
    profilePicture: string | null;
    role: UserRole;
  }): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
      role: user.role,
    };

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h';

    return this.jwtService.sign(payload, {
      expiresIn: accessExpiresIn,
    });
  }

  private generateRefreshToken(user: { id: number; email: string }): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      tokenType: 'refresh',
    };

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '30d';

    return this.jwtService.sign(payload, {
      expiresIn: refreshExpiresIn,
    });
  }
}
