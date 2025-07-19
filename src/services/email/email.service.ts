import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import * as path from 'path';
import { EmailWithTemplateData, PlainEmailData } from './types';
import { envVars } from '@app/config/env/env.validation';

@Injectable()
export class EmailService {
  constructor() {
    const apiKey = envVars.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error(
        'SENDGRID_API_KEY is not defined in the environment variables',
      );
    }
    sgMail.setApiKey(apiKey);
  }

  private async getTemplate(
    templateName: string,
    variables: Record<string, any>,
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
    return template(variables);
  }

  async sendEmail({ to, subject, text }: PlainEmailData): Promise<void> {
    const fromEmail = envVars.FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('FROM_EMAIL is not defined in the environment variables');
    }
    const msg = {
      to,
      from: fromEmail,
      subject,
      text,
    };
    await sgMail.send(msg);
  }

  async sendEmailWithTemplate({
    to,
    subject,
    templateName,
    data,
  }: EmailWithTemplateData): Promise<void> {
    const fromEmail = envVars.FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('FROM_EMAIL is not defined in the environment variables');
    }
    const html = await this.getTemplate(templateName, data);
    const msg = {
      to,
      from: fromEmail,
      subject,
      html,
    };
    await sgMail.send(msg);
  }
}
