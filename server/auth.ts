import crypto from 'node:crypto';

/**
 * Hash a plain text password with a random salt using scrypt
 */
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Verify a plain text password against stored salt and expected hash
 */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    if (derived.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(derived, expectedBuf);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure 64-character hex session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
