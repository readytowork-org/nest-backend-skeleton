import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AccountStatusEnum, UserRole } from '@app/common/types/enum';
import { PaginationDto } from '@app/services/pagination/types';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  middleName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  phoneNumber: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  role?: UserRole;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  confirmPassword: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  province: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  country: string;

  @ApiProperty({ required: false })
  @IsEnum(AccountStatusEnum, {
    message: `status enums - ${Object.values(AccountStatusEnum).join(', ')}`,
  })
  @IsOptional()
  status: AccountStatusEnum;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  profilePicture: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nationalId: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  licenceDocument: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certificationDocument1: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certificationDocument2: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certificationDocument3: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certificationDocument4: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certificationDocument5: string;
}

export class UpdatedUserDto extends PartialType(CreateUserDto) {}

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  keyword?: string;
}

export class BulkDeleteUserDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsNumberString({}, { each: true })
  user_ids?: string[];
}
