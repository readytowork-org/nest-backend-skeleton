/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  OrderedByDto,
  PaginationParams,
  PaginationReturn,
} from './types/pagination';
import { and, desc, SQL, sql } from 'drizzle-orm';
import { AnyMySqlSelect } from 'drizzle-orm/mysql-core';
import { LIMIT, PAGE } from './pagination.config';
import { Schema } from '@app/common/types/type/schema.type';
import { ORDERABLE_FIELDS } from '@app/common';

@Injectable()
export class PaginationService {
  /**
   * Paginates query results with filtering, grouping, and ordering capabilities.
   *
   * @template T - The type of items being paginated
   * @param {PaginationParams} params - Pagination configuration
   * @param {SelectQueryBuilder} params.baseQuery - The base select query to paginate
   * @param {SelectQueryBuilder} params.countQuery - The count query for total records
   * @param {Schema} params.table - The Drizzle table schema
   * @param {SQL[]} [params.filters] - Optional array of WHERE clause filters
   * @param {number} [params.limit=LIMIT] - Number of items per page
   * @param {number} [params.page=PAGE] - Current page number (1-indexed)
   * @param {string[]} [params.groupByColumn] - Optional columns to group by
   * @param {string | SQL | SQL[]} [params.orderBy] - Sort order as JSON string, SQL instance, or array of SQL instances
   * @returns {Promise<PaginationReturn<T>>} Paginated results with metadata
   * @throws {Error} When orderBy field is not in ORDERABLE_FIELDS or invalid table schema is passed
   *
   * @example
   * const result = await paginationService.paginateWith({
   *   baseQuery: db.select().from(usersTable),
   *   countQuery: db.select({ count: count() }).from(usersTable),
   *   table: usersTable,
   *   filters: [eq(usersTable.active, true)],
   *   limit: 20,
   *   page: 1,
   *   orderBy: JSON.stringify({ field: 'createdAt', direction: 'DESC' })
   * });
   */

  ALL_LIMIT = -1;
  async paginateWith<T>({
    baseQuery,
    countQuery,
    table,
    filters,
    limit = LIMIT,
    page = PAGE,
    groupByColumn,
    orderBy,
  }: PaginationParams): Promise<PaginationReturn<T>> {
    const whereClause = filters?.length > 0 ? and(...filters) : undefined;
    if (whereClause) {
      baseQuery.where(whereClause);
      countQuery.where(whereClause);
    }
    if (groupByColumn) {
      baseQuery.groupBy(...groupByColumn.map((col) => sql`${col}`));
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
          baseQuery.orderBy(sql`${column} ${sql.raw(orderedByDto.direction)}`);
        }
        if (!column) {
          baseQuery.orderBy(
            sql`${sql.raw(orderedByDto.field)} ${sql.raw(orderedByDto.direction)}`,
          );
        }
      }
    } else if (
      (orderBy && typeof orderBy === 'object' && SQL) ||
      (Array.isArray(orderBy) && orderBy.every((o) => o instanceof SQL))
    ) {
      Array.isArray(orderBy)
        ? baseQuery.orderBy(...orderBy)
        : baseQuery.orderBy(orderBy);
    } else {
      baseQuery.orderBy(desc(table.createdAt));
    }

    return this.paginate({
      baseQuery: baseQuery,
      countQuery: countQuery,
      limit,
      page,
    });
  }

  /**
   * Paginates the results of a query.
   *
   * @template T - The type of the items in the paginated result.
   * @param {Object} params - The parameters for pagination.
   * @param {AnyMySqlSelect} params.baseQuery - The base query to paginate.
   * @param {Promise<{ count: number }[]>} params.countQuery - The query to count total items.
   * @param {number} [params.limit=LIMIT] - The maximum number of items to return per page.
   * @param {number} [params.page=PAGE] - The current page number.
   * @returns {Promise<PaginationReturn<T>>} A promise that resolves to an object containing the paginated data and metadata.
   * @throws {Error} Throws an error if the pagination fails.
   */
  async paginate<T>({
    baseQuery,
    countQuery,
    limit = LIMIT,
    page = PAGE,
  }: Omit<
    PaginationParams,
    'table' | 'filters' | 'groupByColumn' | 'orderBy'
  >): Promise<PaginationReturn<T>> {
    const isUnlimited = limit === this.ALL_LIMIT;
    const limitedQuery = isUnlimited
      ? baseQuery
      : (baseQuery.limit(+limit) as AnyMySqlSelect);
    const offset = (page - 1) * Number(limit);
    const paginatedQuery = isUnlimited
      ? limitedQuery
      : (limitedQuery.offset(offset) as AnyMySqlSelect);
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
        limit: isUnlimited ? this.ALL_LIMIT : limit,
        totalPages: isUnlimited ? 1 : Math.ceil(totalCount / limit),
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
