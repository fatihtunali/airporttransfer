const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function send() {
  const result = await resend.emails.send({
    from: 'Airport Transfer Portal <info@airporttransferportal.com>',
    to: 'luxurytransferszagreb@gmail.com',
    subject: 'Re: Partner application error',
    html: `
<p>Hi Tom,</p>

<p>We need to verify locally, now you can log in.</p>

<p>Thanks,<br>
Fatih TUNALI<br>
Airport Transfer Portal</p>
`,
    replyTo: 'info@airporttransferportal.com'
  });
  console.log('Result:', JSON.stringify(result, null, 2));
}
send();
