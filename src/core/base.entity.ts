import { InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export abstract class BaseEntity<T extends { id: string }> {
  id: string;

  constructor(partial: Omit<T, 'id'>) {
    Object.assign(this, partial);
    this.id = randomUUID();
  }

  update(data: Partial<T>): T {
    if (data.id && this.id !== data.id) {
      throw new InternalServerErrorException('Trying to update wrong entity');
    }
    Object.assign(this, data);
    return this as unknown as T;
  }
}
