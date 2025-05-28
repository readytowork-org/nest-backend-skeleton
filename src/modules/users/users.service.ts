import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/db';
import { userSchema } from '@app/db/schemas/users';
import { eq } from 'drizzle-orm';
import { User, NewUser } from './types/user.types';
import { UserRole } from './types/user.role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findOne(username: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.name, username))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
  }

  async findUnique(email: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);

    if (!users.length) return null;

    return users[0] as User;
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

  async create(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<User> {
    const result = await this.drizzle.db.insert(userSchema).values({
      ...userData,
      role: userData.role || UserRole.USER,
      createdAt: new Date(),
    });

    // Get the created user
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, result[0].insertId))
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
      .update(userSchema)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(userSchema.id, userId));

    // Get the updated user
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (!users.length) {
      throw new Error('Failed to update user');
    }

    return users[0] as User;
  }
}
