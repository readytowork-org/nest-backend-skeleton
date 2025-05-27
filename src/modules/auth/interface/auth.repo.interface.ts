import { AuthenticatedUser, GoogleUser, AmazonUser } from '../types/auth.types';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

// Core repository interface
export interface AuthRepositoryInterface {
  register(registerDto: RegisterDto): Promise<AuthenticatedUser>;
  login(loginDto: LoginDto): Promise<AuthenticatedUser>;
  validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser>;
  validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<AuthenticatedUser>;
}
