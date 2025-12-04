/**
 * Notification Service
 * Handles SMS and WhatsApp notifications via Twilio
 */

interface SendSmsParams {
  to: string;
  message: string;
}

interface SendWhatsAppParams {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Twilio configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

/**
 * Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // If doesn't start with +, assume it needs country code
  if (!cleaned.startsWith('+')) {
    // If starts with 0, remove it
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    // Default to +1 if no country code (can be configured)
    cleaned = '+' + cleaned;
  }

  return cleaned;
}

/**
 * Send SMS via Twilio
 */
export async function sendSms({ to, message }: SendSmsParams): Promise<NotificationResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log('[SMS] Twilio not configured, skipping SMS');
    return {
      success: false,
      error: 'SMS service not configured'
    };
  }

  try {
    const normalizedTo = normalizePhoneNumber(to);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: normalizedTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[SMS] Twilio error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send SMS'
      };
    }

    console.log('[SMS] Sent successfully to', normalizedTo, 'SID:', data.sid);
    return {
      success: true,
      messageId: data.sid
    };
  } catch (error) {
    console.error('[SMS] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsApp({ to, message }: SendWhatsAppParams): Promise<NotificationResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('[WhatsApp] Twilio not configured, skipping WhatsApp');
    return {
      success: false,
      error: 'WhatsApp service not configured'
    };
  }

  try {
    const normalizedTo = normalizePhoneNumber(to);
    const whatsappTo = `whatsapp:${normalizedTo}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_WHATSAPP_NUMBER,
          To: whatsappTo,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Twilio error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp'
      };
    }

    console.log('[WhatsApp] Sent successfully to', normalizedTo, 'SID:', data.sid);
    return {
      success: true,
      messageId: data.sid
    };
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Notification templates
export const NotificationTemplates = {
  bookingConfirmed: (data: {
    bookingCode: string;
    pickupTime: string;
    pickupLocation: string;
    vehicleType: string;
  }) => ({
    sms: `Your airport transfer is confirmed! Booking: ${data.bookingCode}. Pickup: ${data.pickupTime} at ${data.pickupLocation}. Vehicle: ${data.vehicleType}. Manage: airporttransferportal.com/manage-booking?ref=${data.bookingCode}`,
    whatsapp: `✅ *Booking Confirmed*\n\n📋 Reference: ${data.bookingCode}\n📅 Pickup: ${data.pickupTime}\n📍 Location: ${data.pickupLocation}\n🚗 Vehicle: ${data.vehicleType}\n\nManage your booking:\nairporttransferportal.com/manage-booking?ref=${data.bookingCode}`,
  }),

  driverAssigned: (data: {
    bookingCode: string;
    driverName: string;
    driverPhone: string;
    vehiclePlate: string;
  }) => ({
    sms: `Driver assigned for ${data.bookingCode}. ${data.driverName} (${data.driverPhone}). Vehicle: ${data.vehiclePlate}. Track: airporttransferportal.com/track/${data.bookingCode}`,
    whatsapp: `🚗 *Driver Assigned*\n\n📋 Booking: ${data.bookingCode}\n👤 Driver: ${data.driverName}\n📞 Phone: ${data.driverPhone}\n🚙 Vehicle: ${data.vehiclePlate}\n\nTrack your driver:\nairporttransferportal.com/track/${data.bookingCode}`,
  }),

  driverEnRoute: (data: {
    bookingCode: string;
    driverName: string;
    etaMinutes: number;
  }) => ({
    sms: `Your driver ${data.driverName} is on the way! ETA: ${data.etaMinutes} minutes. Booking: ${data.bookingCode}`,
    whatsapp: `🚗 *Driver On The Way*\n\n📋 Booking: ${data.bookingCode}\n👤 Driver: ${data.driverName}\n⏱️ ETA: ${data.etaMinutes} minutes\n\nTrack live:\nairporttransferportal.com/track/${data.bookingCode}`,
  }),

  driverArrived: (data: {
    bookingCode: string;
    driverName: string;
    location: string;
  }) => ({
    sms: `Your driver has arrived at ${data.location}! Booking: ${data.bookingCode}. Look for ${data.driverName}.`,
    whatsapp: `🎯 *Driver Arrived*\n\n📋 Booking: ${data.bookingCode}\n📍 Location: ${data.location}\n👤 Driver: ${data.driverName}\n\nYour driver is waiting for you!`,
  }),

  flightDelayed: (data: {
    bookingCode: string;
    flightNumber: string;
    newArrivalTime: string;
    delayMinutes: number;
  }) => ({
    sms: `Flight delay detected. ${data.flightNumber} now arriving ${data.newArrivalTime} (${data.delayMinutes}min delay). Your pickup time has been adjusted. Booking: ${data.bookingCode}`,
    whatsapp: `✈️ *Flight Delay Detected*\n\n📋 Booking: ${data.bookingCode}\n🛫 Flight: ${data.flightNumber}\n⏰ New arrival: ${data.newArrivalTime}\n⌛ Delay: ${data.delayMinutes} minutes\n\nYour pickup time has been automatically adjusted.`,
  }),

  paymentReminder: (data: {
    bookingCode: string;
    amount: string;
    currency: string;
    paymentLink: string;
  }) => ({
    sms: `Payment reminder for booking ${data.bookingCode}. Amount: ${data.currency} ${data.amount}. Pay now: ${data.paymentLink}`,
    whatsapp: `💳 *Payment Reminder*\n\n📋 Booking: ${data.bookingCode}\n💰 Amount: ${data.currency} ${data.amount}\n\nComplete payment:\n${data.paymentLink}`,
  }),

  paymentReceived: (data: {
    bookingCode: string;
    amount: string;
    currency: string;
  }) => ({
    sms: `Payment received! ${data.currency} ${data.amount} for booking ${data.bookingCode}. Thank you!`,
    whatsapp: `✅ *Payment Received*\n\n📋 Booking: ${data.bookingCode}\n💰 Amount: ${data.currency} ${data.amount}\n\nThank you for your payment!`,
  }),
};

/**
 * Send notification to customer via their preferred channel
 */
export async function sendBookingNotification(
  type: keyof typeof NotificationTemplates,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  recipient: { phone: string; preferWhatsApp?: boolean }
): Promise<NotificationResult> {
  const templateFn = NotificationTemplates[type];
  const template = templateFn(data) as { sms: string; whatsapp: string };

  // Try WhatsApp first if preferred
  if (recipient.preferWhatsApp) {
    const whatsAppResult = await sendWhatsApp({
      to: recipient.phone,
      message: template.whatsapp
    });
    if (whatsAppResult.success) {
      return whatsAppResult;
    }
    // Fall back to SMS if WhatsApp fails
    console.log('[Notification] WhatsApp failed, falling back to SMS');
  }

  // Send SMS
  return sendSms({
    to: recipient.phone,
    message: template.sms
  });
}
