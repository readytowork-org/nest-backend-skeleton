import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RefreshTokenDto } from './auth.dto';
import {
  AuthProviderUser,
  TokenPayload,
  USER_ROLE,
  RequestUserRole,
  USER_ROLE_DB,
  LoginResponseDto,
  Staff,
} from '@common/types';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  AccountSuspendedException,
  ExpiredTokenException,
  InvalidRefreshTokenException,
} from '@app/common/exception/http-exception';
import { ErrorMessages } from '@app/common/constants/error-message.constant';
import { envVars } from '@app/config/env/env.validation';
import { compareHashAndPlainText } from '@app/utils/bcrypt';
import { StaffRepository } from '@app/api/admin/staffs/staff.repository';
import { getCurrentJstTime } from '@app/utils/getJstTimestamps.util';
import { StorageService } from '@app/services/storage/storage.service';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly staffRepository: StaffRepository,
    private readonly storageService: StorageService,
  ) {}

  async staffLogin(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.staffRepository.findByEmail(loginDto.email);
    if (!user?.id) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }
    if (user?.id && !user?.isActive) {
      throw new UnauthorizedException(ErrorMessages.ACCOUNT_SUSPENDED);
    }
    const isValidPassword = await compareHashAndPlainText(
      loginDto.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }
    const access_token = this.generateAccessToken(user, user.role);
    const refresh_token = this.generateRefreshToken(user, user.role);
    return {
      access_token,
      refresh_token,
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }

  async refreshToken(
    requestedWith: RequestUserRole,
    refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    const roleFromHeader = requestedWith?.toUpperCase() as RequestUserRole;
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
    let user: Staff | null;
    user = await this.staffRepository.findByEmail(decodedToken.email);
    if (!user?.isActive) {
      throw new AccountSuspendedException(ErrorMessages.ACCOUNT_SUSPENDED);
    }
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }
    const access_token = this.generateAccessToken(user, roleFromHeader);
    const refresh_token = this.generateRefreshToken(user, roleFromHeader);
    return {
      access_token,
      refresh_token,
      id: user.id,
      email: user.email,
      role: roleFromHeader,
      name: user.name,
    };
  }

  private generateAccessToken(user: Staff, userType: USER_ROLE_DB): string {
    const payload: TokenPayload = {
      sub: user.id,
      name: user.name,
      membershipId: null,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: envVars.JWT_ACCESS_EXPIRES_IN,
      secret: envVars.JWT_ACCESS_SECRET,
    } as JwtSignOptions);
  }

  private generateRefreshToken(user: Staff, userType: USER_ROLE_DB): string {
    const payload: TokenPayload = {
      sub: user.id,
      name: user.name,
      membershipId: null,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      expiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
      secret: envVars.JWT_REFRESH_SECRET,
    } as JwtSignOptions);
  }

  async validateOrCreateOAuthStaff(
    authProviderUser: AuthProviderUser,
  ): Promise<string> {
    console.log('Validating or creating OAuth staff:', authProviderUser);
    const access_token = 'randim_access_token_for_demo_purposes';
    const refresh_token = 'randim_refresh_token_for_demo_purposes';
    const redirectUrl = `${envVars.ADMIN_FRONTEND_URL}/auth/callback?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}`;
    return redirectUrl;
  }
}
