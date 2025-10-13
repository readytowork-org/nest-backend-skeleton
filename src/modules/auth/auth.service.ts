import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  LoginDto,
  RefreshTokenDto,
} from '../../common/types/dto/auth/auth.dto';
import { GoogleUser, TokenPayload } from '../../common/types/type/auth.type';
import { compare, hash } from 'bcrypt';
import {
  RequestUserRole,
  UserRole,
} from '../../common/types/enum/user.role.enum';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { generateResetToken, getHashToken } from '@app/utils/token.util';
import { EmailService } from '../../services/email/email.service';
import {
  EmailTemplateEnum,
  EmailTemplateSubjectEnum,
} from '../../services/email/types';
import { getCurrentJstTime } from '@app/utils';
import {
  ExpiredTokenException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  InvalidTokenException,
  UnauthorizedException,
  UserNotFoundException,
} from '@app/common/exception/http-exception';
import { ErrorMessages } from '@app/common/constants/error-message.constant';
import { SALT_ROUNDS, SuccessMessages } from '@app/common';
import { envVars } from '@app/config/env/env.validation';
import { SuccessResponseMessage } from '@app/lib';
import { UsersService } from '../users/users.service';
import {
  AccountStatusEnum,
  LoginResponseDto,
  LoginResponseWithDataDto,
  User,
} from '@app/common/types';
import { uuid } from 'drizzle-orm/gel-core';
@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(
    loginDto: LoginDto,
    requestedWith: RequestUserRole,
  ): Promise<LoginResponseWithDataDto> {
    const roleFromHeader = requestedWith?.toUpperCase() as RequestUserRole;

    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || user.authProvider !== 'local')
      throw new InvalidCredentialsException(ErrorMessages.INVALID_CREDENTIALS);

    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException(ErrorMessages.INVALID_CREDENTIALS);
    }

    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);
    await this.updateLoginTime(user.id);

    return {
      message: SuccessMessages.LOGIN_SUCCESS,
      data: {
        user_id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        middle_name: user.middleName,
        auth_provider: user.authProvider,
        profile_picture: user.profilePicture,
        role: user.role,
        access_token,
        refresh_token,
      },
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseWithDataDto> {
    let decodedToken: TokenPayload;

    try {
      decodedToken = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: envVars.JWT_REFRESH_SECRET,
      });
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.name === 'TokenExpiredError') {
        throw new ExpiredTokenException(ErrorMessages.EXPIRED_TOKEN);
      }
      throw new InvalidRefreshTokenException(
        ErrorMessages.INVALID_REFRESH_TOKEN,
      );
    }

    const user = await this.usersService.findByEmail(decodedToken.email);
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.USER_NOT_FOUND);
    }

    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);
    return {
      message: SuccessMessages.TOKEN_REFRESH_SUCCESS,
      data: {
        user_id: user.id,
        email: user.email,
        first_name: user.firstName,
        middle_name: user.middleName,
        last_name: user.lastName,
        auth_provider: user.authProvider,
        profile_picture: user.profilePicture,
        role: user.role,
        access_token,
        refresh_token,
      },
    };
  }

  async validateOrCreateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<LoginResponseDto> {
    const existingUser = await this.usersService.findByEmail(googleUser.email);
    if (existingUser) {
      if (existingUser.authProvider !== 'google') {
        await this.usersService.update(existingUser.id, {
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
        first_name: existingUser.firstName,
        middle_name: existingUser.middleName,
        last_name: existingUser.lastName,
        auth_provider: existingUser.authProvider,
        profile_picture: existingUser.profilePicture,
        role: existingUser.role,
        access_token,
        refresh_token,
      };
    }
    const userData: User = {
      id: uuid(),
      email: googleUser.email,
      name:
        `${googleUser.firstName} ${googleUser.lastName}`.trim() ||
        'Google User',
      password: '',
      authProvider: 'google',
      profilePicture: googleUser.picture || null,
      role: UserRole.USER,
    } as any;

    const newUser = (await this.usersService.findById(userData.id)) as User;

    const access_token = this.generateAccessToken(newUser);
    const refresh_token = this.generateRefreshToken(newUser);
    return {
      user_id: newUser.id,
      email: newUser.email,
      first_name: newUser.firstName,
      middle_name: newUser.middleName,
      last_name: newUser.lastName,
      auth_provider: newUser.authProvider,
      profile_picture: newUser.profilePicture,
      role: newUser.role,
      access_token,
      refresh_token,
    };
  }

  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: envVars.JWT_ACCESS_EXPIRES_IN,
      secret: envVars.JWT_ACCESS_SECRET,
    } as JwtSignOptions);
  }

  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      name: `${user.firstName} ${user.middleName} ${user.lastName}`,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
      secret: envVars.JWT_REFRESH_SECRET,
    } as JwtSignOptions);
  }

  async requestPasswordReset(email: string, requestWithRole: UserRole) {
    const requestedWith = requestWithRole?.toUpperCase() as UserRole;
    const existingUser = await this.usersService.findUserByEmailAndRole(
      email,
      requestedWith,
    );

    if (!existingUser || existingUser.authProvider !== 'local') {
      return SuccessResponseMessage({ message: 'success' });
    }

    const expiryMinutes = envVars.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES;

    const { token, hashed } = generateResetToken();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.usersService.update(existingUser.id, {
      resetPasswordToken: hashed,
      resetPasswordTokenExpiresAt: expiresAt,
    });

    const resetBaseUrl = this.getResetPasswordBaseURL(requestedWith);

    if (!resetBaseUrl) {
      throw new BadRequestException(`Reset password base URL is not defined`);
    }

    const resetLink = `${resetBaseUrl}/reset-password?token=${token}`;

    await this.emailService.sendEmailWithTemplate({
      to: existingUser.email,
      templateName: EmailTemplateEnum.ResetPassword,
      subject: EmailTemplateSubjectEnum.ResetPassword,
      data: {
        name: `${existingUser.firstName} ${existingUser.middleName} ${existingUser.lastName}`,
        expiresAt: expiryMinutes,
        resetLink,
        appName: 'Nest Starter',
      },
    });
    return SuccessResponseMessage({
      message: SuccessMessages.PASSWORD_RESET_EMAIL_SENT,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = getHashToken(token);
    const user = await this.usersService.findByHashToken(hashedToken);

    if (!user || !user.resetPasswordTokenExpiresAt) {
      throw new InvalidTokenException(ErrorMessages.INVALID_RESET_TOKEN);
    }

    if (new Date() > user.resetPasswordTokenExpiresAt) {
      throw new ExpiredTokenException(ErrorMessages.INVALID_RESET_TOKEN);
    }

    const hashedPassword = await hash(newPassword, SALT_ROUNDS);

    return await this.usersService.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    });
  }

  async checkAccountStatus(user: User) {
    const userDetail = await this.usersService.findDetailById(user.id);
    if (userDetail.status === AccountStatusEnum.InActive.toString()) {
      throw new UnauthorizedException('Your account has been suspended');
    }
  }

  getResetPasswordBaseURL = (role: UserRole): string | undefined => {
    switch (role) {
      case UserRole.ADMIN:
        return envVars.ADMIN_FRONTEND_URL;
      default:
        return undefined;
    }
  };

  async updateLoginTime(userId: number): Promise<void> {
    this.logger.log(`Updating last login time for user ID: ${userId}`);
    await this.usersService.update(userId, {
      lastLoginAt: getCurrentJstTime(),
    });
  }
}
