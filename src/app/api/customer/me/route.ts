import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customer-auth';
import { execute, queryOne } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';

// GET /api/customer/me - Get current customer profile
export async function GET(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.GENERAL);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateCustomer(request);
  if (!auth.success) {
    return auth.response;
  }

  const customer = auth.customer!;

  return NextResponse.json({
    customer: {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      avatarUrl: customer.avatar_url,
      isEmailVerified: customer.is_email_verified,
      hasGoogleLinked: !!customer.google_id,
      preferredCurrency: customer.preferred_currency,
      totalBookings: customer.total_bookings,
      loyaltyPoints: customer.loyalty_points,
    },
  }, {
    headers: getRateLimitHeaders(rateLimitResult),
  });
}

// PATCH /api/customer/me - Update customer profile
export async function PATCH(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.GENERAL);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateCustomer(request);
  if (!auth.success) {
    return auth.response;
  }

  const customer = auth.customer!;

  try {
    const body = await request.json();
    const { firstName, lastName, phone, preferredCurrency, marketingConsent, newsletterSubscribed } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const params: (string | boolean | number)[] = [];

    if (firstName !== undefined) {
      updates.push('first_name = ?');
      params.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      params.push(lastName);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (preferredCurrency !== undefined) {
      updates.push('preferred_currency = ?');
      params.push(preferredCurrency);
    }
    if (marketingConsent !== undefined) {
      updates.push('marketing_consent = ?');
      params.push(marketingConsent);
    }
    if (newsletterSubscribed !== undefined) {
      updates.push('newsletter_subscribed = ?');
      params.push(newsletterSubscribed);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    params.push(customer.id);
    await execute(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated customer
    const updated = await queryOne<{
      first_name: string;
      last_name: string;
      phone: string;
      preferred_currency: string;
    }>(
      'SELECT first_name, last_name, phone, preferred_currency FROM customers WHERE id = ?',
      [customer.id]
    );

    return NextResponse.json({
      success: true,
      customer: {
        firstName: updated?.first_name,
        lastName: updated?.last_name,
        phone: updated?.phone,
        preferredCurrency: updated?.preferred_currency,
      },
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}
