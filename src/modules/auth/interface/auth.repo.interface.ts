import {
  AuthenticatedUser,
  GoogleUser,
  AmazonUser,
  LoginResponse,
  RegisterResponse,
} from '../types/auth.types';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

// Core repository interface
export interface AuthRepositoryInterface {
  register(registerDto: RegisterDto): Promise<RegisterResponse>;
  login(loginDto: LoginDto): Promise<LoginResponse>;
  validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser>;
  validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<AuthenticatedUser>;
}
