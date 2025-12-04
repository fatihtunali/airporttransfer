/**
 * Payment Service
 * Handles credit card payments via Stripe and bank transfer generation
 */

interface CreatePaymentIntentParams {
  amount: number; // Amount in cents/smallest currency unit
  currency: string;
  bookingId: number;
  bookingCode: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}

interface PaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

interface BankTransferDetails {
  bankName: string;
  accountName: string;
  iban: string;
  swift: string;
  reference: string;
  amount: number;
  currency: string;
  dueDate: string;
}

// Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Bank details for wire transfers (configurable per currency)
const BANK_ACCOUNTS: Record<string, Omit<BankTransferDetails, 'reference' | 'amount' | 'currency' | 'dueDate'>> = {
  EUR: {
    bankName: 'Airport Transfer Portal Bank',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'ATPBTRXX',
  },
  USD: {
    bankName: 'Airport Transfer Portal Bank',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'ATPBTRXX',
  },
  GBP: {
    bankName: 'Airport Transfer Portal Bank',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'ATPBTRXX',
  },
  TRY: {
    bankName: 'Airport Transfer Portal Bank',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'ATPBTRXX',
  },
};

/**
 * Create a Stripe Payment Intent for credit card payment
 */
export async function createPaymentIntent({
  amount,
  currency,
  bookingId,
  bookingCode,
  customerEmail,
  customerName,
  description
}: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
  if (!STRIPE_SECRET_KEY) {
    console.log('[Payment] Stripe not configured');
    return {
      success: false,
      error: 'Payment service not configured'
    };
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency.toLowerCase(),
        'metadata[booking_id]': bookingId.toString(),
        'metadata[booking_code]': bookingCode,
        receipt_email: customerEmail,
        description: description || `Airport Transfer - Booking ${bookingCode}`,
        'automatic_payment_methods[enabled]': 'true',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Payment] Stripe error:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to create payment'
      };
    }

    console.log('[Payment] Payment intent created:', data.id);
    return {
      success: true,
      clientSecret: data.client_secret,
      paymentIntentId: data.id
    };
  } catch (error) {
    console.error('[Payment] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment failed'
    };
  }
}

/**
 * Retrieve Payment Intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string): Promise<{
  status: string;
  amount: number;
  currency: string;
  error?: string;
}> {
  if (!STRIPE_SECRET_KEY) {
    return { status: 'error', amount: 0, currency: '', error: 'Payment service not configured' };
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}`,
      {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        amount: 0,
        currency: '',
        error: data.error?.message
      };
    }

    return {
      status: data.status,
      amount: data.amount,
      currency: data.currency
    };
  } catch (error) {
    return {
      status: 'error',
      amount: 0,
      currency: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate bank transfer details for a booking
 */
export function generateBankTransferDetails(
  bookingCode: string,
  amount: number,
  currency: string,
  daysUntilDue: number = 3
): BankTransferDetails {
  const normalizedCurrency = currency.toUpperCase();
  const bankAccount = BANK_ACCOUNTS[normalizedCurrency] || BANK_ACCOUNTS.EUR;

  // Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  return {
    ...bankAccount,
    reference: `ATP-${bookingCode}`,
    amount,
    currency: normalizedCurrency,
    dueDate: dueDate.toISOString().split('T')[0]
  };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): { valid: boolean; error?: string } {
  if (!STRIPE_WEBHOOK_SECRET) {
    return { valid: false, error: 'Webhook secret not configured' };
  }

  try {
    // Stripe webhook verification using crypto
    const crypto = require('crypto');
    const elements = signature.split(',');
    const timestampStr = elements.find((el: string) => el.startsWith('t='))?.split('=')[1];
    const signatureStr = elements.find((el: string) => el.startsWith('v1='))?.split('=')[1];

    if (!timestampStr || !signatureStr) {
      return { valid: false, error: 'Invalid signature format' };
    }

    const signedPayload = `${timestampStr}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureStr)
    );

    return { valid: isValid };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Cancel a Payment Intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!STRIPE_SECRET_KEY) {
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error?.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation failed'
    };
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  if (!STRIPE_SECRET_KEY) {
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    const params: Record<string, string> = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      params.amount = amount.toString();
    }

    if (reason) {
      params.reason = reason;
    }

    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error?.message };
    }

    return { success: true, refundId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed'
    };
  }
}

/**
 * Payment status enum for booking updates
 */
export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'CANCELLED';

/**
 * Map Stripe payment intent status to our payment status
 */
export function mapStripeStatus(stripeStatus: string): PaymentStatus {
  switch (stripeStatus) {
    case 'succeeded':
      return 'PAID';
    case 'processing':
      return 'PROCESSING';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'PENDING';
    case 'canceled':
      return 'CANCELLED';
    default:
      return 'UNPAID';
  }
}
