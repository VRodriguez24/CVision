import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedHash] = passwordHash.split(':');

  if (algorithm !== 'scrypt' || !salt || !storedHash) {
    return false;
  }

  const storedKey = Buffer.from(storedHash, 'hex');
  const derivedKey = await scryptAsync(password, salt, storedKey.length);

  return timingSafeEqual(storedKey, derivedKey);
}
