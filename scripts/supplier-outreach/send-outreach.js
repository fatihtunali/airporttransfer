#!/usr/bin/env node
/**
 * Supplier Outreach Email System
 *
 * This script sends outreach emails to potential suppliers
 * and tracks the status in a JSON database.
 *
 * Usage:
 *   node send-outreach.js add --company "ABC Transfer" --email "info@abc.com" --city "Istanbul" --country "Turkey"
 *   node send-outreach.js send --batch 20
 *   node send-outreach.js followup
 *   node send-outreach.js status
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  smtp: {
    host: '134.209.137.11',
    port: 587,
    secure: false,
    auth: {
      user: 'partners@airporttransferportal.com',
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  from: {
    name: 'Airport Transfer Portal',
    email: 'partners@airporttransferportal.com'
  },
  replyTo: 'partners@airporttransferportal.com',
  baseUrl: 'https://airporttransferportal.com'
};

// Email Templates
const TEMPLATES = {
  en: {
    subject1: 'Partnership Opportunity - Free International Bookings for {companyName}',
    subject2: 'Re: Partnership Opportunity - Quick Question',
    subject3: 'Last chance: {city} Airport Transfer Partnership',

    body1: `Dear {contactName},

I'm reaching out from Airport Transfer Portal (airporttransferportal.com), a global platform connecting international travelers with verified local transfer companies.

We're expanding our network in {city} and your company caught our attention due to your excellent reputation.

WHAT WE OFFER:
━━━━━━━━━━━━━━━
✓ FREE bookings - We bring customers directly to you
✓ YOU set your own prices - Full control over your rates
✓ International customers - Tourists from Europe, USA, Asia
✓ Simple online dashboard - Manage all bookings in one place
✓ Flexible payment - Get paid weekly or monthly
✓ No exclusivity - Work with us alongside your existing channels

WHAT WE NEED FROM YOU:
━━━━━━━━━━━━━━━━━━━━━━
• Valid business/transport license
• Vehicle insurance documents
• At least 1 professional vehicle
• Commitment to quality service

HOW IT WORKS:
━━━━━━━━━━━━━
1. You register on our platform (free, takes 10 minutes)
2. Upload your documents for verification
3. Set your prices for routes you want to serve
4. Start receiving bookings!

We already have 100+ verified suppliers across 50+ cities, and we're growing fast.

Interested? Simply reply to this email or register directly at:
👉 ${CONFIG.baseUrl}/supplier/register

I'm happy to schedule a quick call to answer any questions.

Best regards,

Airport Transfer Portal Team
${CONFIG.baseUrl}`,

    body2: `Hi {contactName},

I wanted to follow up on my previous email about partnering with Airport Transfer Portal.

I understand you're busy, so I'll keep this brief:

We recently onboarded several transfer companies in your region, and they're already receiving bookings from international tourists.

If you're interested but have questions, I'm happy to:
• Give you a quick 10-minute demo
• Answer any concerns about the process
• Help you get set up personally

Just reply "interested" and I'll send you the details.

Best,
Airport Transfer Portal Team

P.S. There's no cost to join, and no commitment. You can try it risk-free.`,

    body3: `Hi {contactName},

This is my final email about partnering with Airport Transfer Portal.

I don't want to fill your inbox, so I'll make this simple:

We're currently selecting partner companies in {city} to work with for international tourist bookings.

If you'd like to be considered, please reply within the next few days.

If not, no problem at all - I wish you continued success!

Quick reminder of what you get:
• Free international customer bookings
• You set your own prices
• No upfront costs or commitments
• Simple dashboard to manage everything

Register here: ${CONFIG.baseUrl}/supplier/register

All the best,
Airport Transfer Portal Team`
  },

  tr: {
    subject1: 'İş Ortaklığı Fırsatı - {companyName} için Uluslararası Müşteriler',
    subject2: 'Re: İş Ortaklığı Fırsatı - Kısa Bir Soru',
    subject3: 'Son Fırsat: {city} Havalimanı Transfer Ortaklığı',

    body1: `Sayın {contactName},

Airport Transfer Portal (airporttransferportal.com) olarak, dünya genelinde turistleri yerel transfer şirketleriyle buluşturuyoruz.

{city} bölgesinde ağımızı genişletiyoruz ve şirketinizin kaliteli hizmet anlayışı dikkatimizi çekti.

SİZE SUNDUKLARIMIZ:
━━━━━━━━━━━━━━━━━━━
✓ ÜCRETSİZ rezervasyonlar - Müşterileri biz getiriyoruz
✓ FİYATLARI SİZ belirleyin - Tam kontrol sizde
✓ Uluslararası müşteriler - Avrupa, Amerika, Asya'dan turistler
✓ Kolay online panel - Tüm rezervasyonları tek yerden yönetin
✓ Esnek ödeme - Haftalık veya aylık ödeme seçeneği
✓ Münhasırlık YOK - Mevcut kanallarınızla birlikte çalışın

SİZDEN İSTEDİKLERİMİZ:
━━━━━━━━━━━━━━━━━━━━━━
• Geçerli işletme/taşımacılık ruhsatı
• Araç sigorta belgeleri
• En az 1 profesyonel araç
• Kaliteli hizmet taahhüdü

NASIL ÇALIŞIR:
━━━━━━━━━━━━━━
1. Platformumuza kayıt olun (ücretsiz, 10 dakika)
2. Belgelerinizi yükleyin
3. Hizmet vermek istediğiniz güzergahlar için fiyat belirleyin
4. Rezervasyon almaya başlayın!

İlgileniyor musunuz? Bu e-postaya yanıt verin veya doğrudan kaydolun:
👉 ${CONFIG.baseUrl}/supplier/register

Sorularınız için görüşme ayarlayabiliriz.

Saygılarımla,

Airport Transfer Portal Ekibi
${CONFIG.baseUrl}`,

    body2: `Merhaba {contactName},

Airport Transfer Portal ortaklığı hakkındaki önceki e-postamı takip etmek istedim.

Meşgul olduğunuzu biliyorum, bu yüzden kısa tutacağım:

Bölgenizde birçok transfer şirketini sisteme dahil ettik ve uluslararası turistlerden rezervasyon almaya başladılar.

İlgileniyorsanız ama sorularınız varsa:
• 10 dakikalık kısa bir demo verebilirim
• Süreç hakkındaki endişelerinizi yanıtlayabilirim
• Kurulumda size yardımcı olabilirim

Sadece "ilgileniyorum" yazarak yanıt verin, detayları gönderirim.

Saygılarımla,
Airport Transfer Portal Ekibi

Not: Katılmak ücretsiz ve taahhüt yok. Risksiz deneyebilirsiniz.`,

    body3: `Merhaba {contactName},

Airport Transfer Portal ortaklığı hakkında son e-postam bu.

Gelen kutunuzu doldurmak istemiyorum, bu yüzden basit tutacağım:

{city} bölgesinde uluslararası turist rezervasyonları için ortak şirketler seçiyoruz.

Değerlendirilmek istiyorsanız, lütfen önümüzdeki birkaç gün içinde yanıt verin.

İstemiyorsanız, sorun değil - başarılarınızın devamını dilerim!

Size sunduklarımızı hatırlatayım:
• Ücretsiz uluslararası müşteri rezervasyonları
• Fiyatları siz belirleyin
• Peşin maliyet veya taahhüt yok
• Her şeyi yönetmek için basit panel

Buradan kaydolun: ${CONFIG.baseUrl}/supplier/register

En iyi dileklerimle,
Airport Transfer Portal Ekibi`
  },

  ar: {
    subject1: 'فرصة شراكة - عملاء دوليون مجاناً لـ {companyName}',
    subject2: 'Re: فرصة شراكة - سؤال سريع',
    subject3: 'آخر فرصة: شراكة نقل مطار {city}',

    body1: `السيد/السيدة {contactName} المحترم،

أتواصل معكم من Airport Transfer Portal (airporttransferportal.com)، منصة عالمية تربط المسافرين الدوليين بشركات النقل المحلية المعتمدة.

نحن نوسع شبكتنا في {city} وقد لفتت شركتكم انتباهنا بسبب سمعتكم الممتازة.

ما نقدمه لكم:
━━━━━━━━━━━━━
✓ حجوزات مجانية - نحن نجلب العملاء إليكم
✓ أنتم تحددون الأسعار - تحكم كامل في أسعاركم
✓ عملاء دوليون - سياح من أوروبا وأمريكا وآسيا
✓ لوحة تحكم بسيطة - إدارة جميع الحجوزات في مكان واحد
✓ دفع مرن - أسبوعي أو شهري
✓ بدون حصرية - اعملوا معنا بجانب قنواتكم الحالية

ما نحتاجه منكم:
━━━━━━━━━━━━━━
• رخصة عمل/نقل سارية
• وثائق تأمين المركبات
• مركبة احترافية واحدة على الأقل
• الالتزام بجودة الخدمة

مهتمون؟ سجلوا مباشرة على:
👉 ${CONFIG.baseUrl}/supplier/register

مع أطيب التحيات،

فريق Airport Transfer Portal
${CONFIG.baseUrl}`,

    body2: `مرحباً {contactName}،

أردت المتابعة بخصوص رسالتي السابقة عن الشراكة مع Airport Transfer Portal.

أفهم أنك مشغول، لذا سأختصر:

قمنا مؤخراً بإضافة عدة شركات نقل في منطقتكم، وهم يتلقون بالفعل حجوزات من السياح الدوليين.

إذا كنت مهتماً ولديك أسئلة:
• يمكنني تقديم عرض توضيحي سريع (10 دقائق)
• الإجابة على أي استفسارات
• مساعدتك في الإعداد شخصياً

فقط رد بـ "مهتم" وسأرسل لك التفاصيل.

مع أطيب التحيات،
فريق Airport Transfer Portal

ملاحظة: الانضمام مجاني وبدون التزام. يمكنك التجربة بدون مخاطر.`,

    body3: `مرحباً {contactName}،

هذه رسالتي الأخيرة بخصوص الشراكة مع Airport Transfer Portal.

لا أريد ملء بريدك، لذا سأبسط الأمر:

نختار حالياً شركات شريكة في {city} للعمل معها لحجوزات السياح الدوليين.

إذا أردت أن تكون من ضمنهم، يرجى الرد خلال الأيام القليلة القادمة.

إذا لم ترغب، لا مشكلة - أتمنى لك استمرار النجاح!

سجل هنا: ${CONFIG.baseUrl}/supplier/register

أطيب الأمنيات،
فريق Airport Transfer Portal`
  }
};

// Database operations
const DB_PATH = path.join(__dirname, 'contacts.json');

function loadDatabase() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { metadata: { lastUpdated: new Date().toISOString(), totalContacts: 0 }, contacts: [] };
  }
}

function saveDatabase(db) {
  db.metadata.lastUpdated = new Date().toISOString();
  db.metadata.totalContacts = db.contacts.length;
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Add a new contact
function addContact(data) {
  const db = loadDatabase();

  // Check for duplicates
  const exists = db.contacts.find(c => c.email.toLowerCase() === data.email.toLowerCase());
  if (exists) {
    console.log(`⚠️  Contact already exists: ${data.email}`);
    return false;
  }

  const contact = {
    id: Date.now().toString(),
    companyName: data.company,
    contactName: data.name || 'Team',
    email: data.email,
    phone: data.phone || '',
    website: data.website || '',
    city: data.city,
    country: data.country,
    language: data.language || detectLanguage(data.country),
    source: data.source || 'manual',
    status: 'new',
    emails: [],
    createdAt: new Date().toISOString(),
    notes: data.notes || ''
  };

  db.contacts.push(contact);
  saveDatabase(db);
  console.log(`✅ Added contact: ${contact.companyName} (${contact.email})`);
  return true;
}

// Detect language based on country
function detectLanguage(country) {
  const turkishCountries = ['Turkey', 'Türkiye', 'Azerbaijan'];
  const arabicCountries = ['UAE', 'Egypt', 'Morocco', 'Tunisia', 'Jordan', 'Qatar', 'Oman', 'Saudi Arabia', 'Lebanon', 'Kuwait', 'Bahrain'];

  if (turkishCountries.includes(country)) return 'tr';
  if (arabicCountries.includes(country)) return 'ar';
  return 'en';
}

// Get template with variables replaced
function getTemplate(language, templateNum, variables) {
  const lang = TEMPLATES[language] || TEMPLATES.en;
  let subject = lang[`subject${templateNum}`];
  let body = lang[`body${templateNum}`];

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  }

  return { subject, body };
}

// Send email
async function sendEmail(contact, templateNum) {
  const transporter = nodemailer.createTransport(CONFIG.smtp);

  const variables = {
    companyName: contact.companyName,
    contactName: contact.contactName,
    city: contact.city,
    country: contact.country
  };

  const { subject, body } = getTemplate(contact.language, templateNum, variables);

  const mailOptions = {
    from: `"${CONFIG.from.name}" <${CONFIG.from.email}>`,
    to: contact.email,
    replyTo: CONFIG.replyTo,
    subject: subject,
    text: body,
    html: body.replace(/\n/g, '<br>').replace(/━/g, '─')
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email ${templateNum} sent to: ${contact.email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send to ${contact.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Send batch of first emails
async function sendBatch(batchSize = 20) {
  const db = loadDatabase();
  const pending = db.contacts.filter(c => c.status === 'new' && c.emails.length === 0);
  const batch = pending.slice(0, batchSize);

  console.log(`\n📧 Sending ${batch.length} emails (${pending.length} pending total)...\n`);

  let sent = 0;
  let failed = 0;

  for (const contact of batch) {
    const result = await sendEmail(contact, 1);

    if (result.success) {
      contact.emails.push({
        templateNum: 1,
        sentAt: new Date().toISOString(),
        messageId: result.messageId
      });
      contact.status = 'contacted';
      sent++;
    } else {
      contact.emails.push({
        templateNum: 1,
        sentAt: new Date().toISOString(),
        error: result.error
      });
      failed++;
    }

    // Rate limiting - wait 2 seconds between emails
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  saveDatabase(db);
  console.log(`\n📊 Results: ${sent} sent, ${failed} failed\n`);
}

// Send follow-up emails
async function sendFollowups() {
  const db = loadDatabase();
  const now = new Date();

  const needsFollowup2 = db.contacts.filter(c => {
    if (c.status !== 'contacted' || c.emails.length !== 1) return false;
    const lastEmail = new Date(c.emails[0].sentAt);
    const daysSince = (now - lastEmail) / (1000 * 60 * 60 * 24);
    return daysSince >= 5;
  });

  const needsFollowup3 = db.contacts.filter(c => {
    if (c.status !== 'contacted' || c.emails.length !== 2) return false;
    const lastEmail = new Date(c.emails[1].sentAt);
    const daysSince = (now - lastEmail) / (1000 * 60 * 60 * 24);
    return daysSince >= 5;
  });

  console.log(`\n📧 Follow-up 2: ${needsFollowup2.length} contacts`);
  console.log(`📧 Follow-up 3: ${needsFollowup3.length} contacts\n`);

  // Send follow-up 2
  for (const contact of needsFollowup2) {
    const result = await sendEmail(contact, 2);
    contact.emails.push({
      templateNum: 2,
      sentAt: new Date().toISOString(),
      messageId: result.messageId || null,
      error: result.error || null
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Send follow-up 3
  for (const contact of needsFollowup3) {
    const result = await sendEmail(contact, 3);
    contact.emails.push({
      templateNum: 3,
      sentAt: new Date().toISOString(),
      messageId: result.messageId || null,
      error: result.error || null
    });
    contact.status = 'completed'; // No more follow-ups
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  saveDatabase(db);
}

// Update contact status
function updateStatus(email, newStatus, notes = '') {
  const db = loadDatabase();
  const contact = db.contacts.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (!contact) {
    console.log(`❌ Contact not found: ${email}`);
    return false;
  }

  contact.status = newStatus;
  if (notes) contact.notes = notes;
  contact.updatedAt = new Date().toISOString();

  saveDatabase(db);
  console.log(`✅ Updated ${email} to status: ${newStatus}`);
  return true;
}

// Show status summary
function showStatus() {
  const db = loadDatabase();

  const statusCounts = {};
  const cityCounts = {};
  const countryCounts = {};

  for (const contact of db.contacts) {
    statusCounts[contact.status] = (statusCounts[contact.status] || 0) + 1;
    cityCounts[contact.city] = (cityCounts[contact.city] || 0) + 1;
    countryCounts[contact.country] = (countryCounts[contact.country] || 0) + 1;
  }

  console.log('\n📊 OUTREACH STATUS SUMMARY\n');
  console.log('═══════════════════════════════════════\n');

  console.log('By Status:');
  console.log('───────────────────────────────────────');
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  ${status.padEnd(15)} ${count}`);
  }

  console.log('\nBy Country (Top 10):');
  console.log('───────────────────────────────────────');
  const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [country, count] of topCountries) {
    console.log(`  ${country.padEnd(20)} ${count}`);
  }

  console.log('\nBy City (Top 10):');
  console.log('───────────────────────────────────────');
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [city, count] of topCities) {
    console.log(`  ${city.padEnd(20)} ${count}`);
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`Total contacts: ${db.contacts.length}`);
  console.log(`Last updated: ${db.metadata.lastUpdated}`);
  console.log('');
}

// Import contacts from CSV
function importCSV(filepath) {
  const csv = fs.readFileSync(filepath, 'utf8');
  const lines = csv.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const data = {};

    headers.forEach((header, idx) => {
      data[header] = values[idx] || '';
    });

    if (data.email && data.city) {
      const added = addContact({
        company: data.company || data.companyname || 'Unknown',
        name: data.name || data.contactname || 'Team',
        email: data.email,
        phone: data.phone || '',
        website: data.website || '',
        city: data.city,
        country: data.country || '',
        language: data.language || '',
        source: 'csv-import'
      });

      if (added) imported++;
      else skipped++;
    }
  }

  console.log(`\n✅ Imported: ${imported}, Skipped (duplicates): ${skipped}\n`);
}

// Export contacts to CSV
function exportCSV(filepath) {
  const db = loadDatabase();
  const headers = ['company', 'contactName', 'email', 'phone', 'website', 'city', 'country', 'language', 'status', 'emailsSent', 'createdAt', 'notes'];

  let csv = headers.join(',') + '\n';

  for (const contact of db.contacts) {
    const row = [
      `"${contact.companyName}"`,
      `"${contact.contactName}"`,
      contact.email,
      contact.phone,
      contact.website,
      contact.city,
      contact.country,
      contact.language,
      contact.status,
      contact.emails.length,
      contact.createdAt,
      `"${(contact.notes || '').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\n';
  }

  fs.writeFileSync(filepath, csv);
  console.log(`✅ Exported ${db.contacts.length} contacts to ${filepath}`);
}

// CLI Handler
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'add':
    const addData = {};
    for (let i = 1; i < args.length; i += 2) {
      const key = args[i].replace('--', '');
      addData[key] = args[i + 1];
    }
    addContact(addData);
    break;

  case 'send':
    const batchSize = args.includes('--batch') ? parseInt(args[args.indexOf('--batch') + 1]) : 20;
    sendBatch(batchSize);
    break;

  case 'followup':
    sendFollowups();
    break;

  case 'status':
    showStatus();
    break;

  case 'update':
    const email = args[args.indexOf('--email') + 1];
    const newStatus = args[args.indexOf('--status') + 1];
    const notes = args.includes('--notes') ? args[args.indexOf('--notes') + 1] : '';
    updateStatus(email, newStatus, notes);
    break;

  case 'import':
    const importPath = args[1];
    importCSV(importPath);
    break;

  case 'export':
    const exportPath = args[1] || 'contacts-export.csv';
    exportCSV(exportPath);
    break;

  default:
    console.log(`
📧 SUPPLIER OUTREACH CLI

Usage:
  node send-outreach.js <command> [options]

Commands:
  add         Add a new contact
              --company "Company Name"
              --email "email@example.com"
              --city "City Name"
              --country "Country Name"
              --name "Contact Name" (optional)
              --phone "+1234567890" (optional)
              --website "https://..." (optional)
              --language "en|tr|ar" (optional, auto-detected)

  send        Send first emails to new contacts
              --batch 20 (number of emails to send)

  followup    Send follow-up emails (automatic timing)

  status      Show outreach status summary

  update      Update contact status
              --email "email@example.com"
              --status "interested|registered|rejected|no-response"
              --notes "Any notes" (optional)

  import      Import contacts from CSV
              node send-outreach.js import contacts.csv

  export      Export contacts to CSV
              node send-outreach.js export [filename.csv]

Status Values:
  new         - Just added, no emails sent
  contacted   - First email sent
  interested  - Replied with interest
  registered  - Signed up on platform
  rejected    - Not interested
  completed   - All follow-ups sent, no response
    `);
}

module.exports = { addContact, sendBatch, sendFollowups, showStatus, updateStatus, loadDatabase, saveDatabase };
