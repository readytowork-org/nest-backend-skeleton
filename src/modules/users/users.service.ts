import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@app/db';
import { userSchema } from '@app/db/schemas/users';
import { eq } from 'drizzle-orm';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  SafeUser,
} from './types/user.types';

@Injectable()
export class UsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findOne(username: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.name, username))
      .limit(1);

    return users[0] || null;
  }

  async findUnique(email: string): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);

    return users[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, id))
      .limit(1);

    return users[0] || null;
  }

  async create(userData: CreateUserInput): Promise<User> {
    const result = await this.drizzle.db.insert(userSchema).values({
      ...userData,
      createdAt: new Date(),
    });

    // Get the created user
    const users = await this.drizzle.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.id, result[0].insertId))
      .limit(1);

    if (!users[0]) {
      throw new Error('Failed to create user');
    }

    return users[0];
  }

  async update(userId: number, userData: UpdateUserInput): Promise<User> {
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

    if (!users[0]) {
      throw new Error('Failed to update user');
    }

    return users[0];
  }

  // Helper method to get user without password for API responses
  async findSafeUser(email: string): Promise<SafeUser | null> {
    const users = await this.drizzle.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        name: userSchema.name,
        authProvider: userSchema.authProvider,
        profilePicture: userSchema.profilePicture,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);

    return users[0] || null;
  }
}
