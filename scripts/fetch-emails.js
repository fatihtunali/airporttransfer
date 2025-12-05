// Fetch received emails from Resend and forward to inbox
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 'RESEND_API_KEY_REMOVED');

const FORWARD_TO = 'info@airporttransferportal.com';
const PROCESSED_FILE = '/tmp/processed-emails.json';

const fs = require('fs');

// Load processed email IDs
function loadProcessedIds() {
  try {
    if (fs.existsSync(PROCESSED_FILE)) {
      return JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('No processed emails file found, starting fresh');
  }
  return [];
}

// Save processed email IDs
function saveProcessedIds(ids) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(ids, null, 2));
}

async function fetchAndForwardEmails() {
  console.log('Fetching received emails from Resend...\n');

  try {
    // List all received emails
    const result = await resend.emails.receiving.list();

    console.log('API Response:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('Error fetching emails:', result.error);
      return;
    }

    const emails = result.data?.data || result.data || [];

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.log('No received emails found');
      return;
    }

    console.log(`Found ${emails.length} received emails\n`);

    // Load already processed IDs
    const processedIds = loadProcessedIds();

    // Process each email
    for (const email of emails) {
      // Skip if already processed
      if (processedIds.includes(email.id)) {
        console.log(`Already processed: ${email.subject?.substring(0, 50)}...`);
        continue;
      }

      console.log('---');
      console.log(`From: ${email.from}`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Date: ${email.created_at}`);

      // Get full email content
      const { data: fullEmail, error: detailError } = await resend.emails.receiving.get(email.id);

      if (detailError) {
        console.error(`Error getting email details: ${detailError}`);
        continue;
      }

      // Forward the email
      console.log(`Forwarding to ${FORWARD_TO}...`);

      const forwardResult = await resend.emails.send({
        from: 'Airport Transfer Portal <info@airporttransferportal.com>',
        to: FORWARD_TO,
        subject: `FWD: ${email.subject || 'No Subject'}`,
        html: `
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Forwarded Email</strong></p>
            <p><strong>From:</strong> ${email.from}</p>
            <p><strong>To:</strong> ${email.to}</p>
            <p><strong>Date:</strong> ${email.created_at}</p>
            <p><strong>Subject:</strong> ${email.subject}</p>
          </div>
          <hr style="margin: 20px 0;">
          <div>
            ${fullEmail.html || fullEmail.text || '<p>No content</p>'}
          </div>
        `,
        text: `
Forwarded Email
From: ${email.from}
To: ${email.to}
Date: ${email.created_at}
Subject: ${email.subject}

---

${fullEmail.text || 'No content'}
        `
      });

      if (forwardResult.error) {
        console.error(`Error forwarding: ${forwardResult.error}`);
      } else {
        console.log(`Forwarded successfully!`);
        processedIds.push(email.id);
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    }

    // Save processed IDs
    saveProcessedIds(processedIds);

    console.log('\n---');
    console.log(`Done! Processed ${processedIds.length} emails total.`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run
fetchAndForwardEmails();
