/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LoginResponseWithMessageDto,
  LoginResponseWithDataDto,
} from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard';
import { AmazonUser, GoogleUser, LoginResponseData } from './types/auth.types';
import {
  ResponseWithData,
  ResponseWithMessage,
  SuccessResponseMessage,
  SuccessResponseWithData,
} from '@app/lib';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register new user',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    type: LoginResponseWithMessageDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseWithMessage> {
    await this.authService.register(registerDto);
    return SuccessResponseMessage({
      message: 'Success',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    type: LoginResponseWithDataDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ResponseWithData<LoginResponseData>> {
    try {
      const data = await this.authService.login(loginDto);
      return SuccessResponseWithData({
        message: 'Success',
        data,
      });
    } catch (error) {
      this.logger.error(
        `Login error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    type: LoginResponseWithDataDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseWithData<LoginResponseData>> {
    const data = await this.authService.refreshToken(refreshTokenDto);
    return SuccessResponseWithData({
      message: 'Success',
      data,
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google authentication page',
  })
  googleAuth() {
    this.logger.debug('Google authentication initiated');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with token' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        this.logger.error(
          'Google authentication failed: No user data received',
        );
        throw new UnauthorizedException('Authentication failed');
      }
      const result = await this.authService.validateOrCreateGoogleUser(
        req.user as GoogleUser,
      );
      if (!result || !result.token) {
        this.logger.error('Failed to get token for Google user');
        throw new UnauthorizedException('Authentication failed');
      }
      // Get frontend URL from configuration (providing proper fallbacks)
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:5173';
      // Use the specific /auth/callback path that React Router is configured to handle
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}`;
      this.logger.debug(`Redirecting to frontend: ${redirectUrl}`);
      return res.redirect(302, redirectUrl);
    } catch (error) {
      this.logger.error(
        `Google auth callback error: ${error instanceof Error ? error.message : String(error)}`,
      );
      // In case of error, redirect to frontend login page with error parameter
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:5173';
      return res.redirect(
        302,
        `${frontendUrl}/login?auth_error=true&provider=google`,
      );
    }
  }

  @Get('amazon')
  @UseGuards(AuthGuard('amazon'), RolesGuard)
  @ApiOperation({ summary: 'Initiate Amazon OAuth authentication' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Amazon authentication page',
  })
  amazonAuth(@Req() req: Request) {
    // Simply log that authentication was initiated
    this.logger.debug('Amazon authentication initiated');
    // Log if scope parameter was provided
    if (req.query && req.query.scope) {
      this.logger.debug('Custom scopes requested for Amazon auth');
    }
  }

  @Get('amazon/callback')
  @UseGuards(AuthGuard('amazon'))
  @ApiOperation({ summary: 'Handle Amazon OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with token' })
  async amazonAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        this.logger.error(
          'Amazon authentication failed: No user data received',
        );
        throw new UnauthorizedException('Authentication failed');
      }

      // Detailed logging of the user object received from the strategy
      this.logger.debug('User data received from Amazon strategy:');
      this.logger.debug(JSON.stringify(req.user, null, 2));
      // Check specifically for email presence
      const userData = req.user as any;
      this.logger.debug(`Email present in user data: ${!!userData.email}`);
      if (!userData.email) {
        this.logger.error('Email missing in Amazon user data');
        throw new UnauthorizedException('Email missing in authentication data');
      }
      const result = await this.authService.validateOrCreateAmazonUser(
        req.user as AmazonUser,
      );
      if (!result || !result.token) {
        this.logger.error('Failed to get token for Amazon user');
        throw new UnauthorizedException('Authentication failed');
      }
      // Get frontend URL from configuration (providing proper fallbacks)
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:5173';
      // Use the specific /auth/callback path that React Router is configured to handle
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}`;
      this.logger.debug(`Redirecting to frontend: ${redirectUrl}`);
      return res.redirect(302, redirectUrl);
    } catch (error) {
      this.logger.error(
        `Amazon auth callback error: ${error instanceof Error ? error.message : String(error)}`,
      );
      // In case of error, redirect to frontend login page with error parameter
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:5173';
      return res.redirect(
        302,
        `${frontendUrl}/login?auth_error=true&provider=amazon`,
      );
    }
  }
}
