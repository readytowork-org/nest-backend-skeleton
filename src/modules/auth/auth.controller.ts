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
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AppLogger } from '@common/logger/app-logger.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

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
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.debug(`Registration attempt for email: ${registerDto.email}`);
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Login attempt for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
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
      return res.redirect(302, `${frontendUrl}/login?auth_error=true`);
    }
  }
}
