/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  OrderedByDto,
  PaginationParams,
  PaginationReturn,
} from './types/pagination';
import { and, desc, sql } from 'drizzle-orm';
import { ORDERABLE_FIELDS } from '@app/common/constants/orderable-fields.constant';
import { AnyMySqlSelect } from 'drizzle-orm/mysql-core';
import { LIMIT, PAGE } from './pagination.config';
import { Schema } from '@app/common/types';

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
    // Ensure limit and page are numbers
    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const offset = (numericPage - 1) * numericLimit;
    const whereClause = filters?.length > 0 ? and(...filters) : undefined;
    // Apply where clause first
    if (whereClause) {
      baseQuery = baseQuery.where(whereClause) as AnyMySqlSelect;
      countQuery = countQuery.where(whereClause) as AnyMySqlSelect;
    }

    // Handle infinite limit case
    let limitedQuery: AnyMySqlSelect;
    if (numericLimit === Number.POSITIVE_INFINITY) {
      limitedQuery = baseQuery;
    } else {
      limitedQuery = baseQuery.limit(numericLimit) as AnyMySqlSelect;
    }

    // Handle offset for infinite limit case
    let paginatedQuery: AnyMySqlSelect;
    if (numericLimit === Number.POSITIVE_INFINITY) {
      paginatedQuery = limitedQuery;
    } else {
      paginatedQuery = limitedQuery.offset(offset) as AnyMySqlSelect;
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
      // Check if the table has a createdAt property before accessing it
      if ('createdAt' in table && table.createdAt) {
        paginatedQuery.orderBy(desc(table.createdAt));
      } else {
        // Fallback to ordering by id if createdAt is not available
        if ('id' in table && table.id) {
          paginatedQuery.orderBy(desc(table.id));
        }
      }
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
        page: numericPage,
        limit: numericLimit,
        totalPages: Math.ceil(totalCount / numericLimit),
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
