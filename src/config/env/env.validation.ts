import { Type, plainToClass } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  validateSync,
  IsOptional,
  IsNumber,
} from 'class-validator';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envFile = dotenv.parse(fs.readFileSync(envPath));
export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  ENVIRONMENT: string;

  @IsString()
  @IsNotEmpty()
  TZ: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ADMINER_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  // Seeding credentials it cannot be empty
  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_TYPE: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  SYSTEM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  SYSTEM_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL: string;

  @IsString()
  @IsOptional()
  FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET_NAME: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_FRONTEND_URL: string;

  @IsString()
  @IsNotEmpty()
  MAIL_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  MAIL_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  MAIL_REFRESH_TOKEN: string;

  @IsString()
  @IsNotEmpty()
  MAIL_ACCESS_TOKEN: string;

}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export const envVars = validate(envFile);
