import { Injectable } from '@nestjs/common';
import { DrizzleService, UserRepository } from '@app/db';
import { ResultSetHeader } from 'mysql2';
import { User, UserRole, NewUser, ReturningId } from '@app/common/types';
import { WithoutTimestamps } from '@app/common/types/type/base.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly drizzleService: DrizzleService,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return await this.userRepository.findOne(username);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.userRepository.findByPhoneNumber(phoneNumber);
  }

  async findUnique(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findDetailById(id: number): Promise<User> {
    return await this.userRepository.findDetailById(id);
  }

  async findByHashToken(hashedToken: string): Promise<User | undefined> {
    return await this.userRepository.findByHashToken(hashedToken);
  }

  async findUserByEmailAndRole(
    email: string,
    role: UserRole,
  ): Promise<User | null> {
    return await this.userRepository.findUserByEmailAndRole(email, role);
  }

  async create(
    userData: WithoutTimestamps<NewUser>,
    tx?: typeof this.drizzleService.db,
  ): Promise<ReturningId> {
    return this.userRepository.create(
      {
        ...userData,
        role: userData.role || UserRole.ADMIN,
      },
      tx,
    );
  }

  async update(
    userId: number,
    userData: Partial<Omit<NewUser, 'id' | 'createdAt'>>,
    tx?: typeof this.drizzleService.db,
  ): Promise<ResultSetHeader> {
    return this.userRepository.update(
      userId,
      {
        ...userData,
      },
      tx,
    );
  }
}
