import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, PlayerLoginDto } from './auth.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { HttpErrorType } from '@app/common/constants/api_status.enum';
import {
  LoginResponseDto,
  LoginResponseWithDataDto,
} from './auth-response.dto';
import { Public } from '@app/services/auth/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ErrorMessages,
  SuccessMessages,
  UnauthorizedException,
} from '@app/common';
import { Response } from 'express';
import { AuthProviderUser, RequestUserRole } from '@app/common/types';
import { envVars } from '@app/config/env/env.validation';
import { SuccessResponseWithData } from '@app/common/api_response/success_response';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  // =================================================
  // Auth: Admin/Staff
  // =================================================

  @Public()
  @Post('admin/login')
  @HttpCode(HttpErrorType.StatusOk)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    type: LoginResponseWithDataDto,
  })
  @ApiResponse({
    status: HttpErrorType.Unauthorized,
    description: 'Invalid credentials',
  })
  async staffLogin(
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponseWithDataDto> {
    const data = await this.authService.staffLogin(loginDto);
    return SuccessResponseWithData<LoginResponseDto>({
      message: SuccessMessages.LOGIN_SUCCESS,
      status: true,
      data: data as any,
    });
  }

  @Public()
  @Get('admin/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to Google authentication page',
  })
  playerGoogleAuth() {
    // Authentication handled by strategy
  }

  @Public()
  @Get('admin/google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({
    status: HttpErrorType.StatusOk,
    description: 'Redirect to frontend with token',
  })
  async staffGoogleAuthCallback(
    @Req() req: { user: AuthProviderUser },
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        throw new UnauthorizedException(ErrorMessages.AUTHENTICATION_FAILED);
      }
      const redirectUrl = await this.authService.validateOrCreateOAuthStaff(
        req.user,
      );
      return res.redirect(HttpErrorType.Redirect, redirectUrl);
    } catch (error) {
      this.logger.error(error);
      return res.redirect(
        HttpErrorType.Redirect,
        `${envVars.ADMIN_FRONTEND_URL}/login?auth_error=true&provider=google`,
      );
    }
  }

  // =================================================
  // Auth: Token Refresh for all users
  // =================================================
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
    @Headers('x-requested-with') requestedWith: RequestUserRole,
  ): Promise<LoginResponseWithDataDto> {
    const data = await this.authService.refreshToken(
      requestedWith,
      refreshTokenDto,
    );
    return SuccessResponseWithData<LoginResponseDto>({
      message: SuccessMessages.SUCCESS,
      status: true,
      data: data as any,
    });
  }
}
