/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LoginResponseWithMessageDto,
  LoginResponseWithDataDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  VerifySignupOtpDto,
  ResendSignupOtpDto,
} from './dto/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import {
  AmazonUser,
  GoogleUser,
  LineUser,
  LoginResponseData,
} from './types/auth.types';
import { HttpErrorType } from '@app/common/constants/api_status.enum';
import {
  UnauthorizedException,
  BadRequestException,
  UserNotFoundException,
} from '@app/config/exception/http-exception';
import {
  ResponseWithData,
  ResponseWithMessage,
  SuccessResponseMessage,
  SuccessResponseWithData,
} from '@app/lib';
import { ErrorMessages } from '@app/common/constants';
import { SuccessMessages } from '@app/common/constants';
import { RequestUserRole } from '../users/types/user.role.enum';
import { envVars } from '@app/config/env/env.validation';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  @Post('register')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    type: LoginResponseWithMessageDto,
  })
  @ApiResponse({
    status: HttpErrorType.BadRequest,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpErrorType.Conflict,
    description: 'Email already exists',
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseWithMessage> {
    const newUser = await this.authService.register(registerDto);
    return SuccessResponseWithData({
      message: 'Success',
      data: {
        otpSessionId: newUser.otpSessionId,
      },
    });
  }

  @Post('login')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiHeader({ name: 'x-requested-with', required: false })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    type: LoginResponseWithDataDto,
  })
  @ApiResponse({
    status: HttpErrorType.Unauthorized,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-requested-with') requestedWith: RequestUserRole,
  ): Promise<ResponseWithData<LoginResponseData>> {
    const data = await this.authService.login(loginDto, requestedWith);
    return SuccessResponseWithData({
      message: SuccessMessages.LOGIN_SUCCESS,
      data,
    });
  }

  @Post('refresh')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    type: LoginResponseWithDataDto,
  })
  @ApiResponse({
    status: HttpErrorType.Unauthorized,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseWithData<LoginResponseData>> {
    const data = await this.authService.refreshToken(refreshTokenDto);
    return SuccessResponseWithData({
      message: SuccessMessages.TOKEN_REFRESH_SUCCESS,
      data,
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to Google authentication page',
  })
  googleAuth() {
    // Authentication handled by strategy
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to frontend with token',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = envVars.CONSUMER_FRONTEND_URL;
    try {
      if (!req.user) {
        throw new UnauthorizedException(ErrorMessages.AUTHENTICATION_FAILED);
      }
      const result = await this.authService.validateOrCreateGoogleUser(
        req.user as GoogleUser,
      );
      if (!result || !result.access_token) {
        throw new UnauthorizedException(ErrorMessages.AUTHENTICATION_FAILED);
      }

      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${encodeURIComponent(result.access_token)}&refresh_token=${encodeURIComponent(result.refresh_token)}`;
      return res.redirect(HttpErrorType.Redirect, redirectUrl);
    } catch (error) {
      this.logger.error(error);
      return res.redirect(
        HttpErrorType.Redirect,
        `${frontendUrl}/login?auth_error=true&provider=google`,
      );
    }
  }

  @Get('amazon')
  @UseGuards(AuthGuard('amazon'), RolesGuard)
  @ApiOperation({ summary: 'Initiate Amazon OAuth authentication' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to Amazon authentication page',
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  amazonAuth(@Req() req: Request) {
    // Authentication handled by strategy
  }

  @Get('amazon/callback')
  @UseGuards(AuthGuard('amazon'))
  @ApiOperation({ summary: 'Handle Amazon OAuth callback' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to frontend with token',
  })
  async amazonAuthCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = envVars.CONSUMER_FRONTEND_URL;
    try {
      if (!req.user) {
        throw new UnauthorizedException(ErrorMessages.AUTHENTICATION_FAILED);
      }

      // Check specifically for email presence
      const userData = req.user as any;
      if (!userData.email) {
        throw new BadRequestException(ErrorMessages.EMAIL_MISSING_IN_AUTH);
      }
      const result = await this.authService.validateOrCreateAmazonUser(
        req.user as AmazonUser,
      );
      if (!result || !result.access_token) {
        throw new UnauthorizedException(ErrorMessages.AUTHENTICATION_FAILED);
      }
      // Use the specific /auth/callback path with both tokens
      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${encodeURIComponent(result.access_token)}&refresh_token=${encodeURIComponent(result.refresh_token)}`;
      return res.redirect(HttpErrorType.Redirect, redirectUrl);
    } catch (error) {
      this.logger.error(error);
      return res.redirect(
        HttpErrorType.Redirect,
        `${frontendUrl}/login?auth_error=true&provider=amazon`,
      );
    }
  }

  @Get('line')
  @UseGuards(AuthGuard('line'))
  @ApiOperation({ summary: 'Initiate LINE OAuth authentication' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to LINE authentication page',
  })
  lineAuth() {
    // Authentication handled by strategy
  }

  @Get('line/callback')
  @UseGuards(AuthGuard('line'))
  @ApiOperation({ summary: 'Handle LINE OAuth callback' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to frontend with token',
  })
  async lineAuthCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = envVars.CONSUMER_FRONTEND_URL;
    try {
      if (!req.user) {
        throw new UserNotFoundException(ErrorMessages.USER_NOT_FOUND);
      }

      const userData = req.user as any;
      if (!userData.email) {
        throw new BadRequestException(ErrorMessages.EMAIL_MISSING_IN_AUTH);
      }

      const result = await this.authService.validateOrCreateLineUser(
        req.user as LineUser,
      );

      if (!result || !result.access_token) {
        throw new UnauthorizedException(ErrorMessages.AUTHENTICATION_FAILED);
      }

      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${encodeURIComponent(result.access_token)}&refresh_token=${encodeURIComponent(result.refresh_token)}`;
      return res.redirect(HttpErrorType.Redirect, redirectUrl);
    } catch (error) {
      this.logger.error(error);
      return res.redirect(
        HttpErrorType.Redirect,
        `${frontendUrl}/login?auth_error=true&provider=line`,
      );
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOperation({
    summary: 'Reset Password: First Step',
  })
  @ApiResponse({
    status: HttpErrorType.NotFound,
    description: 'User not found',
  })
  async forgotPassword(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return SuccessResponseMessage({
      message: SuccessMessages.PASSWORD_RESET_EMAIL_SENT,
    });
  }

  @Post('reset-password')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiBody({ type: ResetPasswordDto })
  @ApiOperation({
    summary: 'Reset Password: Final Step',
  })
  @ApiResponse({
    status: HttpErrorType.BadRequest,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return SuccessResponseMessage({
      message: SuccessMessages.PASSWORD_RESET_SUCCESS,
    });
  }

  @Post('/verify-signup-otp')
  @ApiBody({ type: VerifySignupOtpDto })
  @ApiOperation({
    summary: 'Verify OPT after signup',
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 400, description: 'OTP already verified' })
  @ApiResponse({ status: 404, description: 'Otp session not found' })
  async verifySignupOtp(@Body() verifySignupOtpDto: VerifySignupOtpDto) {
    await this.authService.verifySignupOtp(verifySignupOtpDto);
    return SuccessResponseMessage({
      message: 'OTP has been verified successfully',
    });
  }

  @Post('/resend-signup-otp')
  @ApiBody({ type: ResendSignupOtpDto })
  @ApiOperation({
    summary: 'Resend OTP',
  })
  @ApiResponse({ status: 404, description: 'Invalid OTP session' })
  @ApiResponse({ status: 404, description: 'OTP already verified' })
  @ApiResponse({
    status: 400,
    description: 'Cannot send OTP with out phone number',
  })
  async resendSignupOtp(@Body() resendSignupOtpDto: ResendSignupOtpDto) {
    const data = await this.authService.resendSignupOtp(resendSignupOtpDto);
    return SuccessResponseWithData({
      message: 'OTP has been sent successfully',
      data: { otpSessionId: data.otpSessionId },
    });
  }
}
