/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import {
  AmazonUser,
  AuthenticatedUser,
  GoogleUser,
  LoginResponseData,
  TokenPayload,
  UserData,
} from './types/auth.types';
import { UserRepository } from '../users/users.repository';
import { compare, hash } from 'bcrypt';
import { UserRole } from '../users/types/user.role.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/types/user.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new Error('Email already exists');
    }
    // Hash the password before saving
    const hashedPassword = await hash(registerDto.password, 10);

    const userData: UserData = {
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name || 'Fortune Teller',
      authProvider: 'local',
      profilePicture: null,
      role: registerDto.role || UserRole.USER,
    };
    return await this.userRepository.create(userData);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseData> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.authProvider !== 'local') {
      throw new Error('USER_NOT_LOCAL');
    }
    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);
    return {
      user_id: user.id,
      email: user.email,
      name: user.name,
      auth_provider: user.authProvider,
      profile_picture: user.profilePicture,
      role: user.role,
      access_token,
      refresh_token,
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseData> {
    // check the token is valid
    const decodedToken: TokenPayload = this.jwtService.verify(
      refreshTokenDto.refresh_token,
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      },
    );
    const user = await this.userRepository.findByEmail(decodedToken.email);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    // Allow all auth providers (local, google, amazon) to use refresh tokens
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);
    return {
      user_id: user.id,
      email: user.email,
      name: user.name,
      auth_provider: user.authProvider,
      profile_picture: user.profilePicture,
      role: user.role,
      access_token,
      refresh_token,
    };
  }

  async validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<LoginResponseData> {
    const existingUser = await this.userRepository.findByEmail(
      googleUser.email,
    );
    if (existingUser) {
      if (existingUser.authProvider !== 'google') {
        await this.userRepository.update(existingUser.id, {
          ...existingUser,
          authProvider: 'google',
          profilePicture: googleUser.picture || null,
        });
      }
      const access_token = this.generateAccessToken(existingUser);
      const refresh_token = this.generateRefreshToken(existingUser);
      return {
        user_id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        auth_provider: existingUser.authProvider,
        profile_picture: existingUser.profilePicture,
        role: existingUser.role,
        access_token,
        refresh_token,
      };
    }
    const userData: UserData = {
      email: googleUser.email,
      name:
        `${googleUser.firstName} ${googleUser.lastName}`.trim() ||
        'Google User',
      password: '',
      authProvider: 'google',
      profilePicture: googleUser.picture || null,
      role: UserRole.USER,
    };

    const newUser = await this.userRepository.create(userData);
    const access_token = this.generateAccessToken(newUser);
    const refresh_token = this.generateRefreshToken(newUser);
    return {
      user_id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      auth_provider: newUser.authProvider,
      profile_picture: newUser.profilePicture,
      role: newUser.role,
      access_token,
      refresh_token,
    };
  }

  async validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<LoginResponseData> {
    const existingUser = await this.userRepository.findByEmail(
      amazonUser.email,
    );
    if (existingUser) {
      if (existingUser.authProvider !== 'amazon') {
        await this.userRepository.update(existingUser.id, {
          ...existingUser,
          authProvider: 'amazon',
          profilePicture: amazonUser.picture || null,
        });
      }
      const access_token = this.generateAccessToken(existingUser);
      const refresh_token = this.generateRefreshToken(existingUser);
      return {
        user_id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        auth_provider: existingUser.authProvider,
        profile_picture: existingUser.profilePicture,
        role: existingUser.role,
        access_token,
        refresh_token,
      };
    }
    const userData: UserData = {
      email: amazonUser.email,
      name: amazonUser.name || 'Amazon User',
      password: '',
      role: UserRole.USER,
      authProvider: 'amazon',
      profilePicture: amazonUser.picture || null,
    };

    const newUser = await this.userRepository.create(userData);
    const access_token = this.generateAccessToken(newUser);
    const refresh_token = this.generateRefreshToken(newUser);
    return {
      user_id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      auth_provider: newUser.authProvider,
      profile_picture: newUser.profilePicture,
      role: newUser.role,
      access_token,
      refresh_token,
    };
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
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  private generateRefreshToken(user: {
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
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });
  }
}
