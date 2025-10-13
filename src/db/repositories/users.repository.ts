import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/db';
import { userSchema } from '@app/db/schemas/users';
import { eq, gt, and, or, sql, SQL, like, inArray } from 'drizzle-orm';
import { UserRole } from '../../common/types/enum/user.role.enum';
import {
  BulkDeleteUserDto,
  NewUser,
  PaginatedUserResponseDto,
  QueryUserDto,
  ReturningId,
  User,
} from '@app/common/types';
import { ResultSetHeader } from 'mysql2';
import { WithoutTimestamps } from '@app/common/types/type/base.dto';
import { PaginationService } from '@app/services/pagination/pagination.service';

@Injectable()
export class UserRepository {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly paginationService: PaginationService,
  ) {}

  async findByFilter(
    queryDto: QueryUserDto,
  ): Promise<PaginatedUserResponseDto> {
    const { keyword, page, limit, orderBy } = queryDto;
    let baseQuery = this.drizzle.db
      .select({
        id: userSchema.id,
        firstName: userSchema.firstName,
        middleName: userSchema.middleName,
        lastname: userSchema.lastName,
        email: userSchema.email,
        phoneNumber: userSchema.phoneNumber,
        role: userSchema.role,
        status: userSchema.status,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
        deletedAt: userSchema.deletedAt,
      })
      .from(userSchema)

    let countQuery = this.drizzle.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userSchema);

    const filters: SQL[] = [];

    if (keyword) {
      const searchPattern = `%${keyword}%`;
      const searchCondition = or(
        like(userSchema.firstName, searchPattern),
        like(userSchema.middleName, searchPattern),
        like(userSchema.lastName, searchPattern),
      );

      filters.push(searchCondition as SQL);
    }
    return this.paginationService.paginate({
      baseQuery: baseQuery as any,
      countQuery,
      table: userSchema,
      filters,
      limit,
      page,
      orderBy,
      groupByColumn: [userSchema.id],
    });
  }

  async remove(id: number): Promise<ResultSetHeader> {
    const [result] = await this.drizzle.db
      .delete(userSchema)
      .where(eq(userSchema.id, id));

    return result;
  }

  async bulkRemove(deleteDtos: BulkDeleteUserDto): Promise<ResultSetHeader> {
    const userIds = (deleteDtos.user_ids ?? [])
      .map(Number)
      .filter((id) => !isNaN(id));

    const [result] = await this.drizzle.db
      .delete(userSchema)
      .where(inArray(userSchema.id, userIds));

    return result;
  }

  async findOne(username: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.firstName, username))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User> {
    const [user] = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.phoneNumber, phoneNumber))
      .limit(1);

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async findDetailById(id: number): Promise<User> {
    const [user] = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1);

    return user;
  }

  async findUserByEmailAndRole(
    email: string,
    role: UserRole,
  ): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(and(eq(userSchema.email, email), eq(userSchema.role, role)))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async create(
    userData: WithoutTimestamps<NewUser>,
    tx?: typeof this.drizzle.db,
  ): Promise<ReturningId> {
    const [result] = await (tx || this.drizzle.db)
      .insert(userSchema)
      .values({
        ...userData,
        role: userData.role || UserRole.ADMIN,
      })
      .$returningId();
    return result;
  }

  async update(
    userId: number,
    userData: Partial<Omit<NewUser, 'id' | 'createdAt'>>,
    tx?: typeof this.drizzle.db,
  ): Promise<ResultSetHeader> {
    const [result] = await (tx || this.drizzle.db)
      .update(userSchema)
      .set({
        ...userData,
      })
      .where(eq(userSchema.id, userId));

    return result;
  }

  async findByHashToken(hashedToken: string): Promise<User | undefined> {
    const now = new Date();

    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(
        and(
          eq(userSchema.resetPasswordToken, hashedToken),
          gt(userSchema.resetPasswordTokenExpiresAt, now),
        ),
      )
      .limit(1);

    return users[0];
  }
}
