import * as bcrypt from 'bcrypt';

export async function hash(value: string, saltRounds: number) {
  return bcrypt.hash(value, saltRounds);
}

export async function hashCompare(value: string, hashedValue: string) {
  return bcrypt.compare(value, hashedValue);
}
