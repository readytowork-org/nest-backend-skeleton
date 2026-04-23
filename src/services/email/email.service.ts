import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import * as path from 'path';
import { EmailWithTemplateData, PlainEmailData } from './types';
import { envVars } from '@app/config/env/env.validation';
import { gmail_v1, google } from 'googleapis';

@Injectable()
export class EmailService {
  logger = new Logger();
  client: gmail_v1.Gmail;

  constructor() {
    const oauthClient = new google.auth.OAuth2(
      envVars.MAIL_CLIENT_ID,
      envVars.MAIL_CLIENT_SECRET,
    );
    oauthClient.setCredentials({
      access_token: envVars.MAIL_ACCESS_TOKEN,
      refresh_token: envVars.MAIL_REFRESH_TOKEN,
    });
    this.client = google.gmail({
      version: 'v1',
      auth: oauthClient,
    });
  }

  private async getTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'assets',
      'templates',
      `${templateName}.hbs`,
    );
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const template = Handlebars.compile(fileContent);
    return template(context);
  }

  async sendEmail({ to, subject, text }: PlainEmailData): Promise<void> {
    const rawMessage = Buffer.from(
      `To: ${to}\r\nSubject: ${subject}\r\n\r\n${text}`,
    ).toString('base64');
    try {
      await this.client.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: rawMessage,
        },
      });
    } catch (err: any) {
      this.logger.error(`${EmailService.name}: error sending email`, err);
    }
  }

  async sendEmailWithTemplate({
    to,
    subject,
    templateName,
    context,
  }: EmailWithTemplateData): Promise<void> {
    try {
      const compiledTemplate = await this.getTemplate(templateName, context);
      const msg = { to, subject, text: compiledTemplate };
      await this.sendEmail(msg);
    } catch (err: any) {
      const error = err as Error;
      this.logger.error(
        `${EmailService.name}: ${error?.message}: ${error?.stack}`,
      );
      throw err;
    }
  }
}
