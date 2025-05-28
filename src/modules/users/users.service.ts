import { Injectable } from '@nestjs/common';
import { userSchema } from '@app/db/schemas/users';
import { eq } from 'drizzle-orm';
import { User, NewUser } from './types/user.types';
import { UserRole } from './types/user.role.enum';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne(username);
  }

  async findUnique(email: string): Promise<User | null> {
    return this.userRepository.findUnique(email);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async create(
    userData: NewUser
  ): Promise<User> {
    return this.userRepository.create({
      ...userData,
      role: userData.role || UserRole.USER
    });
  }

  async update(
    userId: number,
    userData: NewUser
  ): Promise<User> {
    return this.userRepository.update(userId, {
      ...userData,
      updatedAt: new Date(),
    });
  }
}
