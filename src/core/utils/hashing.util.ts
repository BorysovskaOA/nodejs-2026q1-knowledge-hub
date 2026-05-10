import * as bcrypt from 'bcrypt';

export async function hash(value: string) {
  return bcrypt.hash(value, Number(process.env.SALT_ROUNDS));
}

export async function hashCompare(value: string, hashedValue: string) {
  return bcrypt.compare(value, hashedValue);
}
