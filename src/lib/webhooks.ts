/**
 * Webhook System
 * Sends webhook notifications for booking events to subscribed endpoints
 */

import { query, queryOne, insert, execute } from './db';
import crypto from 'crypto';

// Webhook event types
export type WebhookEventType =
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.modified'
  | 'booking.assigned'
  | 'ride.started'
  | 'ride.completed'
  | 'ride.no_show'
  | 'payment.received'
  | 'payment.refunded';

interface WebhookSubscription {
  id: number;
  agency_id: number | null;
  supplier_id: number | null;
  endpoint_url: string;
  secret: string;
  events: string;
  is_active: boolean;
}

interface WebhookDelivery {
  id: number;
  subscription_id: number;
  event_type: string;
  payload: string;
  response_status: number | null;
  response_body: string | null;
  delivered_at: Date | null;
  attempts: number;
}

/**
 * Generate webhook signature for payload verification
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return `t=${timestamp},v1=${signature}`;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  toleranceSeconds = 300
): boolean {
  const parts = signature.split(',');
  const timestamp = parseInt(parts.find(p => p.startsWith('t='))?.replace('t=', '') || '0');
  const providedSig = parts.find(p => p.startsWith('v1='))?.replace('v1=', '') || '';

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  // Verify signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(providedSig),
    Buffer.from(expectedSig)
  );
}

/**
 * Get all subscriptions for an event type
 */
async function getSubscriptionsForEvent(
  eventType: WebhookEventType,
  agencyId?: number,
  supplierId?: number
): Promise<WebhookSubscription[]> {
  let sql = `
    SELECT id, agency_id, supplier_id, endpoint_url, secret, events, is_active
    FROM webhook_subscriptions
    WHERE is_active = TRUE
    AND JSON_CONTAINS(events, ?)
  `;
  const params: (string | number)[] = [JSON.stringify(eventType)];

  if (agencyId) {
    sql += ' AND agency_id = ?';
    params.push(agencyId);
  }
  if (supplierId) {
    sql += ' AND supplier_id = ?';
    params.push(supplierId);
  }

  return query<WebhookSubscription>(sql, params);
}

/**
 * Send webhook to a single endpoint
 */
async function deliverWebhook(
  subscription: WebhookSubscription,
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payloadString = JSON.stringify({
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const signature = generateWebhookSignature(payloadString, subscription.secret);

  // Create delivery record
  const deliveryId = await insert(
    `INSERT INTO webhook_deliveries (subscription_id, event_type, payload, attempts)
     VALUES (?, ?, ?, 1)`,
    [subscription.id, eventType, payloadString]
  );

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(subscription.endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': eventType,
        'User-Agent': 'AirportTransferPortal-Webhook/1.0',
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Get response body
    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch {
      responseBody = 'Could not read response body';
    }

    // Update delivery record
    await execute(
      `UPDATE webhook_deliveries
       SET response_status = ?, response_body = ?, delivered_at = NOW()
       WHERE id = ?`,
      [response.status, responseBody.substring(0, 1000), deliveryId]
    );

    const success = response.status >= 200 && response.status < 300;

    // Update subscription stats
    if (success) {
      await execute(
        `UPDATE webhook_subscriptions
         SET last_success_at = NOW(), failure_count = 0
         WHERE id = ?`,
        [subscription.id]
      );
    } else {
      await execute(
        `UPDATE webhook_subscriptions
         SET last_failure_at = NOW(), failure_count = failure_count + 1
         WHERE id = ?`,
        [subscription.id]
      );

      // Disable subscription after 10 consecutive failures
      await execute(
        `UPDATE webhook_subscriptions
         SET is_active = FALSE
         WHERE id = ? AND failure_count >= 10`,
        [subscription.id]
      );
    }

    return { success, statusCode: response.status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update delivery record with error
    await execute(
      `UPDATE webhook_deliveries
       SET response_body = ?
       WHERE id = ?`,
      [`Error: ${errorMessage}`, deliveryId]
    );

    // Update failure count
    await execute(
      `UPDATE webhook_subscriptions
       SET last_failure_at = NOW(), failure_count = failure_count + 1
       WHERE id = ?`,
      [subscription.id]
    );

    return { success: false, error: errorMessage };
  }
}

/**
 * Emit a webhook event to all subscribers
 */
export async function emitWebhookEvent(
  eventType: WebhookEventType,
  payload: Record<string, unknown>,
  options?: {
    agencyId?: number;
    supplierId?: number;
  }
): Promise<void> {
  try {
    const subscriptions = await getSubscriptionsForEvent(
      eventType,
      options?.agencyId,
      options?.supplierId
    );

    // Send webhooks in parallel (fire-and-forget)
    const deliveries = subscriptions.map(sub =>
      deliverWebhook(sub, eventType, payload).catch(err => {
        console.error(`Webhook delivery failed for subscription ${sub.id}:`, err);
      })
    );

    // Don't await - let webhooks be sent in background
    Promise.allSettled(deliveries);
  } catch (error) {
    console.error('Error emitting webhook event:', error);
  }
}

/**
 * Create a new webhook subscription
 */
export async function createWebhookSubscription(
  endpointUrl: string,
  events: WebhookEventType[],
  options?: {
    agencyId?: number;
    supplierId?: number;
  }
): Promise<{ id: number; secret: string }> {
  // Generate secret key
  const secret = crypto.randomBytes(32).toString('hex');

  const id = await insert(
    `INSERT INTO webhook_subscriptions (agency_id, supplier_id, endpoint_url, secret, events)
     VALUES (?, ?, ?, ?, ?)`,
    [
      options?.agencyId || null,
      options?.supplierId || null,
      endpointUrl,
      secret,
      JSON.stringify(events),
    ]
  );

  return { id, secret };
}

/**
 * Update a webhook subscription
 */
export async function updateWebhookSubscription(
  id: number,
  updates: {
    endpointUrl?: string;
    events?: WebhookEventType[];
    isActive?: boolean;
  }
): Promise<void> {
  const setClauses: string[] = [];
  const params: (string | boolean | number)[] = [];

  if (updates.endpointUrl) {
    setClauses.push('endpoint_url = ?');
    params.push(updates.endpointUrl);
  }
  if (updates.events) {
    setClauses.push('events = ?');
    params.push(JSON.stringify(updates.events));
  }
  if (typeof updates.isActive === 'boolean') {
    setClauses.push('is_active = ?');
    params.push(updates.isActive);
    if (updates.isActive) {
      setClauses.push('failure_count = 0');
    }
  }

  if (setClauses.length > 0) {
    params.push(id);
    await execute(
      `UPDATE webhook_subscriptions SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
  }
}

/**
 * Regenerate webhook secret
 */
export async function regenerateWebhookSecret(id: number): Promise<string> {
  const secret = crypto.randomBytes(32).toString('hex');
  await execute(
    'UPDATE webhook_subscriptions SET secret = ? WHERE id = ?',
    [secret, id]
  );
  return secret;
}

/**
 * Delete a webhook subscription
 */
export async function deleteWebhookSubscription(id: number): Promise<void> {
  await execute('DELETE FROM webhook_subscriptions WHERE id = ?', [id]);
}

/**
 * Get webhook deliveries for a subscription
 */
export async function getWebhookDeliveries(
  subscriptionId: number,
  limit = 50
): Promise<WebhookDelivery[]> {
  return query<WebhookDelivery>(
    `SELECT id, subscription_id, event_type, payload, response_status,
            response_body, delivered_at, attempts
     FROM webhook_deliveries
     WHERE subscription_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [subscriptionId, limit]
  );
}

// Convenience functions for common booking events
export const BookingWebhooks = {
  created: (booking: Record<string, unknown>, supplierId?: number, agencyId?: number) =>
    emitWebhookEvent('booking.created', booking, { supplierId, agencyId }),

  confirmed: (booking: Record<string, unknown>, supplierId?: number, agencyId?: number) =>
    emitWebhookEvent('booking.confirmed', booking, { supplierId, agencyId }),

  cancelled: (booking: Record<string, unknown>, supplierId?: number, agencyId?: number) =>
    emitWebhookEvent('booking.cancelled', booking, { supplierId, agencyId }),

  modified: (booking: Record<string, unknown>, supplierId?: number, agencyId?: number) =>
    emitWebhookEvent('booking.modified', booking, { supplierId, agencyId }),

  assigned: (booking: Record<string, unknown>, supplierId?: number) =>
    emitWebhookEvent('booking.assigned', booking, { supplierId }),
};

export const RideWebhooks = {
  started: (ride: Record<string, unknown>, supplierId?: number) =>
    emitWebhookEvent('ride.started', ride, { supplierId }),

  completed: (ride: Record<string, unknown>, supplierId?: number) =>
    emitWebhookEvent('ride.completed', ride, { supplierId }),

  noShow: (ride: Record<string, unknown>, supplierId?: number) =>
    emitWebhookEvent('ride.no_show', ride, { supplierId }),
};
