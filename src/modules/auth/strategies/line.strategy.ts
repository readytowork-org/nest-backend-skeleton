/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import * as passportLine from 'passport-line-v2';
import { envVars } from '@app/config/env/env.validation';

@Injectable()
export class LineAuthStrategy extends PassportStrategy(
  passportLine.Strategy,
  'line',
) {
  constructor(private readonly authService: AuthService) {
    super({
      channelID: envVars.LINE_CHANNEL_ID,
      channelSecret: envVars.LINE_CHANNEL_SECRET,
      callbackURL: envVars.LINE_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    try {
      const { id, displayName, pictureUrl, statusMessage } = profile;
      let email = id;
      if (profile.email) {
        email = profile.email;
      } else if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      }

      const lineUser = {
        email,
        name: displayName || 'LINE User',
        userId: id,
        picture: pictureUrl,
        accessToken,
        statusMessage,
      };

      const user = await this.authService.validateOrCreateLineUser(lineUser);
      done(null, user);
    } catch (error) {
      console.error('LINE authentication error:', error);
      done(error, null);
    }
  }
}
