import { Injectable } from '@nestjs/common';
import { User } from './user.interface';

@Injectable()
export class UserRepository {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
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

  update(id: string, userData: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return;

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
