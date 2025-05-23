import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ example: 'Complete NestJS project' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({ example: 'Implement repository pattern with Prisma' })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2023-12-31T23:59:59Z' })
  @IsDateString({}, { message: 'Due date must be a valid date' })
  @IsOptional()
  dueDate?: string;
}

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean({ message: 'Completed must be a boolean' })
  @IsOptional()
  completed?: boolean;

  @ApiPropertyOptional({ example: '2023-12-31T23:59:59Z' })
  @IsDateString({}, { message: 'Due date must be a valid date' })
  @IsOptional()
  dueDate?: string;
}
