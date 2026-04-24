import { Injectable, Logger } from '@nestjs/common';
import { and, desc, eq, like, SQL, sql } from 'drizzle-orm';
import {
  AccountStatusEnum,
  CreateStaffDto,
  GetAllStaffQueryDto,
  PaginatedStaffDto,
  ReturningId,
  StaffDetailDto,
  UpdatedStaffDto,
  USER_ROLE,
} from '@app/common/types';
import { Staff } from '@app/common/types/type/staff.type';
import { staffs } from '@app/db/schemas';
import { PaginationService } from '@app/services/pagination/pagination.service';
import { AnyMySqlSelect } from 'drizzle-orm/mysql-core';
import { OrmService } from '@config/orm/orm.interface';

@Injectable()
export class StaffRepository {
  logger = new Logger(StaffRepository.name);

  constructor(
    private readonly orm: OrmService,
    private readonly paginationService: PaginationService,
  ) {}

  async findByEmail(email: string): Promise<Staff | null> {
    const [_user] = await this.orm.db
      .select()
      .from(staffs)
      .where(eq(staffs.email, email))
      .limit(1);

    return _user as Staff;
  }

  async findById(id: number): Promise<Staff | null> {
    const [_user] = await this.orm.db
      .select()
      .from(staffs)
      .where(and(eq(staffs.id, id)))
      .limit(1);
    return _user as Staff;
  }

  async create(
    role: USER_ROLE.STAFF | USER_ROLE.ADMIN,
    data: CreateStaffDto,
  ): Promise<ReturningId | null> {
    const [result] = await this.orm.db.insert(staffs).values({
      ...data,
      role: role,
    });
    return {
      id: result?.insertId,
    } as ReturningId;
  }

  async getAllStaff(query: GetAllStaffQueryDto): Promise<PaginatedStaffDto> {
    const { name, accountStatus, limit } = query;
    const filters: SQL<unknown>[] = [eq(staffs.role, USER_ROLE.STAFF)];
    if (accountStatus === AccountStatusEnum.Active) {
      filters.push(eq(staffs.isActive, 1));
    }
    if (accountStatus === AccountStatusEnum.Suspended) {
      filters.push(eq(staffs.isActive, 0));
    }
    if (name) {
      filters.push(like(staffs.name, `%${name}%`));
    }

    const baseQuery = this.orm.db
      .select()
      .from(staffs)
      .where(and(...filters))
      .orderBy(desc(staffs.createdAt));

    const countQuery = this.orm.db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(staffs)
      .where(and(...filters));

    return this.paginationService.paginate<StaffDetailDto>({
      baseQuery: baseQuery as unknown as AnyMySqlSelect,
      countQuery: countQuery as unknown as AnyMySqlSelect,
      limit: limit || 10,
      page: query.page || 1,
    });
  }

  async updateStaff(
    staffId: number,
    payload: UpdatedStaffDto,
  ): Promise<ReturningId | null> {
    const db = this.orm.db;
    const [result] = await db
      .update(staffs)
      .set({ ...(payload as any) })
      .where(and(eq(staffs.id, staffId), eq(staffs.role, USER_ROLE.STAFF)));
    return {
      id: result?.insertId,
    } as ReturningId;
  }
}
