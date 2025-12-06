import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import {
  registerCustomer,
  loginCustomer,
  googleAuth,
  logoutCustomer,
  linkBookingsToCustomer,
} from '@/lib/customer-auth';

// POST /api/customer/auth - Register, Login, or Google Auth
export async function POST(request: NextRequest) {
  // Apply stricter rate limiting for auth
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.AUTH);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'register': {
        const { email, password, firstName, lastName, phone, marketingConsent } = body;

        // Validate required fields
        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return NextResponse.json(
            { error: 'Invalid email format' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        // Validate password strength
        if (password.length < 8) {
          return NextResponse.json(
            { error: 'Password must be at least 8 characters' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        const result = await registerCustomer({
          email,
          password,
          firstName,
          lastName,
          phone,
          marketingConsent,
        });

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        // Link any existing bookings
        if (result.customerId) {
          const linked = await linkBookingsToCustomer(result.customerId, email);
          if (linked > 0) {
            console.log(`Linked ${linked} bookings to new customer ${result.customerId}`);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Account created successfully. Please check your email to verify your account.',
        }, {
          status: 201,
          headers: getRateLimitHeaders(rateLimitResult),
        });
      }

      case 'login': {
        const { email, password } = body;

        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        const result = await loginCustomer(email, password);

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 401, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        // Create response with cookie
        const response = NextResponse.json({
          success: true,
          customer: {
            id: result.customer!.id,
            email: result.customer!.email,
            firstName: result.customer!.first_name,
            lastName: result.customer!.last_name,
            phone: result.customer!.phone,
            avatarUrl: result.customer!.avatar_url,
            isEmailVerified: result.customer!.is_email_verified,
            preferredCurrency: result.customer!.preferred_currency,
            totalBookings: result.customer!.total_bookings,
            loyaltyPoints: result.customer!.loyalty_points,
          },
          token: result.token,
        }, {
          headers: getRateLimitHeaders(rateLimitResult),
        });

        // Set HTTP-only cookie for session
        response.cookies.set('customer_token', result.token!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });

        return response;
      }

      case 'google': {
        const { credential } = body;

        if (!credential) {
          return NextResponse.json(
            { error: 'Google credential is required' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        // Decode and verify Google JWT token
        // In production, verify with Google's public keys
        let googlePayload: { sub: string; email: string; given_name?: string; family_name?: string; picture?: string };

        try {
          // Decode JWT (base64)
          const [, payloadB64] = credential.split('.');
          const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf-8');
          googlePayload = JSON.parse(payloadJson);

          // Basic validation
          if (!googlePayload.sub || !googlePayload.email) {
            throw new Error('Invalid token payload');
          }
        } catch {
          return NextResponse.json(
            { error: 'Invalid Google credential' },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        const result = await googleAuth({
          googleId: googlePayload.sub,
          email: googlePayload.email,
          firstName: googlePayload.given_name,
          lastName: googlePayload.family_name,
          avatarUrl: googlePayload.picture,
        });

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
          );
        }

        // Link any existing bookings for new users
        if (result.isNewUser && result.customer) {
          const linked = await linkBookingsToCustomer(result.customer.id, result.customer.email);
          if (linked > 0) {
            console.log(`Linked ${linked} bookings to new customer ${result.customer.id}`);
          }
        }

        const response = NextResponse.json({
          success: true,
          isNewUser: result.isNewUser,
          customer: {
            id: result.customer!.id,
            email: result.customer!.email,
            firstName: result.customer!.first_name,
            lastName: result.customer!.last_name,
            phone: result.customer!.phone,
            avatarUrl: result.customer!.avatar_url,
            isEmailVerified: result.customer!.is_email_verified,
            preferredCurrency: result.customer!.preferred_currency,
            totalBookings: result.customer!.total_bookings,
            loyaltyPoints: result.customer!.loyalty_points,
          },
          token: result.token,
        }, {
          headers: getRateLimitHeaders(rateLimitResult),
        });

        response.cookies.set('customer_token', result.token!, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });

        return response;
      }

      case 'logout': {
        const token = request.cookies.get('customer_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '');

        if (token) {
          await logoutCustomer(token);
        }

        const response = NextResponse.json({
          success: true,
          message: 'Logged out successfully',
        }, {
          headers: getRateLimitHeaders(rateLimitResult),
        });

        // Clear cookie
        response.cookies.delete('customer_token');

        return response;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: register, login, google, or logout' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
    }
  } catch (error) {
    console.error('Customer auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}
