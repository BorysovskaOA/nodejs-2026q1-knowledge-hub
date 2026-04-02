import { Injectable } from '@nestjs/common';
import { User } from './user.interface';
import { CreateUserDto } from './dtos/createUser.dto';

@Injectable()
export class UserRepository {
  private users: User[] = [];

  create(userData: CreateUserDto): User {
    const createdAt = Date.now();
    const user: User = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt,
      updatedAt: createdAt,
    };

    this.users.push(user);

    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    return this.users.find((u) => u.id === id);
  }

  update(id: string, userData: Partial<User>): User {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = {
      ...this.users[index],
      ...userData,
      updatedAt: Date.now(),
    };

    return this.users[index];
  }

  delete(id: string): boolean {
    const updatedUsers = this.users.filter((u) => u.id !== id);
    const updated = this.users.length !== updatedUsers.length;
    this.users = updatedUsers;
    return updated;
  }
}
