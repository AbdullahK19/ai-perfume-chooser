import crypto from 'crypto';

/**
 * AUTH UTILITIES
 *
 * These functions handle the core auth logic:
 * - Normalizing and hashing email/phone
 * - Generating OTP codes
 * - Creating secure session tokens
 */

/**
 * Normalize an email address
 *
 * Rules:
 * - Convert to lowercase
 * - Trim whitespace
 *
 * @param email - Raw email from user input
 * @returns Normalized email
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize a phone number
 *
 * Rules:
 * - Remove all non-digit characters (spaces, dashes, parentheses)
 * - Keep only the digits
 *
 * Example: "+1 (555) 123-4567" becomes "15551234567"
 *
 * @param phone - Raw phone from user input
 * @returns Normalized phone (digits only)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Hash a string using SHA-256
 *
 * This creates a one-way hash - you can't reverse it to get the original.
 * We use this for email/phone to avoid storing them directly.
 *
 * @param input - String to hash
 * @returns 64-character hex string (SHA-256 hash)
 */
export function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Hash an email address
 *
 * Normalizes first, then hashes.
 *
 * @param email - Raw email
 * @returns SHA-256 hash of normalized email
 */
export function hashEmail(email: string): string {
  const normalized = normalizeEmail(email);
  return hashString(normalized);
}

/**
 * Hash a phone number
 *
 * Normalizes first, then hashes.
 *
 * @param phone - Raw phone
 * @returns SHA-256 hash of normalized phone
 */
export function hashPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  return hashString(normalized);
}

/**
 * Generate a random 6-digit OTP code
 *
 * Uses crypto.randomInt for cryptographically secure randomness.
 *
 * @returns 6-digit code as a string (e.g., "123456")
 */
export function generateOTP(): string {
  // Generate random number between 0 and 999999
  const code = crypto.randomInt(0, 1000000);

  // Pad with zeros if needed to ensure 6 digits
  return code.toString().padStart(6, '0');
}

/**
 * Calculate expiry time for OTP code
 *
 * @param minutes - How many minutes until expiry (default: 5)
 * @returns Date object representing expiry time
 */
export function getOTPExpiry(minutes: number = 5): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * Check if an OTP code is still valid
 *
 * @param expiresAt - Expiry date from database
 * @returns true if not expired, false if expired
 */
export function isOTPValid(expiresAt: Date): boolean {
  return new Date() < expiresAt;
}