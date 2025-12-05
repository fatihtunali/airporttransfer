const { Resend } = require('resend');
const resend = new Resend('RESEND_API_KEY_REMOVED');

async function send() {
  const result = await resend.emails.send({
    from: 'Airport Transfer Portal <info@airporttransferportal.com>',
    to: 'luxurytransferszagreb@gmail.com',
    subject: 'Re: Partner application error',
    html: `
<p>Hi Tom,</p>

<p>Thank you for your message!</p>

<p>Your pricing at 50 EUR for high-end Mercedes E-Class service sounds excellent. We absolutely support premium transfer services - you set your own prices on our platform, and we only take a 15% commission on completed bookings.</p>

<p>Regarding full-day chauffeur services - yes, this is something we're looking to offer our clients. Premium vehicles like your 2025 Mercedes E-Class would be perfect for this.</p>

<p>As for exclusivity, this is definitely something we can discuss further. We value quality partners and would be interested in exploring this option with you.</p>

<p>Let's get you set up on the platform first, and then we can discuss the partnership details in more depth. Could you try logging in again? If you're still having issues, please let me know the exact error message you see.</p>

<p>Looking forward to working together!</p>

<p>Best regards,<br>
Fatih TUNALI<br>
Airport Transfer Portal</p>
`,
    replyTo: 'info@airporttransferportal.com'
  });
  console.log('Result:', JSON.stringify(result, null, 2));
}
send();
