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
