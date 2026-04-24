import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isActive: number;

  @ApiProperty({ required: false })
  @IsOptional()
  notes: string;
}

export class UpdatedStaffDto extends PartialType(CreateStaffDto) {}
