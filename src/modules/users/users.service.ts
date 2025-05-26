import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/db';
import { usersTable } from '@app/db/schemas/users';
import { eq } from 'drizzle-orm';
import { User, NewUser } from './types/user.types';

@Injectable()
export class UsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findOne(username: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.name, username))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async findUnique(email: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async findById(id: number): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async create(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<User> {
    const result = await this.drizzle.db.insert(usersTable).values({
      ...userData,
      createdAt: new Date(),
    });

    // Get the created user
    const users = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, result[0].insertId))
      .limit(1);

    if (!users.length) {
      throw new Error('Failed to create user');
    }

    return users[0] as User;
  }

  async update(
    userId: number,
    userData: Partial<Omit<NewUser, 'id' | 'createdAt'>>,
  ): Promise<User> {
    await this.drizzle.db
      .update(usersTable)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    // Get the updated user
    const users = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!users.length) {
      throw new Error('Failed to update user');
    }

    return users[0] as User;
  }
}
