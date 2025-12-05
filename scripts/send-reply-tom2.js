const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function send() {
  const result = await resend.emails.send({
    from: 'Airport Transfer Portal <info@airporttransferportal.com>',
    to: 'luxurytransferszagreb@gmail.com',
    subject: 'Re: Partner application error - Account Verified',
    html: `
<p>Hi Tom,</p>

<p>I've manually verified your account. You should now be able to log in at:</p>

<p><a href="https://airporttransferportal.com/supplier/login">https://airporttransferportal.com/supplier/login</a></p>

<p>Use your email: <strong>luxurytransferszagreb@gmail.com</strong> and the password you set during registration.</p>

<p>Once logged in, you can:</p>
<ul>
<li>Set up your service zones (Zagreb Airport)</li>
<li>Add your Mercedes E-Class vehicles</li>
<li>Set your prices (50 EUR for airport transfers)</li>
<li>Start receiving bookings!</li>
</ul>

<p>Let me know if you have any other issues.</p>

<p>Best regards,<br>
Fatih TUNALI<br>
Airport Transfer Portal</p>
`,
    replyTo: 'info@airporttransferportal.com'
  });
  console.log('Result:', JSON.stringify(result, null, 2));
}
send();
