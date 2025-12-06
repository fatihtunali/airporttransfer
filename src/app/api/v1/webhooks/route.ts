import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';
import {
  createWebhookSubscription,
  updateWebhookSubscription,
  deleteWebhookSubscription,
  regenerateWebhookSecret,
  getWebhookDeliveries,
  WebhookEventType,
} from '@/lib/webhooks';

interface WebhookSubscriptionRow {
  id: number;
  agency_id: number | null;
  supplier_id: number | null;
  endpoint_url: string;
  events: string;
  is_active: boolean;
  failure_count: number;
  last_success_at: Date | null;
  last_failure_at: Date | null;
  created_at: Date;
}

const VALID_EVENTS: WebhookEventType[] = [
  'booking.created',
  'booking.confirmed',
  'booking.cancelled',
  'booking.modified',
  'booking.assigned',
  'ride.started',
  'ride.completed',
  'ride.no_show',
  'payment.received',
  'payment.refunded',
];

// GET /api/v1/webhooks - List webhook subscriptions
export async function GET(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.B2B);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const { agencyId } = auth;

  try {
    const subscriptions = await query<WebhookSubscriptionRow>(
      `SELECT id, agency_id, supplier_id, endpoint_url, events, is_active,
              failure_count, last_success_at, last_failure_at, created_at
       FROM webhook_subscriptions
       WHERE agency_id = ?
       ORDER BY created_at DESC`,
      [agencyId]
    );

    return NextResponse.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        endpointUrl: sub.endpoint_url,
        events: JSON.parse(sub.events),
        isActive: sub.is_active,
        failureCount: sub.failure_count,
        lastSuccessAt: sub.last_success_at,
        lastFailureAt: sub.last_failure_at,
        createdAt: sub.created_at,
      })),
      meta: {
        availableEvents: VALID_EVENTS,
        apiVersion: 'v1',
      },
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error listing webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to list webhooks', code: 'INTERNAL_ERROR' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}

// POST /api/v1/webhooks - Create a new webhook subscription
export async function POST(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.B2B);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const { agencyId } = auth;

  try {
    const body = await request.json();
    const { endpointUrl, events } = body;

    // Validate endpoint URL
    if (!endpointUrl || typeof endpointUrl !== 'string') {
      return NextResponse.json(
        { error: 'endpointUrl is required', code: 'VALIDATION_ERROR' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    try {
      new URL(endpointUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid endpointUrl format', code: 'VALIDATION_ERROR' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Require HTTPS for security
    if (!endpointUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: 'endpointUrl must use HTTPS', code: 'VALIDATION_ERROR' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate events
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'events array is required and must not be empty', code: 'VALIDATION_ERROR' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const invalidEvents = events.filter(e => !VALID_EVENTS.includes(e));
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid events: ${invalidEvents.join(', ')}`,
          validEvents: VALID_EVENTS,
          code: 'VALIDATION_ERROR',
        },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Check for duplicate endpoint
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM webhook_subscriptions WHERE agency_id = ? AND endpoint_url = ?',
      [agencyId, endpointUrl]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Webhook subscription already exists for this endpoint', code: 'DUPLICATE_ENDPOINT' },
        { status: 409, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Create subscription
    const { id, secret } = await createWebhookSubscription(endpointUrl, events, { agencyId });

    return NextResponse.json({
      success: true,
      subscription: {
        id,
        endpointUrl,
        events,
        isActive: true,
      },
      secret, // Only returned once - must be stored by the agency
      warning: 'Save the secret now - it cannot be retrieved later. Use regenerate if lost.',
      meta: {
        apiVersion: 'v1',
      },
    }, {
      status: 201,
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to create webhook', code: 'INTERNAL_ERROR' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}

// PATCH /api/v1/webhooks - Update webhook subscription
export async function PATCH(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.B2B);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const { agencyId } = auth;

  try {
    const body = await request.json();
    const { id, endpointUrl, events, isActive, regenerateSecret } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription id is required', code: 'VALIDATION_ERROR' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Verify ownership
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM webhook_subscriptions WHERE id = ? AND agency_id = ?',
      [id, agencyId]
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'Webhook subscription not found', code: 'NOT_FOUND' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Validate events if provided
    if (events) {
      if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json(
          { error: 'events must be a non-empty array', code: 'VALIDATION_ERROR' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
      const invalidEvents = events.filter((e: string) => !VALID_EVENTS.includes(e as WebhookEventType));
      if (invalidEvents.length > 0) {
        return NextResponse.json(
          { error: `Invalid events: ${invalidEvents.join(', ')}`, code: 'VALIDATION_ERROR' },
          { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
        );
      }
    }

    // Update subscription
    await updateWebhookSubscription(id, { endpointUrl, events, isActive });

    // Regenerate secret if requested
    let newSecret: string | undefined;
    if (regenerateSecret) {
      newSecret = await regenerateWebhookSecret(id);
    }

    const response: Record<string, unknown> = {
      success: true,
      message: 'Webhook subscription updated',
      meta: { apiVersion: 'v1' },
    };

    if (newSecret) {
      response.secret = newSecret;
      response.warning = 'New secret generated. Save it now - it cannot be retrieved later.';
    }

    return NextResponse.json(response, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json(
      { error: 'Failed to update webhook', code: 'INTERNAL_ERROR' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}

// DELETE /api/v1/webhooks - Delete webhook subscription
export async function DELETE(request: NextRequest) {
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.B2B);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = await authenticateApiKey(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  const { agencyId } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription id is required', code: 'VALIDATION_ERROR' },
        { status: 400, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Verify ownership
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM webhook_subscriptions WHERE id = ? AND agency_id = ?',
      [id, agencyId]
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'Webhook subscription not found', code: 'NOT_FOUND' },
        { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    await deleteWebhookSubscription(parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Webhook subscription deleted',
      meta: { apiVersion: 'v1' },
    }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook', code: 'INTERNAL_ERROR' },
      { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }
}
