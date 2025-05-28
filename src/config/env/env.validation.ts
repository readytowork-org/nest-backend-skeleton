import { plainToClass } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  validateSync,
  IsOptional,
  // IsOptional,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  // Seeding credentials it cannot be empty
  @IsString()
  @IsNotEmpty()
  SYSTEM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  SYSTEM_PASSWORD: string;
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
