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

  findOne(username: string): any {
    return this.users.find((user) => user.username === username);
  }

  findUnique(username: string): any {
    return this.users.find((user) => user.username === username);
  }

  create(user: any): any {
    return this.users.push(user);
  }

  update(userId: string, user: any): any {
    return this.users.push(user);
  }
}
