import { hash, hashCompare } from 'src/core/utils/hashing.util';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('Bcrypt Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SALT_ROUNDS = '10';
  });

  describe('hash', () => {
    it('should call bcrypt.hash with correct arguments', async () => {
      const password = 'password123';
      const mockHashed = 'hashed_string';

      vi.mocked(bcrypt.hash).mockResolvedValue(mockHashed as never);

      const result = await hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(mockHashed);
    });
  });

  describe('hashCompare', () => {
    it('should return true when bcrypt.compare succeeds', async () => {
      const password = 'password123';
      const mockHashed = 'hashed_string';

      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await hashCompare(password, mockHashed);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockHashed);
      expect(result).toBe(true);
    });

    it('should return false when bcrypt.compare fails', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await hashCompare('wrong', 'hashed');
      expect(result).toBe(false);
    });
  });
});
