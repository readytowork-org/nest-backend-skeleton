import {
  AuthenticatedUser,
  GoogleUser,
  AmazonUser,
  RegisterInput,
  LoginInput,
} from '../types/auth.types';

// Core repository interface
export interface AuthRepositoryInterface {
  register(registerInput: RegisterInput): Promise<AuthenticatedUser>;
  login(loginInput: LoginInput): Promise<AuthenticatedUser>;
  validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthenticatedUser>;
  validateOrCreateAmazonUser(
    amazonUser: AmazonUser,
  ): Promise<AuthenticatedUser>;
}
