import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findUnique(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async create(user: any): Promise<any | undefined> {
    return this.users.push(user);
  }

  async update(userId: string, user: any): Promise<any | undefined> {
    return this.users.push(user);
  }
}
