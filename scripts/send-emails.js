// Email sender script for supplier outreach
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend('RESEND_API_KEY_REMOVED');

const CONTACTS_PATH = path.join(__dirname, 'supplier-outreach', 'contacts.json');
const LOGO_URL = 'https://airporttransferportal.com/logo/logo_atp.jpg';
const WEBSITE_URL = 'https://airporttransferportal.com';

// Email templates
const footerHTML = `
<div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <img src="${LOGO_URL}" alt="Airport Transfer Portal" width="150" style="display: block;">
      </td>
    </tr>
    <tr>
      <td style="padding-top: 15px;">
        <p style="margin: 0; font-size: 14px; color: #333;">
          <strong>Airport Transfer Portal</strong><br>
          Global Airport Transfer Network
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
          <a href="${WEBSITE_URL}" style="color: #0066cc;">www.airporttransferportal.com</a><br>
          Email: info@airporttransferportal.com
        </p>
        <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
          Part of DYF TURIZM TIC LTD STI<br>
          Istanbul, Turkey
        </p>
      </td>
    </tr>
  </table>
</div>
`;

const baseStyle = `
<style>
  body { font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .btn { display: inline-block; padding: 12px 30px; background-color: #0066cc; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; }
  ul { padding-left: 20px; }
  li { margin-bottom: 8px; }
</style>
`;

function getEmailTemplate(contact) {
  const isTurkish = ['Turkey', 'Türkiye', 'Azerbaijan'].some(c =>
    (contact.country || '').toLowerCase().includes(c.toLowerCase())
  );

  const city = contact.city || 'your area';
  const country = contact.country || '';
  const company = contact.companyName || 'Your Company';

  if (isTurkish) {
    return {
      subject: `${company} için İş Birliği Fırsatı - Airport Transfer Portal`,
      html: `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
<div class="container">
  <p>Sayın Yetkili,</p>

  <p>Size <strong>Airport Transfer Portal</strong>'dan ulaşıyorum. Platformumuz, dünya genelindeki yolcuları güvenilir yerel transfer sağlayıcılarıyla buluşturmaktadır.</p>

  <p><strong>${city} bölgesinde müşterilerimize hizmet verecek güvenilir transfer partnerleri arıyoruz.</strong></p>

  <p>Kaliteli hizmetlerinizi fark ettik ve tedarikçi ağımıza katılmanız için harika bir aday olduğunuza inanıyoruz.</p>

  <h3 style="color: #0066cc;">Nasıl Çalışır:</h3>
  <ul>
    <li><strong>Size Rezervasyon Gönderiyoruz:</strong> Uluslararası müşterilerimizden transfer talepleri alırsınız</li>
    <li><strong>Transferleri Siz Yaparsınız:</strong> Müşterilerimize kaliteli hizmetinizi sunarsınız</li>
    <li><strong>Transfer Başına Ödeme:</strong> Tamamlanan her rezervasyon için kazanç elde edersiniz</li>
    <li><strong>Katılım Ücretsiz:</strong> Kayıt ücretsiz, gizli maliyet yok</li>
  </ul>

  <p>Büyüyen global müşteri tabanımıza hizmet vermek için sizin gibi güvenilir yerel partnerlere ihtiyacımız var.</p>

  <p style="margin: 30px 0;">
    <a href="${WEBSITE_URL}/supplier/register" class="btn">Partner Olun</a>
  </p>

  <p>Bu fırsatı değerlendirmek için bu hafta kısa bir görüşme yapabilir miyiz?</p>

  <p>Saygılarımla,</p>

  ${footerHTML}
</div>
</body>
</html>
`
    };
  } else {
    return {
      subject: `Partnership Opportunity for ${company} - Airport Transfer Portal`,
      html: `
<!DOCTYPE html>
<html>
<head>${baseStyle}</head>
<body>
<div class="container">
  <p>Dear Team,</p>

  <p>I hope this email finds you well. I am reaching out from <strong>Airport Transfer Portal</strong>, a global platform that connects international travelers with trusted local transfer providers.</p>

  <p><strong>We are looking for reliable transfer partners in ${city}${country ? ', ' + country : ''}</strong> to handle airport transfers for our customers in your region.</p>

  <p>We noticed your excellent services and believe you would be a great fit to join our supplier network.</p>

  <h3 style="color: #0066cc;">How It Works:</h3>
  <ul>
    <li><strong>We Send You Bookings:</strong> You receive transfer requests from our international customers</li>
    <li><strong>You Handle the Transfers:</strong> Provide your quality service to our mutual customers</li>
    <li><strong>Get Paid Per Transfer:</strong> Earn money for each completed booking</li>
    <li><strong>No Fees to Join:</strong> Free registration, no hidden costs</li>
  </ul>

  <p>We need trusted local partners like you to serve our growing global customer base.</p>

  <p style="margin: 30px 0;">
    <a href="${WEBSITE_URL}/supplier/register" class="btn">Become a Partner</a>
  </p>

  <p>Would you be available for a quick call this week to explore this opportunity?</p>

  <p>Best regards,</p>

  ${footerHTML}
</div>
</body>
</html>
`
    };
  }
}

async function sendEmails() {
  // Load contacts
  const data = JSON.parse(fs.readFileSync(CONTACTS_PATH, 'utf8'));
  const contacts = data.contacts.filter(c =>
    c.status === 'new' &&
    c.email &&
    c.email.includes('@') &&
    !c.email.includes('example.com') &&
    !c.email.includes('test@')
  );

  console.log(`Found ${contacts.length} contacts to email`);

  let sent = 0;
  let failed = 0;

  for (const contact of contacts) {
    try {
      const template = getEmailTemplate(contact);

      const result = await resend.emails.send({
        from: 'Airport Transfer Portal <info@airporttransferportal.com>',
        to: contact.email,
        bcc: 'fatihtunali@funnytourism.com',
        subject: template.subject,
        html: template.html
      });

      if (result.data?.id) {
        sent++;
        contact.status = 'emailed';
        contact.emails.push({
          templateNum: 1,
          sentAt: new Date().toISOString(),
          messageId: result.data.id
        });
        console.log(`✓ Sent to ${contact.email} (${contact.city}, ${contact.country})`);
      } else {
        failed++;
        console.log(`✗ Failed: ${contact.email} - ${result.error?.message || 'Unknown error'}`);
      }

      // Rate limit: 2 emails per second (Resend limit)
      await new Promise(r => setTimeout(r, 600));

    } catch (error) {
      failed++;
      console.log(`✗ Error: ${contact.email} - ${error.message}`);
    }

    // Save progress every 10 emails
    if ((sent + failed) % 10 === 0) {
      data.metadata.lastUpdated = new Date().toISOString();
      fs.writeFileSync(CONTACTS_PATH, JSON.stringify(data, null, 2));
      console.log(`--- Progress: ${sent} sent, ${failed} failed ---`);
    }
  }

  // Final save
  data.metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync(CONTACTS_PATH, JSON.stringify(data, null, 2));

  console.log(`\n=== COMPLETE ===`);
  console.log(`Sent: ${sent}`);
  console.log(`Failed: ${failed}`);
}

sendEmails();
