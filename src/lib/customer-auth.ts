/**
 * Customer Authentication System
 * Handles registration, login, and OAuth for customer accounts
 */

import { queryOne, insert, execute, query } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

interface CustomerRow {
  id: number;
  email: string;
  password_hash: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  google_id: string | null;
  is_email_verified: boolean;
  is_active: boolean;
  preferred_currency: string;
  total_bookings: number;
  loyalty_points: number;
}

interface CustomerSession {
  id: number;
  customer_id: number;
  token: string;
  expires_at: Date;
}

// Session duration: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Register a new customer
 */
export async function registerCustomer(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  marketingConsent?: boolean;
}): Promise<{ success: boolean; customerId?: number; error?: string }> {
  // Check if email already exists
  const existing = await queryOne<{ id: number }>(
    'SELECT id FROM customers WHERE email = ?',
    [data.email.toLowerCase()]
  );

  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create customer
  const customerId = await insert(
    `INSERT INTO customers (email, password_hash, first_name, last_name, phone, marketing_consent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.email.toLowerCase(),
      passwordHash,
      data.firstName || null,
      data.lastName || null,
      data.phone || null,
      data.marketingConsent || false,
    ]
  );

  // Generate email verification token
  const verificationToken = generateToken();
  await insert(
    `INSERT INTO customer_verification_tokens (customer_id, token, type, expires_at)
     VALUES (?, ?, 'EMAIL_VERIFY', DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
    [customerId, verificationToken]
  );

  // TODO: Send verification email
  // await sendCustomerVerificationEmail(data.email, verificationToken);

  return { success: true, customerId };
}

/**
 * Login customer with email and password
 */
export async function loginCustomer(
  email: string,
  password: string
): Promise<{ success: boolean; customer?: CustomerRow; token?: string; error?: string }> {
  const customer = await queryOne<CustomerRow>(
    `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url,
            google_id, is_email_verified, is_active, preferred_currency,
            total_bookings, loyalty_points
     FROM customers
     WHERE email = ?`,
    [email.toLowerCase()]
  );

  if (!customer) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (!customer.is_active) {
    return { success: false, error: 'Account is disabled' };
  }

  if (!customer.password_hash) {
    return { success: false, error: 'Please use Google to sign in to this account' };
  }

  const passwordValid = await verifyPassword(password, customer.password_hash);
  if (!passwordValid) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Create session
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await insert(
    `INSERT INTO customer_sessions (customer_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [customer.id, token, expiresAt]
  );

  // Update last login
  await execute(
    'UPDATE customers SET last_login_at = NOW() WHERE id = ?',
    [customer.id]
  );

  return { success: true, customer, token };
}

/**
 * Login or register with Google OAuth
 */
export async function googleAuth(data: {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}): Promise<{ success: boolean; customer?: CustomerRow; token?: string; isNewUser?: boolean; error?: string }> {
  // Check if user exists by Google ID
  let customer = await queryOne<CustomerRow>(
    `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url,
            google_id, is_email_verified, is_active, preferred_currency,
            total_bookings, loyalty_points
     FROM customers
     WHERE google_id = ?`,
    [data.googleId]
  );

  let isNewUser = false;

  if (!customer) {
    // Check if email exists (link account)
    customer = await queryOne<CustomerRow>(
      `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url,
              google_id, is_email_verified, is_active, preferred_currency,
              total_bookings, loyalty_points
       FROM customers
       WHERE email = ?`,
      [data.email.toLowerCase()]
    );

    if (customer) {
      // Link Google account to existing user
      await execute(
        `UPDATE customers SET google_id = ?, is_email_verified = TRUE, avatar_url = COALESCE(avatar_url, ?)
         WHERE id = ?`,
        [data.googleId, data.avatarUrl || null, customer.id]
      );
      customer.google_id = data.googleId;
    } else {
      // Create new customer
      const customerId = await insert(
        `INSERT INTO customers (email, google_id, first_name, last_name, avatar_url, is_email_verified)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [
          data.email.toLowerCase(),
          data.googleId,
          data.firstName || null,
          data.lastName || null,
          data.avatarUrl || null,
        ]
      );

      customer = await queryOne<CustomerRow>(
        `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url,
                google_id, is_email_verified, is_active, preferred_currency,
                total_bookings, loyalty_points
         FROM customers
         WHERE id = ?`,
        [customerId]
      );

      isNewUser = true;
    }
  }

  if (!customer) {
    return { success: false, error: 'Failed to create account' };
  }

  if (!customer.is_active) {
    return { success: false, error: 'Account is disabled' };
  }

  // Create session
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await insert(
    `INSERT INTO customer_sessions (customer_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [customer.id, token, expiresAt]
  );

  // Update last login
  await execute(
    'UPDATE customers SET last_login_at = NOW() WHERE id = ?',
    [customer.id]
  );

  return { success: true, customer, token, isNewUser };
}

/**
 * Verify customer session token
 */
export async function verifyCustomerSession(
  token: string
): Promise<{ valid: boolean; customer?: CustomerRow }> {
  const session = await queryOne<CustomerSession>(
    `SELECT id, customer_id, token, expires_at
     FROM customer_sessions
     WHERE token = ? AND expires_at > NOW()`,
    [token]
  );

  if (!session) {
    return { valid: false };
  }

  const customer = await queryOne<CustomerRow>(
    `SELECT id, email, password_hash, first_name, last_name, phone, avatar_url,
            google_id, is_email_verified, is_active, preferred_currency,
            total_bookings, loyalty_points
     FROM customers
     WHERE id = ? AND is_active = TRUE`,
    [session.customer_id]
  );

  if (!customer) {
    return { valid: false };
  }

  return { valid: true, customer };
}

/**
 * Logout customer (delete session)
 */
export async function logoutCustomer(token: string): Promise<void> {
  await execute('DELETE FROM customer_sessions WHERE token = ?', [token]);
}

/**
 * Authenticate customer request
 */
export async function authenticateCustomer(
  request: NextRequest
): Promise<{ success: boolean; customer?: CustomerRow; response?: NextResponse }> {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('customer_token')?.value;

  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const { valid, customer } = await verifyCustomerSession(token);

  if (!valid || !customer) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      ),
    };
  }

  return { success: true, customer };
}

/**
 * Link existing bookings to customer account by email
 */
export async function linkBookingsToCustomer(customerId: number, email: string): Promise<number> {
  const result = await execute(
    `UPDATE bookings b
     INNER JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
     SET b.customer_account_id = ?
     WHERE bp.email = ? AND b.customer_account_id IS NULL`,
    [customerId, email.toLowerCase()]
  );

  return (result as unknown as { affectedRows: number }).affectedRows || 0;
}

/**
 * Get customer booking history
 */
export async function getCustomerBookings(customerId: number) {
  return query<{
    id: number;
    public_code: string;
    pickup_datetime: Date;
    pickup_address: string;
    dropoff_address: string;
    vehicle_type: string;
    total_price: number;
    currency: string;
    status: string;
    created_at: Date;
  }>(
    `SELECT b.id, b.public_code, b.pickup_datetime, b.pickup_address, b.dropoff_address,
            b.vehicle_type, b.total_price, b.currency, b.status, b.created_at
     FROM bookings b
     WHERE b.customer_account_id = ?
     ORDER BY b.pickup_datetime DESC
     LIMIT 50`,
    [customerId]
  );
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<boolean> {
  const customer = await queryOne<{ id: number }>(
    'SELECT id FROM customers WHERE email = ? AND password_hash IS NOT NULL',
    [email.toLowerCase()]
  );

  if (!customer) {
    // Don't reveal if email exists
    return true;
  }

  // Invalidate existing tokens
  await execute(
    `UPDATE customer_verification_tokens
     SET used_at = NOW()
     WHERE customer_id = ? AND type = 'PASSWORD_RESET' AND used_at IS NULL`,
    [customer.id]
  );

  // Create reset token
  const resetToken = generateToken();
  await insert(
    `INSERT INTO customer_verification_tokens (customer_id, token, type, expires_at)
     VALUES (?, ?, 'PASSWORD_RESET', DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
    [customer.id, resetToken]
  );

  // TODO: Send password reset email
  // await sendPasswordResetEmail(email, resetToken);

  return true;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const tokenRow = await queryOne<{ customer_id: number }>(
    `SELECT customer_id FROM customer_verification_tokens
     WHERE token = ? AND type = 'PASSWORD_RESET'
     AND expires_at > NOW() AND used_at IS NULL`,
    [token]
  );

  if (!tokenRow) {
    return { success: false, error: 'Invalid or expired reset token' };
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await execute(
    'UPDATE customers SET password_hash = ? WHERE id = ?',
    [passwordHash, tokenRow.customer_id]
  );

  // Mark token as used
  await execute(
    'UPDATE customer_verification_tokens SET used_at = NOW() WHERE token = ?',
    [token]
  );

  // Invalidate all sessions
  await execute(
    'DELETE FROM customer_sessions WHERE customer_id = ?',
    [tokenRow.customer_id]
  );

  return { success: true };
}
