import { Injectable } from '@nestjs/common';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
// import {
//   AuthenticatedUser,
//   GoogleUser,
//   AmazonUser,
// } from './interfaces/auth.interface';
import { AuthRepository } from './auth.repository';
import {
  AmazonUser,
  AuthenticatedUser,
  GoogleUser,
  LoginResponseData,
  RefreshTokenResponse,
  RegisterResponse,
} from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authRepository.register(registerDto);
  }

  async login(loginDto: LoginDto): Promise<LoginResponseData> {
    // business logics

    return this.authRepository.login(loginDto);
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    return this.authRepository.refreshToken(refreshTokenDto);
  }

  async validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser> {
    return this.authRepository.validateOrCreateGoogleUser(googleUser);
  }

  async validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<AuthenticatedUser> {
    return this.authRepository.validateOrCreateAmazonUser(amazonUser);
  }
}
