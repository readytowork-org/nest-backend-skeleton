import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { AnyMySqlSelect } from 'drizzle-orm/mysql-core';
import { AnyColumn, SQL } from 'drizzle-orm';
import { Schema } from '@app/common/types/type/schema.type';

export class PaginationParams {
  baseQuery: AnyMySqlSelect;
  countQuery: AnyMySqlSelect;
  table: Schema;
  filters: SQL[];
  page?: number;
  limit?: number;
  groupByColumn: AnyColumn[];
  orderBy?: string;
}

export class PaginationMeta {
  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginationReturn<T> {
  data: T[];

  meta: PaginationMeta;
}

export class OrderedByDto {
  @ApiPropertyOptional({ example: 'createdAt' })
  @IsString()
  field?: string;

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsIn(['asc', 'desc'])
  direction?: 'asc' | 'desc';
}

export class PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    required: false,
    description:
      'write json as { "field": "fieldName", "direction": "asc" | "desc" }',
    example: '{ "field": "createdAt", "direction": "asc" }',
  })
  @IsOptional()
  orderBy?: string;
}
