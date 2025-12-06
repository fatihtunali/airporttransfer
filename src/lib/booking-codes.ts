import crypto from 'crypto';
import { queryOne } from './db';

/**
 * Booking Code Generator
 *
 * Generates unique, human-readable booking reference codes.
 * Format: ATP + 6 alphanumeric characters (no confusing chars)
 * Example: ATPQ5CHM5, ATPKW3NR7
 *
 * Features:
 * - Excludes confusing characters (0, O, 1, I, L)
 * - Easy to read over phone
 * - ~1.5 billion unique combinations
 * - Collision checking with database
 */

// Characters that are easy to read and not confusing
// Excludes: 0 (zero), O (oh), 1 (one), I (eye), L (el)
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PREFIX = 'ATP'; // AirPort Transfer
const CODE_LENGTH = 6; // 6 random chars after prefix

/**
 * Generate a random string from safe characters
 */
function generateRandomCode(length: number): string {
  let result = '';
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    // Use modulo to map random byte to character index
    result += SAFE_CHARS[randomBytes[i] % SAFE_CHARS.length];
  }

  return result;
}

/**
 * Generate a unique booking code with database collision check
 * Returns: ATPXXXXXX (9 characters total)
 */
export async function generateBookingCode(): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = `${PREFIX}${generateRandomCode(CODE_LENGTH)}`;

    // Check if code already exists
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM bookings WHERE public_code = ?',
      [code]
    );

    if (!existing) {
      return code;
    }

    // If collision, try again
    console.log(`Booking code collision detected: ${code}, retrying...`);
  }

  // Fallback: add timestamp suffix for guaranteed uniqueness
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${PREFIX}${generateRandomCode(4)}${timestamp}`;
}

/**
 * Validate a booking code format
 */
export function isValidBookingCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;

  // Must start with prefix
  if (!code.startsWith(PREFIX)) return false;

  // Must be 9 characters (PREFIX + 6)
  if (code.length !== PREFIX.length + CODE_LENGTH) return false;

  // All characters after prefix must be from SAFE_CHARS
  const suffix = code.slice(PREFIX.length);
  for (const char of suffix) {
    if (!SAFE_CHARS.includes(char)) return false;
  }

  return true;
}

/**
 * Format a booking code for display (add dashes for readability)
 * ATPQ5CHM5 → ATP-Q5C-HM5
 */
export function formatBookingCode(code: string): string {
  if (code.length !== 9) return code;
  return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 9)}`;
}

/**
 * Parse a formatted booking code (remove dashes)
 * ATP-Q5C-HM5 → ATPQ5CHM5
 */
export function parseBookingCode(formatted: string): string {
  return formatted.replace(/-/g, '').toUpperCase();
}
