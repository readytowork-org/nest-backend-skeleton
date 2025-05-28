import {
  AuthenticatedUser,
  GoogleUser,
  AmazonUser,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
} from '../types/auth.types';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto/auth.dto';

// Core repository interface
export interface AuthRepositoryInterface {
  register(registerDto: RegisterDto): Promise<RegisterResponse>;
  login(loginDto: LoginDto): Promise<LoginResponse>;
  refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse>;
  validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser>;
  validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<AuthenticatedUser>;
}
