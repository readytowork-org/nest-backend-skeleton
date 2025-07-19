/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  OrderedByDto,
  PaginationParams,
  PaginationReturn,
} from './types/pagination';
import { and, desc, sql } from 'drizzle-orm';
import { ORDERABLE_FIELDS } from '@app/common/constants/orderable-fields';
import { AnyMySqlSelect } from 'drizzle-orm/mysql-core';
import { LIMIT, PAGE } from './pagination.config';
import { Schema } from '@app/common/types/type/schema.type';

@Injectable()
export class PaginationService {
  async paginate<T>({
    baseQuery,
    countQuery,
    table,
    filters,
    limit = LIMIT,
    page = PAGE,
    groupByColumn,
    orderBy,
  }: PaginationParams): Promise<PaginationReturn<T>> {
    const offset = (page - 1) * limit;

    const limitedQuery = baseQuery.limit(limit) as AnyMySqlSelect;

    const paginatedQuery = limitedQuery.offset(offset) as AnyMySqlSelect;

    const whereClause = filters?.length > 0 ? and(...filters) : undefined;

    if (whereClause) {
      baseQuery.where(whereClause);
      countQuery.where(whereClause);
    }

    if (groupByColumn) {
      paginatedQuery.groupBy(...groupByColumn.map((col) => sql`${col}`));
    }

    if (orderBy && typeof orderBy === 'string') {
      const orderedByDto: OrderedByDto = JSON.parse(orderBy);
      const tableName = this.getDrizzleTableName(table);

      if (!tableName) {
        throw new Error('Not a valid Drizzle table schema passed.');
      }

      const fields = ORDERABLE_FIELDS[tableName];

      const isOrderByFieldAllowed =
        Array.isArray(fields) && fields.includes(orderedByDto.field);

      if (!isOrderByFieldAllowed) {
        throw new Error(
          `${orderedByDto.field} is not allowed in sortable fields`,
        );
      }

      if (
        orderedByDto.field &&
        orderedByDto.direction &&
        isOrderByFieldAllowed
      ) {
        const column = table[orderedByDto.field as keyof typeof table];
        if (column) {
          paginatedQuery.orderBy(
            sql`${column} ${sql.raw(orderedByDto.direction)}`,
          );
        }
      }
    } else {
      paginatedQuery.orderBy(desc(table.createdAt));
    }

    const [result, countResult] = await Promise.all([
      paginatedQuery as Promise<T[]>,
      countQuery as Promise<{ count: number }[]>,
    ]);

    const totalCount = countResult[0]?.count ?? 0;
    const totalItems = result.length;

    return {
      data: result,
      meta: {
        totalCount,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  getDrizzleTableName(table: Schema): string | undefined {
    const baseNameSymbol = Object.getOwnPropertySymbols(table).find(
      (s) => s.toString() === 'Symbol(drizzle:BaseName)',
    );
    if (!baseNameSymbol) return undefined;

    return table[baseNameSymbol] as string;
  }
}
