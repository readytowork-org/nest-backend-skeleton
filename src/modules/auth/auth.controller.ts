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
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from '../../common/types/dto/auth/auth.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { GoogleUser } from '../../common/types/type/auth.type';
import { HttpErrorType } from '@app/common/constants/api_status.enum';
import { UnauthorizedException } from '@app/common/exception/http-exception';
import { SuccessResponseMessage } from '@app/lib';
import { ErrorMessages } from '@app/common/constants/error-message.constant';
import { SuccessMessages } from '@app/common/constants/success-messages.constant';
import { RequestUserRole } from '../../common/types/enum/user.role.enum';
import { envVars } from '@app/config/env/env.validation';
import { Public } from './decorators/public.decorator';
import { LoginResponseWithDataDto } from '@app/common/types';

@ApiBearerAuth('BearerAuth')
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiHeader({ name: 'x-requested-with', required: true })
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
  ): Promise<LoginResponseWithDataDto> {
    return this.authService.login(loginDto, requestedWith);
  }

  @Public()
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
  ): Promise<LoginResponseWithDataDto> {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @Public()
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

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to frontend with token',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = envVars.USER_FRONTEND_URL;
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

      const redirectUrl = `${frontendUrl}/auth/callback?access_token=${encodeURIComponent(result.access_token)}&refresh_token=${encodeURIComponent(result.refresh_token)}&provider=google`;
      return res.redirect(HttpErrorType.Redirect, redirectUrl);
    } catch (error) {
      this.logger.error(error);
      return res.redirect(
        HttpErrorType.Redirect,
        `${frontendUrl}/login?auth_error=true&provider=google`,
      );
    }
  }

  @Public()
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

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiBody({ type: ForgotPasswordDto })
  @ApiHeader({ name: 'x-requested-with', required: false })
  @ApiOperation({
    summary: 'Reset Password: First Step',
  })
  @ApiResponse({
    status: HttpErrorType.NotFound,
    description: 'User not found',
  })
  async forgotPassword(
    @Body('email') email: string,
    @Headers('x-requested-with') requestedWith: RequestUserRole,
  ) {
    return this.authService.requestPasswordReset(email, requestedWith);
  }

  @Public()
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
}
