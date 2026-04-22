import { instanceToPlain } from 'class-transformer';
import { UserEntity } from 'src/user/models/user.entity';
import { describe, it, expect } from 'vitest';

const rawData = {
  id: 'id',
  login: 'login',
  passwordHash: 'passwordHash',
  tokenVersion: 1,
  role: 'viewer',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('User Entity', () => {
  it('return data', () => {
    const entity = new UserEntity(rawData as any);

    expect(entity).toMatchObject(rawData);
  });

  it('should transform dates', () => {
    const entity = new UserEntity(rawData as any);

    const plainEntity = instanceToPlain(entity);

    expect(typeof plainEntity.createdAt).toBe('number');
    expect(typeof plainEntity.updatedAt).toBe('number');
  });

  it("should exclude 'passwordHash' and 'tokenVersion'", () => {
    const entity = new UserEntity(rawData as any);

    const plainEntity = instanceToPlain(entity);

    expect(plainEntity.passwordHash).toBeUndefined();
    expect(plainEntity.tokenVersion).toBeUndefined();
  });
});
