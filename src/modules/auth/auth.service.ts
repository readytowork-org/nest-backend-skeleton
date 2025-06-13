/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendSignupOtpDto,
  VerifySignupOtpDto,
} from './dto/auth.dto';
import {
  AmazonUser,
  GoogleUser,
  LineUser,
  LoginResponseData,
  TokenPayload,
  UserData,
} from './types/auth.types';
import { UserRepository } from '../users/users.repository';
import { compare, hash } from 'bcrypt';
import { RequestUserRole, UserRole } from '../users/types/user.role.enum';
import { JwtService } from '@nestjs/jwt';
import { UserWithOtpSessionId } from '../users/types/user.types';
import { generateResetToken, getHashToken } from '@app/utils/token.util';
import {
  EmailTemplateEnum,
  EmailTemplateSubjectEnum,
} from '@app/services/email/types';
import { generateRandomUUID, gethashOtp } from '@app/utils';
import { OtpService } from '../otp/otp.service';
import {
  EmailAlreadyExistsException,
  ExpiredTokenException,
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  InvalidTokenException,
  UserNotFoundException,
} from '@app/config/exception/http-exception';
import { ErrorMessages } from '@app/common/constants/error-message.constant';
import { SALT_ROUNDS } from '@app/common';
import { envVars } from '@app/config/env/env.validation';
import { EmailService } from '@app/services/email/email.service';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserWithOtpSessionId> {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new EmailAlreadyExistsException(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }
    // Hash the password before saving
    const hashedPassword = await hash(registerDto.password, SALT_ROUNDS);
    const userData: UserData = {
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name || 'Fortune Teller',
      authProvider: 'local',
      phoneNumber: registerDto.phone_number,
      profilePicture: null,
      role: registerDto.role || UserRole.USER,
    };

    const user = await this.userRepository.create(userData);

    const otpSessionId = generateRandomUUID();

    this.eventEmitter.emit('otp.after_signup', {
      otpSessionId,
      phoneNumber: registerDto.phone_number,
      userId: user.id,
    });

    return {
      ...user,
      otpSessionId,
    };
  }

  async login(
    loginDto: LoginDto,
    requestedWith: RequestUserRole,
  ): Promise<LoginResponseData> {
    const roleFromHeader = requestedWith?.toUpperCase() as RequestUserRole;

    const user = await this.userRepository.findUserByRole(
      loginDto.email,
      roleFromHeader,
    );
    if (!user) throw new UserNotFoundException(ErrorMessages.USER_NOT_FOUND);
    if (user.authProvider !== 'local') {
      throw new InvalidCredentialsException(ErrorMessages.INVALID_CREDENTIALS);
    }
    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException(ErrorMessages.INVALID_CREDENTIALS);
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

    const user = await this.userRepository.findByEmail(decodedToken.email);
    if (!user) {
      throw new UserNotFoundException(ErrorMessages.USER_NOT_FOUND);
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

  async validateOrCreateLineUser(
    lineUser: LineUser,
  ): Promise<LoginResponseData> {
    const existingUser = await this.userRepository.findByEmail(lineUser.email);
    if (existingUser) {
      if (existingUser.authProvider !== 'line') {
        await this.userRepository.update(existingUser.id, {
          ...existingUser,
          authProvider: 'line',
          profilePicture: lineUser.picture || null,
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
      email: lineUser.email,
      name: lineUser.name || 'LINE User',
      password: '',
      role: UserRole.USER,
      authProvider: 'line',
      profilePicture: lineUser.picture || null,
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
      expiresIn: envVars.JWT_ACCESS_EXPIRES_IN,
      secret: envVars.JWT_ACCESS_SECRET,
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
      expiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
      secret: envVars.JWT_REFRESH_SECRET,
    });
  }

  async requestPasswordReset(email: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) {
      throw new UserNotFoundException(ErrorMessages.EMAIL_NOT_FOUND);
    }

    const expiryMinutes = envVars.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES;

    const { token, hashed } = generateResetToken();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.userRepository.update(existingUser.id, {
      resetPasswordToken: hashed,
      resetPasswordTokenExpiresAt: expiresAt,
    });

    const resetLink = `${process.env.CONSUMER_FRONTEND_URL}/reset-password?token=${token}&id=${existingUser.id}`;

    await this.emailService.sendEmailWithTemplate({
      to: existingUser.email,
      templateName: EmailTemplateEnum.ResetPassword,
      subject: EmailTemplateSubjectEnum.ResetPassword,
      data: {
        name: existingUser.name,
        expiresAt: expiryMinutes,
        resetLink,
        appName: process.env.appName || 'Fortune Call',
      },
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = getHashToken(token);
    const user = await this.userRepository.findByHashToken(hashedToken);

    if (!user || !user.resetPasswordTokenExpiresAt) {
      throw new InvalidTokenException(ErrorMessages.INVALID_RESET_TOKEN);
    }

    if (new Date() > user.resetPasswordTokenExpiresAt) {
      throw new ExpiredTokenException(ErrorMessages.INVALID_RESET_TOKEN);
    }

    const hashedPassword = await hash(newPassword, SALT_ROUNDS);

    return await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    });
  }

  async verifySignupOtp(verifySignupOtpDto: VerifySignupOtpDto) {
    const { otp_session_id, otp } = verifySignupOtpDto;

    const existingOtp =
      await this.otpService.findLatestOtpBySessionId(otp_session_id);

    if (!existingOtp) throw new NotFoundException('Otp session not found');

    if (existingOtp.verified)
      throw new BadRequestException('OTP already verified');

    if (existingOtp.expiresAt < new Date())
      throw new BadRequestException('OTP has expired');

    const hashedOtp = gethashOtp(otp);

    if (existingOtp.otpCode !== hashedOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // marked verified
    await this.otpService.update(existingOtp.id, { verified: true });
  }

  async resendSignupOtp(verifySignupOtpDto: ResendSignupOtpDto) {
    const { otp_session_id } = verifySignupOtpDto;

    const existingOtp =
      await this.otpService.findOneByOtpSessionId(otp_session_id);

    if (!existingOtp) {
      throw new NotFoundException(`Invalid OTP session`);
    }

    if (existingOtp.verified) {
      throw new BadRequestException('OTP already verified');
    }

    const existingUser = await this.userRepository.findById(existingOtp.userId);

    if (!existingUser?.phoneNumber) {
      throw new BadRequestException(`Cannot send OTP with out phone number`);
    }

    const otpSessionId = generateRandomUUID();

    this.eventEmitter.emit('otp.after_signup', {
      otpSessionId,
      phoneNumber: existingUser.phoneNumber,
      userId: existingUser.id,
    });

    this.eventEmitter.emit('otp.resend', {
      optSessionId: otp_session_id,
      phoneNumber: existingUser.phoneNumber,
      userId: existingUser.id,
    });

    return {
      otpSessionId,
    };
  }
}
