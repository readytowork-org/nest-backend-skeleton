import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BaseDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  deletedAt: string;
}

export type WithoutTimestamps<T> = Omit<T, keyof BaseDto>;
