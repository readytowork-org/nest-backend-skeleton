import { plainToClass } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  validateSync,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 3306;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string = 'root';

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string = 'root';

  @IsString()
  @IsNotEmpty()
  DB_NAME: string = 'nestjs_db';
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
