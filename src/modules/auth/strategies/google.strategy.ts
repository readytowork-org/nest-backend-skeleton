import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { AppLogger } from '@common/logger/app-logger.service';

interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {
    // Retrieve configuration values with proper typing
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');

    // Validate required environment variables before initializing
    if (!clientID) {
      throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
    }
    if (!clientSecret) {
      throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
    }
    if (!callbackURL) {
      throw new Error('Missing GOOGLE_CALLBACK_URL environment variable');
    }

    // Initialize strategy with validated config
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });

    // Only log after super() is called
    this.logger.debug(`Initialized with callback URL: ${callbackURL}`);
    this.logger.log('Google authentication strategy initialized');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      this.logger.debug(`Validating Google profile: ${profile.id}`);
      const { name, emails, photos } = profile;

      // Validate required profile data
      if (!emails || emails.length === 0) {
        this.logger.error('No email found in Google profile');
        return done(new Error('No email found in Google profile'), undefined);
      }

      this.logger.debug(`Google email: ${emails[0].value}`);

      // Extract profile data
      const googleProfile: GoogleProfile = {
        email: emails[0].value,
        firstName: name?.givenName || '',
        lastName: name?.familyName || '',
        picture: photos && photos.length > 0 ? photos[0].value : '',
        accessToken,
      };

      // Process the user with our auth service
      this.logger.debug('Creating or validating Google user...');
      const user =
        await this.authService.validateOrCreateGoogleUser(googleProfile);
      this.logger.debug(`User validated: ${user.id}`);

      return done(null, user);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(
        `Google authentication error: ${errorMessage}`,
        errorStack,
      );
      return done(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
      );
    }
  }
}
