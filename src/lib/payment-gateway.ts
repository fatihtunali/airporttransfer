/**
 * Payment Gateway Integration
 * Redirects to payment.funnytourism.com (MAZAKA E-Commerce platform)
 */

// Payment gateway configuration
const PAYMENT_GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'https://payment.funnytourism.com';
const PAYMENT_MERCHANT_ID = process.env.PAYMENT_MERCHANT_ID || '';
const PAYMENT_SECRET_KEY = process.env.PAYMENT_SECRET_KEY || '';
const PAYMENT_CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://airporttransferportal.com';

export interface PaymentRequest {
  bookingCode: string;
  bookingId: number;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description?: string;
}

export interface PaymentGatewayResult {
  success: boolean;
  redirectUrl?: string;
  transactionId?: string;
  error?: string;
}

/**
 * Generate HMAC signature for payment request
 */
function generateSignature(params: Record<string, string>): string {
  const crypto = require('crypto');
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  return crypto
    .createHmac('sha256', PAYMENT_SECRET_KEY)
    .update(signatureString)
    .digest('hex');
}

/**
 * Create payment redirect URL for the external payment gateway
 */
export function createPaymentRedirectUrl(request: PaymentRequest): PaymentGatewayResult {
  try {
    // Build payment parameters
    const params: Record<string, string> = {
      merchant_id: PAYMENT_MERCHANT_ID,
      order_id: request.bookingCode,
      amount: request.amount.toFixed(2),
      currency: request.currency.toUpperCase(),
      customer_email: request.customerEmail,
      customer_name: request.customerName,
      description: request.description || `Airport Transfer - ${request.bookingCode}`,
      return_url: `${PAYMENT_CALLBACK_URL}/api/payments/callback`,
      cancel_url: `${PAYMENT_CALLBACK_URL}/pay/${request.bookingCode}?status=cancelled`,
      success_url: `${PAYMENT_CALLBACK_URL}/manage-booking?ref=${request.bookingCode}&payment=success`,
      fail_url: `${PAYMENT_CALLBACK_URL}/pay/${request.bookingCode}?status=failed`,
    };

    if (request.customerPhone) {
      params.customer_phone = request.customerPhone;
    }

    // Generate signature
    const signature = generateSignature(params);
    params.signature = signature;

    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    // Generate transaction ID for tracking
    const crypto = require('crypto');
    const transactionId = `ATP-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    return {
      success: true,
      redirectUrl: `${PAYMENT_GATEWAY_URL}/checkout/direct?${queryString}`,
      transactionId,
    };
  } catch (error) {
    console.error('[PaymentGateway] Error creating redirect URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment URL',
    };
  }
}

/**
 * Verify callback signature from payment gateway
 */
export function verifyCallbackSignature(
  params: Record<string, string>,
  receivedSignature: string
): boolean {
  // Remove signature from params for verification
  const paramsWithoutSig = { ...params };
  delete paramsWithoutSig.signature;

  const expectedSignature = generateSignature(paramsWithoutSig);

  // Timing-safe comparison
  const crypto = require('crypto');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    );
  } catch {
    return false;
  }
}

export interface PaymentCallbackData {
  orderId: string;
  transactionId: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  amount: number;
  currency: string;
  paymentMethod?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Parse callback data from payment gateway
 */
export function parseCallbackData(
  params: Record<string, string>
): PaymentCallbackData | null {
  try {
    const statusMap: Record<string, PaymentCallbackData['status']> = {
      'success': 'success',
      'completed': 'success',
      'approved': 'success',
      'paid': 'success',
      'failed': 'failed',
      'declined': 'failed',
      'error': 'failed',
      'pending': 'pending',
      'processing': 'pending',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
    };

    const rawStatus = (params.status || params.payment_status || '').toLowerCase();
    const status = statusMap[rawStatus] || 'pending';

    return {
      orderId: params.order_id || params.orderId || '',
      transactionId: params.transaction_id || params.transactionId || '',
      status,
      amount: parseFloat(params.amount || '0'),
      currency: params.currency || 'EUR',
      paymentMethod: params.payment_method || params.paymentMethod,
      errorCode: params.error_code || params.errorCode,
      errorMessage: params.error_message || params.errorMessage,
    };
  } catch (error) {
    console.error('[PaymentGateway] Error parsing callback data:', error);
    return null;
  }
}

/**
 * Map payment status to booking payment status
 */
export type BookingPaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export function mapPaymentStatus(gatewayStatus: PaymentCallbackData['status']): BookingPaymentStatus {
  switch (gatewayStatus) {
    case 'success':
      return 'PAID';
    case 'pending':
      return 'PROCESSING';
    case 'cancelled':
      return 'CANCELLED';
    case 'failed':
    default:
      return 'FAILED';
  }
}

/**
 * Generate bank transfer details (as fallback)
 */
export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  iban: string;
  swift: string;
  reference: string;
  amount: number;
  currency: string;
  dueDate: string;
}

const BANK_ACCOUNTS: Record<string, Omit<BankTransferDetails, 'reference' | 'amount' | 'currency' | 'dueDate'>> = {
  EUR: {
    bankName: 'Garanti BBVA',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'TGBATRIS',
  },
  USD: {
    bankName: 'Garanti BBVA',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'TGBATRIS',
  },
  GBP: {
    bankName: 'Garanti BBVA',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'TGBATRIS',
  },
  TRY: {
    bankName: 'Garanti BBVA',
    accountName: 'Airport Transfer Portal Ltd',
    iban: 'TR00 0000 0000 0000 0000 0000 00',
    swift: 'TGBATRIS',
  },
};

export function generateBankTransferDetails(
  bookingCode: string,
  amount: number,
  currency: string,
  daysUntilDue: number = 3
): BankTransferDetails {
  const normalizedCurrency = currency.toUpperCase();
  const bankAccount = BANK_ACCOUNTS[normalizedCurrency] || BANK_ACCOUNTS.EUR;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysUntilDue);

  return {
    ...bankAccount,
    reference: `ATP-${bookingCode}`,
    amount,
    currency: normalizedCurrency,
    dueDate: dueDate.toISOString().split('T')[0],
  };
}
