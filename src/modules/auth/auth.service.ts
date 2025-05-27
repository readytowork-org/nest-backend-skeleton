/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { LoginInput, RegisterInput } from './types/auth.types';
// import {
//   AuthenticatedUser,
//   GoogleUser,
//   AmazonUser,
// } from './interfaces/auth.interface';
import { AuthRepository } from './auth.repository';
import { AmazonUser, AuthenticatedUser, GoogleUser } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(registerInput: RegisterInput): Promise<AuthenticatedUser> {
    return this.authRepository.register(registerInput);
  }

  async login(loginInput: LoginInput): Promise<AuthenticatedUser> {
    return this.authRepository.login(loginInput);
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
