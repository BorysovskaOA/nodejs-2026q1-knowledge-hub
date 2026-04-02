import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  private users: User[] = [];

  create(user: User) {
    this.users.push(user);
  }

  getAll() {
    return this.users;
  }

  getById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  update(id: string, user: User) {
    this.users = this.users.map((u) => (u.id === id ? user : u));
  }

  delete(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
  }
}
