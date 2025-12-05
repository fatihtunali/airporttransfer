import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import crypto from 'crypto';

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || 'whsec_LgRodqbiYcbzug0Jama2cjBkMi7Xxhp1';

// Initialize Resend lazily to avoid build errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', RESEND_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// Auto-reply template
function getAutoReplyHtml(senderName: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Airport Transfer Portal</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Partner Network</p>
    </div>

    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
        Dear ${senderName || 'Partner'},
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for your interest in partnering with <strong>Airport Transfer Portal</strong>! We're excited to have you join our global network of trusted transfer providers.
      </p>

      <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0d9488; margin: 0 0 15px 0; font-size: 18px;">How It Works</h3>
        <ol style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li><strong>Register</strong> - Create your supplier account at our portal</li>
          <li><strong>Set Up Service Zones</strong> - Select the airports you serve</li>
          <li><strong>Create Routes</strong> - Define your transfer routes and destinations</li>
          <li><strong>Set Pricing</strong> - Configure your prices for each vehicle type</li>
          <li><strong>Receive Bookings</strong> - We send you customers, you provide the service</li>
        </ol>
      </div>

      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">💰 Commission Structure</h3>
        <p style="color: #78350f; margin: 0; line-height: 1.6;">
          We operate on a <strong>15% commission</strong> model. You set your prices, we handle marketing, customer acquisition, and payment processing. You receive the booking, provide the transfer, and get paid.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://airporttransferportal.com/supplier/register"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Register as a Supplier
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Why Partner With Us?</h3>
        <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li><strong>Global Reach</strong> - Access to international travelers worldwide</li>
          <li><strong>No Upfront Costs</strong> - Free to join, only pay commission on bookings</li>
          <li><strong>Easy Management</strong> - User-friendly dashboard to manage your business</li>
          <li><strong>Secure Payments</strong> - We handle all payments, you focus on service</li>
          <li><strong>24/7 Support</strong> - Dedicated support for our partners</li>
        </ul>
      </div>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 25px 0 0 0;">
        If you have any questions, simply reply to this email or contact us at <a href="mailto:info@airporttransferportal.com" style="color: #0d9488;">info@airporttransferportal.com</a>
      </p>

      <p style="font-size: 16px; color: #1f2937; margin: 25px 0 0 0;">
        Best regards,<br>
        <strong>The Airport Transfer Portal Team</strong>
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
      <p style="margin: 10px 0 0 0;">
        <a href="https://airporttransferportal.com" style="color: #0d9488; text-decoration: none;">airporttransferportal.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

function getAutoReplyText(senderName: string) {
  return `
Dear ${senderName || 'Partner'},

Thank you for your interest in partnering with Airport Transfer Portal! We're excited to have you join our global network of trusted transfer providers.

HOW IT WORKS
============
1. Register - Create your supplier account at our portal
2. Set Up Service Zones - Select the airports you serve
3. Create Routes - Define your transfer routes and destinations
4. Set Pricing - Configure your prices for each vehicle type
5. Receive Bookings - We send you customers, you provide the service

COMMISSION STRUCTURE
====================
We operate on a 15% commission model. You set your prices, we handle marketing, customer acquisition, and payment processing. You receive the booking, provide the transfer, and get paid.

REGISTER NOW: https://airporttransferportal.com/supplier/register

WHY PARTNER WITH US?
====================
- Global Reach - Access to international travelers worldwide
- No Upfront Costs - Free to join, only pay commission on bookings
- Easy Management - User-friendly dashboard to manage your business
- Secure Payments - We handle all payments, you focus on service
- 24/7 Support - Dedicated support for our partners

If you have any questions, simply reply to this email or contact us at info@airporttransferportal.com

Best regards,
The Airport Transfer Portal Team

---
© ${new Date().getFullYear()} Airport Transfer Portal
https://airporttransferportal.com
`;
}

// Track replied emails to avoid duplicates
const repliedEmails = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('resend-signature') || request.headers.get('svix-signature');

    // Verify signature (optional - skip if no signature header for testing)
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    console.log('Resend webhook received:', JSON.stringify(body, null, 2));

    // Handle email.received event
    if (body.type === 'email.received') {
      const email = body.data;
      const messageId = email.message_id || email.id;

      // Skip if already replied
      if (repliedEmails.has(messageId)) {
        console.log('Already replied to this email, skipping');
        return NextResponse.json({ success: true, skipped: true });
      }

      // Skip auto-replies, bounces, and system emails
      const fromEmail = email.from?.toLowerCase() || '';
      const subject = email.subject?.toLowerCase() || '';

      if (
        fromEmail.includes('noreply') ||
        fromEmail.includes('no-reply') ||
        fromEmail.includes('mailer-daemon') ||
        fromEmail.includes('postmaster') ||
        subject.includes('auto-reply') ||
        subject.includes('out of office') ||
        subject.includes('automatic reply') ||
        subject.includes('delivery status') ||
        subject.includes('undeliverable')
      ) {
        console.log('Skipping auto-reply/system email');
        return NextResponse.json({ success: true, skipped: true });
      }

      // Extract sender name from email
      const senderName = email.from?.split('<')[0]?.trim()?.replace(/"/g, '') || '';

      // Send auto-reply
      console.log(`Sending auto-reply to: ${email.from}`);

      const result = await getResend().emails.send({
        from: 'Airport Transfer Portal <info@airporttransferportal.com>',
        to: email.from,
        subject: `Re: ${email.subject || 'Your inquiry'} - How to Partner with Airport Transfer Portal`,
        html: getAutoReplyHtml(senderName),
        text: getAutoReplyText(senderName),
        replyTo: 'info@airporttransferportal.com',
      });

      if (result.error) {
        console.error('Error sending auto-reply:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      // Mark as replied
      repliedEmails.add(messageId);

      console.log('Auto-reply sent successfully:', result.data?.id);

      return NextResponse.json({
        success: true,
        emailId: result.data?.id,
        repliedTo: email.from
      });
    }

    // Handle other webhook events
    return NextResponse.json({ success: true, event: body.type });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Verify webhook signature (optional but recommended)
export async function GET() {
  return NextResponse.json({
    status: 'Resend webhook endpoint active',
    endpoint: '/api/webhooks/resend'
  });
}
