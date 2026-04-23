import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppLogger } from '@app/config/logger/app-logger.service';
import { envVars } from '@app/config/env/env.validation';
import { AuthProviderUser, USER_ROLE } from '@app/common/types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly logger: AppLogger) {
    const clientID = envVars.GOOGLE_CLIENT_ID;
    const clientSecret = envVars.GOOGLE_CLIENT_SECRET;
    const callbackURL = envVars.GOOGLE_CALLBACK_URL;

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
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });

    // Only log after super() is called
    this.logger.log('Google authentication strategy initialized');
  }

  validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    try {
      this.logger.debug(`Validating Google profile: ${profile.id}`);
      const { _json: profileJson } = profile;

      // Validate required profile data
      if (!profileJson.email) {
        this.logger.error('No email found in Google profile');
        return done(new Error('No email found in Google profile'), undefined);
      }

      this.logger.debug(`Google email: ${profileJson.email}`);
      // Extract profile data
      const googleProfile: AuthProviderUser = {
        email: profileJson.email,
        accessToken,
        providerId: profile.id,
        name: profileJson.name,
        profilePicture: profileJson.picture,
        role: USER_ROLE.PLAYER,
      };
      return done(null, googleProfile);
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
