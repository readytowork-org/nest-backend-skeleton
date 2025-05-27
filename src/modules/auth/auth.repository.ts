/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthRepositoryInterface } from './interface/auth.repo.interface';

import { UsersService } from '../users/users.service';
import {
  AmazonUser,
  AuthenticatedUser,
  GoogleUser,
  RegisterInput,
  LoginInput,
  AuthUserData,
  JwtPayload,
} from './types/auth.types';
import { AppLogger } from '@app/config/logger/app-logger.service';

@Injectable()
export class AuthRepository implements AuthRepositoryInterface {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(AuthRepository.name);
  }

  async register(registerInput: RegisterInput): Promise<AuthenticatedUser> {
    const { email, password, name } = registerInput;

    const existingUser = await this.userService.findUnique(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await hash(password, 10);
    const userData: AuthUserData = {
      email,
      password: hashedPassword,
      name: name || 'User',
      authProvider: 'local',
      profilePicture: null,
    };

    const user = await this.userService.create(userData);
    const token = this.generateToken(user);
    return { ...user, token };
  }

  async login(loginInput: LoginInput): Promise<AuthenticatedUser> {
    const { email, password } = loginInput;

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

    const token = this.generateToken(user);
    return { ...user, token };
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
      const token = this.generateToken(existingUser);
      return { ...existingUser, token };
    }

    const userData: AuthUserData = {
      email,
      name,
      password: '',
      authProvider: 'google',
      profilePicture: picture || null,
    };

    const newUser = await this.userService.create(userData);
    const token = this.generateToken(newUser);
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
      const token = this.generateToken(existingUser);
      return { ...existingUser, token };
    }

    const userData: AuthUserData = {
      email,
      name: name || 'Amazon User',
      password: '',
      authProvider: 'amazon',
      profilePicture: picture || null,
    };

    const newUser = await this.userService.create(userData);
    const token = this.generateToken(newUser);
    return { ...newUser, token };
  }

  private generateToken(user: {
    id: number;
    email: string;
    name: string | null;
    profilePicture: string | null;
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.profilePicture,
    };

    return this.jwtService.sign(payload);
  }
}
