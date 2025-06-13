import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { CPaasResponse } from './types';
import { envVars } from '@app/config/env/env.validation';

@Injectable()
export class SmsService {
  public readonly logger = new Logger(SmsService.name);

  constructor(private readonly httpService: HttpService) {}

  async sendSms(to: string, text: string, userReference: string) {
    const payload = {
      to,
      text,
      click_tracking: true,
      user_reference: userReference,
      bill_split_code: 'bill_split_code-1',
    };

    const apiToken = envVars.CPASS_SMS_TOKEN;
    const url = envVars.CPASS_SMS_LINK;
    if (!apiToken || !url) {
      throw new Error(
        'CPASS_SMS_TOKEN or CPASS_SMS_LINK is not defined in the environment variables',
      );
    }

    this.logger.log(`Sending sms to user with phone number ${to}`);

    const response = await lastValueFrom(
      this.httpService.post<CPaasResponse>(url, payload, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );

    if (response.status === 202 && response.data?.delivery_order_id) {
      this.logger.log(
        `Sending sms to user with phone number ${to} succeed with delivery_order_id: ${response.data?.delivery_order_id}`,
      );

      return {
        success: true,
        message: `SMS sent. Delivery ID: ${response.data.delivery_order_id}`,
      };
    }

    this.logger.error(`Sending sms to user with phone number ${to} failed.`);

    return {
      success: false,
      message: 'Unexpected response format from CPaaS.',
    };
  }
}
