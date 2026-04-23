import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BaseDto } from '../../type/base.dto';

export class StaffDetailDto extends BaseDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  isActive: number;

  @ApiProperty({ type: String, required: true })
  @IsString()
  notes: string | null;

  @ApiProperty()
  @IsString()
  role: string | null;

  @ApiProperty({ type: String, required: true })
  @IsString()
  lastLoginAt: string | null;
}
