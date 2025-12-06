import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, insert } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  linkBookingsToCustomer,
  googleAuth,
} from '@/lib/customer-auth';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';

// Session duration: 30 days
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

interface BookingPassenger {
  booking_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface CustomerRow {
  id: number;
  email: string;
  password_hash: string | null;
  google_id: string | null;
}

// POST /api/customer/convert-guest - Convert guest booking to customer account
export async function POST(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.AUTH);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const {
      bookingCode,
      email,
      password,
      googleCredential,
      name,
      linkToExisting = false,
    } = body;

    // Validate required fields
    if (!bookingCode || !email) {
      return NextResponse.json(
        { error: 'Booking code and email are required' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    if (!password && !googleCredential) {
      return NextResponse.json(
        { error: 'Password or Google credential is required' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Verify booking exists and matches email
    const booking = await queryOne<BookingPassenger>(
      `SELECT bp.booking_id, bp.email, bp.first_name, bp.last_name
       FROM bookings b
       INNER JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
       WHERE b.public_code = ? AND LOWER(bp.email) = LOWER(?)`,
      [bookingCode, email]
    );

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or email does not match' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Check if account already exists
    const existingCustomer = await queryOne<CustomerRow>(
      'SELECT id, email, password_hash, google_id FROM customers WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    // Parse name if provided
    let firstName = booking.first_name;
    let lastName = booking.last_name;
    if (name) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0] || firstName;
      lastName = nameParts.slice(1).join(' ') || lastName;
    }

    // Handle Google credential
    if (googleCredential) {
      // Decode Google JWT to get user info
      const googlePayload = decodeGoogleJwt(googleCredential);
      if (!googlePayload) {
        return NextResponse.json(
          { error: 'Invalid Google credential' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }

      // Verify email matches
      if (googlePayload.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Google account email does not match booking email' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }

      // Use existing googleAuth function
      const result = await googleAuth({
        googleId: googlePayload.sub,
        email: googlePayload.email,
        firstName: googlePayload.given_name || firstName,
        lastName: googlePayload.family_name || lastName,
        avatarUrl: googlePayload.picture,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }

      // Link booking to customer account
      await execute(
        'UPDATE bookings SET customer_account_id = ? WHERE public_code = ?',
        [result.customer!.id, bookingCode]
      );

      // Link other bookings by email
      await linkBookingsToCustomer(result.customer!.id, email);

      // Set session cookie
      const response = NextResponse.json({
        success: true,
        customerId: result.customer!.id,
        isNewUser: result.isNewUser,
      }, {
        headers: getRateLimitHeaders(rateLimitResult),
      });

      response.cookies.set('customer_token', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return response;
    }

    // Handle password-based account creation/login
    if (existingCustomer && !linkToExisting) {
      // Account exists, ask user to login
      return NextResponse.json({
        success: false,
        accountExists: true,
        message: 'An account with this email already exists. Please log in to link this booking.',
      }, {
        headers: getRateLimitHeaders(rateLimitResult),
      });
    }

    if (existingCustomer && linkToExisting) {
      // Login to existing account and link booking
      if (!existingCustomer.password_hash) {
        return NextResponse.json(
          { error: 'This account uses Google Sign-In. Please use Google to continue.' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }

      const passwordValid = await verifyPassword(password, existingCustomer.password_hash);
      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }

      // Link booking to customer account
      await execute(
        'UPDATE bookings SET customer_account_id = ? WHERE public_code = ?',
        [existingCustomer.id, bookingCode]
      );

      // Link other bookings by email
      const linkedCount = await linkBookingsToCustomer(existingCustomer.id, email);

      // Create session
      const token = generateToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await insert(
        `INSERT INTO customer_sessions (customer_id, token, expires_at)
         VALUES (?, ?, ?)`,
        [existingCustomer.id, token, expiresAt]
      );

      // Update last login
      await execute(
        'UPDATE customers SET last_login_at = NOW() WHERE id = ?',
        [existingCustomer.id]
      );

      const response = NextResponse.json({
        success: true,
        customerId: existingCustomer.id,
        linkedBookings: linkedCount + 1,
      }, {
        headers: getRateLimitHeaders(rateLimitResult),
      });

      response.cookies.set('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // Create new account
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const passwordHash = await hashPassword(password);

    const customerId = await insert(
      `INSERT INTO customers (email, password_hash, first_name, last_name, is_email_verified)
       VALUES (?, ?, ?, ?, FALSE)`,
      [email.toLowerCase(), passwordHash, firstName, lastName]
    );

    // Link booking to customer account
    await execute(
      'UPDATE bookings SET customer_account_id = ? WHERE public_code = ?',
      [customerId, bookingCode]
    );

    // Link other bookings by email
    const linkedCount = await linkBookingsToCustomer(customerId, email);

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await insert(
      `INSERT INTO customer_sessions (customer_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [customerId, token, expiresAt]
    );

    // Generate email verification token
    const verificationToken = generateToken();
    await insert(
      `INSERT INTO customer_verification_tokens (customer_id, token, type, expires_at)
       VALUES (?, ?, 'EMAIL_VERIFY', DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [customerId, verificationToken]
    );

    // TODO: Send verification email
    // await sendCustomerVerificationEmail(email, verificationToken);

    const response = NextResponse.json({
      success: true,
      customerId,
      isNewUser: true,
      linkedBookings: linkedCount + 1,
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });

    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error converting guest to customer:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}

/**
 * Decode Google JWT credential (basic decode, not verification)
 * In production, you should verify the token with Google's public keys
 */
function decodeGoogleJwt(credential: string): {
  sub: string;
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  picture?: string;
} | null {
  try {
    const parts = credential.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // Basic validation
    if (!payload.sub || !payload.email) return null;

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    // Check issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
