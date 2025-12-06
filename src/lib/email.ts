import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'Airport Transfer Portal <info@airporttransferportal.com>';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://airporttransferportal.com';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Airport Transfer Portal</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Verify Your Email</p>
    </div>

    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
        Hi ${name},
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for registering with <strong>Airport Transfer Portal</strong>! Please verify your email address to complete your registration.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Verify Email Address
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 25px 0 0 0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verifyUrl}" style="color: #0d9488; word-break: break-all;">${verifyUrl}</a>
      </p>

      <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 25px 0 0 0;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify Your Email - Airport Transfer Portal',
    html,
    replyTo: 'info@airporttransferportal.com',
  });
}

export async function sendWelcomeEmail(email: string, name: string, companyName: string) {
  const loginUrl = `${BASE_URL}/supplier/login`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Airport Transfer Portal!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your account is now verified</p>
    </div>

    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
        Hi ${name},
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
        Great news! Your email has been verified and <strong>${companyName}</strong> is now registered on our platform.
      </p>

      <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0d9488; margin: 0 0 15px 0; font-size: 18px;">Getting Started</h3>
        <ol style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li><strong>Set Up Service Zones</strong> - Select the airports you serve</li>
          <li><strong>Create Routes</strong> - Define your transfer routes and destinations</li>
          <li><strong>Add Vehicles</strong> - List your vehicle fleet with photos</li>
          <li><strong>Set Pricing</strong> - Configure prices for each vehicle type</li>
          <li><strong>Start Receiving Bookings!</strong></li>
        </ol>
      </div>

      <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Commission Structure</h3>
        <p style="color: #78350f; margin: 0; line-height: 1.6;">
          We operate on a <strong>15% commission</strong> model. You set your prices, we handle marketing, customer acquisition, and payment processing.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Go to Supplier Dashboard
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Need Help?</h3>
        <p style="color: #4b5563; margin: 0; line-height: 1.6;">
          If you have any questions, simply reply to this email or contact us at
          <a href="mailto:info@airporttransferportal.com" style="color: #0d9488;">info@airporttransferportal.com</a>
        </p>
      </div>

      <p style="font-size: 16px; color: #1f2937; margin: 25px 0 0 0;">
        Best regards,<br>
        <strong>The Airport Transfer Portal Team</strong>
      </p>
    </div>

    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome Aboard! - Airport Transfer Portal',
    html,
    replyTo: 'info@airporttransferportal.com',
  });
}

export interface BookingConfirmationData {
  publicCode: string;
  customerName: string;
  customerEmail: string;
  pickupDatetime: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType: string;
  passengers: number;
  flightNumber?: string;
  totalPrice: number;
  currency: string;
  paymentStatus: string;
  specialRequests?: string;
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationData) {
  const trackUrl = `${BASE_URL}/track/${data.publicCode}`;
  const manageUrl = `${BASE_URL}/manage-booking?code=${data.publicCode}`;

  const pickupDate = new Date(data.pickupDatetime);
  const formattedDate = pickupDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = pickupDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const paymentBadge = data.paymentStatus === 'PAID'
    ? '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PAID</span>'
    : '<span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">PAYMENT PENDING</span>';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Reference: <strong>${data.publicCode}</strong></p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
        Hi ${data.customerName},
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 25px 0;">
        Thank you for booking with Airport Transfer Portal! Your transfer has been confirmed and a driver will be assigned shortly.
      </p>

      <!-- Booking Details Card -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 0 0 25px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0; font-size: 18px;">Transfer Details</h3>
          ${paymentBadge}
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Date</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${formattedDate}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Pickup Time</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${formattedTime}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Pickup Location</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.pickupAddress}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Drop-off Location</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.dropoffAddress}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Vehicle Type</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.vehicleType}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Passengers</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.passengers} ${data.passengers === 1 ? 'person' : 'people'}</strong>
            </td>
          </tr>
          ${data.flightNumber ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Flight Number</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.flightNumber}</strong>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 15px 0 0 0;">
              <span style="color: #6b7280; font-size: 14px;">Total Price</span><br>
              <strong style="color: #0d9488; font-size: 24px;">${data.currency} ${data.totalPrice.toFixed(2)}</strong>
            </td>
          </tr>
        </table>

        ${data.specialRequests ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <span style="color: #6b7280; font-size: 14px;">Special Requests</span><br>
          <span style="color: #1f2937; font-size: 14px;">${data.specialRequests}</span>
        </div>
        ` : ''}
      </div>

      <!-- Action Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${trackUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 5px;">
          Track Your Transfer
        </a>
        <a href="${manageUrl}"
           style="display: inline-block; background: #f1f5f9; color: #475569; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 5px;">
          Manage Booking
        </a>
      </div>

      <!-- What's Next -->
      <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="color: #0d9488; margin: 0 0 10px 0; font-size: 16px;">What happens next?</h3>
        <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
          <li>A driver will be assigned to your booking</li>
          <li>You'll receive driver details before your pickup</li>
          <li>On the day, track your driver in real-time</li>
          <li>Your driver will meet you at the pickup location</li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 25px;">
        <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h3>
        <p style="color: #4b5563; margin: 0; line-height: 1.6; font-size: 14px;">
          If you have any questions about your booking, reply to this email or contact us at
          <a href="mailto:support@airporttransferportal.com" style="color: #0d9488;">support@airporttransferportal.com</a>
        </p>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 25px 0 0 0; line-height: 1.6;">
        Safe travels!<br>
        <strong style="color: #1f2937;">The Airport Transfer Portal Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0 0 10px 0;">
        <a href="${BASE_URL}/terms" style="color: #9ca3af; text-decoration: none;">Terms</a> &nbsp;|&nbsp;
        <a href="${BASE_URL}/privacy" style="color: #9ca3af; text-decoration: none;">Privacy</a> &nbsp;|&nbsp;
        <a href="${BASE_URL}/help" style="color: #9ca3af; text-decoration: none;">Help Center</a>
      </p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.customerEmail,
    subject: `Booking Confirmed - ${data.publicCode} | Airport Transfer Portal`,
    html,
    replyTo: 'support@airporttransferportal.com',
  });
}

export interface SupplierNewBookingData {
  publicCode: string;
  supplierName: string;
  supplierEmail: string;
  customerName: string;
  customerPhone: string;
  pickupDatetime: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType: string;
  passengers: number;
  flightNumber?: string;
  totalPrice: number;
  supplierPayout: number;
  currency: string;
  specialRequests?: string;
}

export async function sendSupplierNewBookingEmail(data: SupplierNewBookingData) {
  const dashboardUrl = `${BASE_URL}/supplier/bookings`;

  const pickupDate = new Date(data.pickupDatetime);
  const formattedDate = pickupDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = pickupDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">New Booking Received!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Reference: <strong>${data.publicCode}</strong></p>
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
        Hi ${data.supplierName},
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 25px 0;">
        You have received a new booking! Please log in to your dashboard to assign a driver.
      </p>

      <!-- Payout Highlight -->
      <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 25px 0;">
        <span style="color: #059669; font-size: 14px; font-weight: 600;">YOUR PAYOUT</span>
        <div style="color: #059669; font-size: 32px; font-weight: 700; margin: 5px 0;">${data.currency} ${data.supplierPayout.toFixed(2)}</div>
      </div>

      <!-- Booking Details Card -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 0 0 25px 0;">
        <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px;">Booking Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Date & Time</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${formattedDate} at ${formattedTime}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Pickup</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.pickupAddress}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Drop-off</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.dropoffAddress}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Vehicle</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.vehicleType} (${data.passengers} pax)</strong>
            </td>
          </tr>
          ${data.flightNumber ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-size: 14px;">Flight</span><br>
              <strong style="color: #1f2937; font-size: 15px;">${data.flightNumber}</strong>
            </td>
          </tr>
          ` : ''}
        </table>

        ${data.specialRequests ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <span style="color: #6b7280; font-size: 14px;">Special Requests</span><br>
          <span style="color: #1f2937; font-size: 14px;">${data.specialRequests}</span>
        </div>
        ` : ''}
      </div>

      <!-- Customer Info -->
      <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 0 0 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Customer Contact</h3>
        <p style="color: #78350f; margin: 0; font-size: 15px;">
          <strong>${data.customerName}</strong><br>
          ${data.customerPhone}
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Assign Driver Now
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 25px 0 0 0; text-align: center;">
        Please assign a driver as soon as possible to confirm this booking.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.supplierEmail,
    subject: `New Booking ${data.publicCode} - ${formattedDate} | Action Required`,
    html,
    replyTo: 'suppliers@airporttransferportal.com',
  });
}

// Driver assignment reminder email (sent 5 hours before pickup if no driver assigned)
interface DriverReminderData {
  publicCode: string;
  supplierName: string;
  supplierEmail: string;
  customerName: string;
  customerPhone: string;
  pickupDatetime: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType: string;
  passengers: number;
  hoursUntilPickup: number;
}

export async function sendDriverAssignmentReminder(data: DriverReminderData) {
  const pickupDate = new Date(data.pickupDatetime);
  const formattedDate = pickupDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = pickupDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dashboardUrl = `${BASE_URL}/supplier/bookings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ URGENT: Driver Assignment Required</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Booking ${data.publicCode}</p>
    </div>

    <div style="background: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 0 0 25px 0; text-align: center;">
        <p style="color: #991b1b; margin: 0; font-size: 18px; font-weight: bold;">
          ⏰ Only ${Math.round(data.hoursUntilPickup)} hours until pickup!
        </p>
        <p style="color: #b91c1c; margin: 10px 0 0 0; font-size: 14px;">
          No driver has been assigned yet. Please assign a driver immediately.
        </p>
      </div>

      <p style="font-size: 16px; color: #1f2937; margin: 0 0 20px 0;">
        Hi ${data.supplierName},
      </p>

      <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin: 0 0 25px 0;">
        This is an urgent reminder that booking <strong>${data.publicCode}</strong> has no driver assigned and pickup is in approximately <strong>${Math.round(data.hoursUntilPickup)} hours</strong>.
      </p>

      <!-- Booking Details -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 0 0 25px 0;">
        <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Booking Details</h3>

        <div style="margin: 0 0 12px 0;">
          <span style="color: #6b7280; font-size: 14px;">Pickup Time</span><br>
          <span style="color: #1f2937; font-size: 16px; font-weight: 600;">${formattedDate} at ${formattedTime}</span>
        </div>

        <div style="margin: 0 0 12px 0;">
          <span style="color: #6b7280; font-size: 14px;">From</span><br>
          <span style="color: #1f2937; font-size: 14px;">${data.pickupAddress}</span>
        </div>

        <div style="margin: 0 0 12px 0;">
          <span style="color: #6b7280; font-size: 14px;">To</span><br>
          <span style="color: #1f2937; font-size: 14px;">${data.dropoffAddress}</span>
        </div>

        <div style="margin: 0 0 12px 0;">
          <span style="color: #6b7280; font-size: 14px;">Vehicle & Passengers</span><br>
          <span style="color: #1f2937; font-size: 14px;">${data.vehicleType} • ${data.passengers} passenger(s)</span>
        </div>
      </div>

      <!-- Customer Info -->
      <div style="background: #fef3c7; border-radius: 12px; padding: 20px; margin: 0 0 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Customer Contact</h3>
        <p style="color: #78350f; margin: 0; font-size: 15px;">
          <strong>${data.customerName}</strong><br>
          ${data.customerPhone}
        </p>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Assign Driver Now
        </a>
      </div>

      <p style="font-size: 14px; color: #dc2626; margin: 25px 0 0 0; text-align: center; font-weight: 500;">
        Please assign a driver immediately to avoid service disruption.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

  return getResend().emails.send({
    from: FROM_EMAIL,
    to: data.supplierEmail,
    subject: `⚠️ URGENT: Assign Driver for ${data.publicCode} - Pickup in ${Math.round(data.hoursUntilPickup)} hours`,
    html,
    replyTo: 'suppliers@airporttransferportal.com',
  });
}
