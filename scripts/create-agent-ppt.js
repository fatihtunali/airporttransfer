const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();

pptx.author = 'Airport Transfer Portal';
pptx.title = 'Travel Agent Guide - Airport Transfer Portal';
pptx.subject = 'Complete agent booking and management process';

const colors = {
  primary: '8B5CF6',
  secondary: 'A78BFA',
  dark: '1F2937',
  light: 'F3F4F6',
  white: 'FFFFFF',
  success: '10B981',
  warning: 'F59E0B',
  blue: '3B82F6'
};

function addHeader(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: colors.primary } });
  slide.addText(title, { x: 0.5, y: 0.2, fontSize: 28, fontFace: 'Arial', color: colors.white, bold: true });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.5, y: 0.6, fontSize: 14, fontFace: 'Arial', color: 'E9D5FF' });
  }
}

// ============================================
// SLIDE 1: Title
// ============================================
let slide1 = pptx.addSlide();
slide1.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide1.addShape('ellipse', { x: -2, y: -2, w: 6, h: 6, fill: { color: colors.primary, transparency: 70 } });
slide1.addShape('ellipse', { x: 7, y: 3, w: 4, h: 4, fill: { color: colors.secondary, transparency: 70 } });

slide1.addText('🏢', { x: 0, y: 1.5, w: '100%', fontSize: 72, align: 'center' });
slide1.addText('Travel Agent Guide', { x: 0.5, y: 2.5, w: '90%', fontSize: 44, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
slide1.addText('B2B Partner Portal & API Integration', { x: 0.5, y: 3.2, w: '90%', fontSize: 20, fontFace: 'Arial', color: colors.secondary, align: 'center' });
slide1.addText('airporttransferportal.com/agency', { x: 0.5, y: 4.5, w: '90%', fontSize: 16, fontFace: 'Arial', color: colors.primary, align: 'center' });

// ============================================
// SLIDE 2: Agent Overview
// ============================================
let slide2 = pptx.addSlide();
addHeader(slide2, '🏢 Agent Overview', 'What is the Agent Portal?');

slide2.addText('The Agent Portal is designed for travel agencies and tour operators who book transfers on behalf of their clients.', {
  x: 0.5, y: 1.3, w: 9, fontSize: 12, fontFace: 'Arial', color: '4B5563'
});

slide2.addShape('rect', { x: 0.5, y: 1.8, w: 4.3, h: 2.5, fill: { color: 'F5F3FF' } });
slide2.addText('✨ Key Benefits', { x: 0.7, y: 1.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
const benefits = ['Credit-based booking (pay later)', 'Discounted B2B pricing', 'Dedicated dashboard', 'Team member access', 'API for system integration', 'White-label widget option', 'Monthly invoicing'];
slide2.addText(benefits.map(i => '• ' + i).join('\n'), { x: 0.7, y: 2.3, w: 4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide2.addShape('rect', { x: 5.2, y: 1.8, w: 4.3, h: 2.5, fill: { color: colors.light } });
slide2.addText('👥 User Roles', { x: 5.4, y: 1.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
const roles = [
  { role: 'Agency Owner', desc: 'Full access, billing, settings' },
  { role: 'Agency Manager', desc: 'Bookings, team, reports' },
  { role: 'Agency Booker', desc: 'Create & manage bookings' }
];
roles.forEach((r, idx) => {
  slide2.addText(`${r.role}:`, { x: 5.4, y: 2.3 + (idx * 0.6), fontSize: 11, fontFace: 'Arial', color: colors.primary, bold: true });
  slide2.addText(r.desc, { x: 5.4, y: 2.5 + (idx * 0.6), fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

slide2.addShape('rect', { x: 0.5, y: 4.5, w: 9, h: 0.8, fill: { color: colors.primary } });
slide2.addText('🔗 Agent Portal: airporttransferportal.com/agency/login', { x: 0.5, y: 4.5, w: 9, h: 0.8, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 3: Registration Process
// ============================================
let slide3 = pptx.addSlide();
addHeader(slide3, 'Step 1: Register Your Agency', 'Create your B2B partner account');

const regSteps = [
  { num: '1', title: 'Go to Registration', desc: 'Visit airporttransferportal.com/agency/register' },
  { num: '2', title: 'Company Information', desc: 'Enter company name, address, tax ID' },
  { num: '3', title: 'Contact Details', desc: 'Primary contact name, email, phone' },
  { num: '4', title: 'Upload Documents', desc: 'Business license, tax certificate' },
  { num: '5', title: 'Submit for Review', desc: 'Admin reviews and approves' },
  { num: '6', title: 'Account Activated', desc: 'Receive login credentials & API key' }
];

regSteps.forEach((step, idx) => {
  const y = 1.3 + (idx * 0.7);
  slide3.addShape('ellipse', { x: 0.5, y: y, w: 0.5, h: 0.5, fill: { color: colors.primary } });
  slide3.addText(step.num, { x: 0.5, y: y, w: 0.5, h: 0.5, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });
  slide3.addText(step.title, { x: 1.2, y: y + 0.05, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
  slide3.addText(step.desc, { x: 1.2, y: y + 0.3, fontSize: 11, fontFace: 'Arial', color: '6B7280' });
});

slide3.addShape('rect', { x: 6, y: 1.3, w: 3.5, h: 3, fill: { color: 'FEF3C7' } });
slide3.addText('📄 Required Documents', { x: 6.2, y: 1.4, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide3.addText('• Business registration\n• Tax certificate\n• Company letterhead\n• Authorized signatory ID', { x: 6.2, y: 1.8, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide3.addText('⏱️ Approval Time: 1-2 business days', { x: 6.2, y: 3.5, fontSize: 10, fontFace: 'Arial', color: colors.primary, italic: true });

// ============================================
// SLIDE 4: Dashboard Overview
// ============================================
let slide4 = pptx.addSlide();
addHeader(slide4, 'Agent Dashboard', 'Your control center');

const dashboardItems = [
  { icon: '📊', title: 'Overview', desc: 'Today\'s bookings, pending, completed', x: 0.5, y: 1.3 },
  { icon: '💳', title: 'Credit Balance', desc: 'Available credit, usage, top-up', x: 3.5, y: 1.3 },
  { icon: '📋', title: 'Recent Bookings', desc: 'Latest bookings with status', x: 6.5, y: 1.3 },
  { icon: '📈', title: 'Statistics', desc: 'Monthly revenue, booking count', x: 0.5, y: 2.7 },
  { icon: '🔔', title: 'Notifications', desc: 'Alerts, reminders, updates', x: 3.5, y: 2.7 },
  { icon: '⚡', title: 'Quick Actions', desc: 'New booking, search, reports', x: 6.5, y: 2.7 }
];

dashboardItems.forEach(item => {
  slide4.addShape('rect', { x: item.x, y: item.y, w: 2.8, h: 1.2, fill: { color: colors.white }, line: { color: 'E5E7EB', width: 1 } });
  slide4.addText(item.icon, { x: item.x, y: item.y + 0.1, w: 2.8, fontSize: 24, align: 'center' });
  slide4.addText(item.title, { x: item.x + 0.1, y: item.y + 0.65, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
  slide4.addText(item.desc, { x: item.x + 0.1, y: item.y + 0.9, w: 2.6, fontSize: 9, fontFace: 'Arial', color: '6B7280' });
});

slide4.addShape('rect', { x: 0.5, y: 4.1, w: 9, h: 1.2, fill: { color: 'F5F3FF' } });
slide4.addText('🖥️ Dashboard Features', { x: 0.7, y: 4.2, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide4.addText('• Real-time booking updates  • Export reports to CSV  • Filter by date/status  • Search bookings  • Manage team members', { x: 0.7, y: 4.55, w: 8.5, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 5: Credit System
// ============================================
let slide5 = pptx.addSlide();
addHeader(slide5, 'Credit System', 'Book now, pay later');

slide5.addText('The credit system allows agencies to book transfers without immediate payment.', {
  x: 0.5, y: 1.3, w: 9, fontSize: 12, fontFace: 'Arial', color: '4B5563'
});

slide5.addShape('rect', { x: 0.5, y: 1.8, w: 4.3, h: 2, fill: { color: 'ECFDF5' } });
slide5.addText('💰 How Credit Works', { x: 0.7, y: 1.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('1. Admin assigns credit limit\n2. Each booking deducts from credit\n3. Pay invoices monthly\n4. Credit refilled after payment', { x: 0.7, y: 2.3, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide5.addShape('rect', { x: 5.2, y: 1.8, w: 4.3, h: 2, fill: { color: 'EFF6FF' } });
slide5.addText('📊 Credit Dashboard Shows', { x: 5.4, y: 1.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('• Total credit limit\n• Available balance\n• Used this month\n• Pending invoices', { x: 5.4, y: 2.3, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Credit flow diagram
slide5.addText('Credit Flow:', { x: 0.5, y: 4, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const flow = ['Credit Assigned', 'Booking Made', 'Credit Deducted', 'Monthly Invoice', 'Payment Made', 'Credit Restored'];
flow.forEach((item, idx) => {
  const x = 0.5 + (idx * 1.55);
  slide5.addShape('rect', { x: x, y: 4.35, w: 1.45, h: 0.7, fill: { color: colors.primary } });
  slide5.addText(item, { x: x, y: 4.35, w: 1.45, h: 0.7, fontSize: 9, fontFace: 'Arial', color: colors.white, align: 'center', valign: 'middle' });
  if (idx < flow.length - 1) {
    slide5.addText('→', { x: x + 1.45, y: 4.5, fontSize: 14, fontFace: 'Arial', color: colors.dark });
  }
});

// ============================================
// SLIDE 6: Making a Booking
// ============================================
let slide6 = pptx.addSlide();
addHeader(slide6, 'Making a Booking', 'Book transfers for your clients');

const bookingSteps = [
  { num: '1', title: 'Click "New Booking"', desc: 'From dashboard or sidebar' },
  { num: '2', title: 'Search Transfer', desc: 'Select airport, zone, date, time' },
  { num: '3', title: 'Choose Vehicle', desc: 'Select from available options' },
  { num: '4', title: 'Enter Client Details', desc: 'Passenger name, email, phone' },
  { num: '5', title: 'Add Agency Reference', desc: 'Your internal booking ID' },
  { num: '6', title: 'Confirm Booking', desc: 'Deducted from credit, instant confirmation' }
];

bookingSteps.forEach((step, idx) => {
  const col = idx < 3 ? 0 : 1;
  const row = idx % 3;
  const x = 0.5 + (col * 4.7);
  const y = 1.3 + (row * 1);

  slide6.addShape('rect', { x: x, y: y, w: 4.5, h: 0.9, fill: { color: idx % 2 === 0 ? 'F5F3FF' : colors.light } });
  slide6.addShape('ellipse', { x: x + 0.1, y: y + 0.2, w: 0.5, h: 0.5, fill: { color: colors.primary } });
  slide6.addText(step.num, { x: x + 0.1, y: y + 0.2, w: 0.5, h: 0.5, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });
  slide6.addText(step.title, { x: x + 0.75, y: y + 0.15, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
  slide6.addText(step.desc, { x: x + 0.75, y: y + 0.45, fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

slide6.addShape('rect', { x: 0.5, y: 4.4, w: 9, h: 1, fill: { color: colors.success } });
slide6.addText('✅ Booking confirmed instantly! Client receives email confirmation.', { x: 0.5, y: 4.4, w: 9, h: 1, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 7: Managing Bookings
// ============================================
let slide7 = pptx.addSlide();
addHeader(slide7, 'Managing Bookings', 'View and manage all your bookings');

slide7.addText('The Bookings page shows all transfers booked by your agency:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Filters
slide7.addShape('rect', { x: 0.5, y: 1.7, w: 9, h: 0.8, fill: { color: colors.light } });
slide7.addText('🔍 Filter by: Status | Date Range | Client Name | Agency Reference | Booking Code', { x: 0.7, y: 1.85, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Table header
slide7.addShape('rect', { x: 0.5, y: 2.6, w: 9, h: 0.5, fill: { color: colors.primary } });
slide7.addText('Booking Code | Client | Date | Route | Status | Price | Actions', { x: 0.5, y: 2.6, w: 9, h: 0.5, fontSize: 10, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// Sample rows
for (let i = 0; i < 3; i++) {
  slide7.addShape('rect', { x: 0.5, y: 3.1 + (i * 0.45), w: 9, h: 0.45, fill: { color: i % 2 === 0 ? colors.white : colors.light } });
}

// Actions available
slide7.addText('Available Actions:', { x: 0.5, y: 4.5, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const actions = [
  { action: 'View Details', color: colors.blue },
  { action: 'Edit Booking', color: colors.primary },
  { action: 'Cancel', color: 'EF4444' },
  { action: 'Resend Email', color: colors.success },
  { action: 'Download Voucher', color: '6B7280' }
];
actions.forEach((a, idx) => {
  slide7.addShape('rect', { x: 0.5 + (idx * 1.8), y: 4.85, w: 1.7, h: 0.45, fill: { color: a.color } });
  slide7.addText(a.action, { x: 0.5 + (idx * 1.8), y: 4.85, w: 1.7, h: 0.45, fontSize: 9, fontFace: 'Arial', color: colors.white, align: 'center', valign: 'middle' });
});

// ============================================
// SLIDE 8: Team Management
// ============================================
let slide8 = pptx.addSlide();
addHeader(slide8, 'Team Management', 'Add and manage team members');

slide8.addText('Agency owners and managers can add team members with different access levels:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Roles table
const teamRoles = [
  { role: 'Owner', booking: '✅', team: '✅', billing: '✅', settings: '✅', api: '✅' },
  { role: 'Manager', booking: '✅', team: '✅', billing: '❌', settings: '✅', api: '❌' },
  { role: 'Booker', booking: '✅', team: '❌', billing: '❌', settings: '❌', api: '❌' }
];

slide8.addShape('rect', { x: 0.5, y: 1.8, w: 9, h: 0.5, fill: { color: colors.primary } });
slide8.addText('Role | Bookings | Team Mgmt | Billing | Settings | API Access', { x: 0.5, y: 1.8, w: 9, h: 0.5, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

teamRoles.forEach((r, idx) => {
  const y = 2.3 + (idx * 0.5);
  slide8.addShape('rect', { x: 0.5, y: y, w: 9, h: 0.5, fill: { color: idx % 2 === 0 ? colors.light : colors.white } });
  slide8.addText(`${r.role} | ${r.booking} | ${r.team} | ${r.billing} | ${r.settings} | ${r.api}`, { x: 0.5, y: y, w: 9, h: 0.5, fontSize: 11, fontFace: 'Arial', color: colors.dark, align: 'center', valign: 'middle' });
});

// Add member flow
slide8.addText('Adding a Team Member:', { x: 0.5, y: 4, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide8.addShape('rect', { x: 0.5, y: 4.35, w: 9, h: 1, fill: { color: 'F5F3FF' } });
slide8.addText('1. Go to Team page → 2. Click "Add Member" → 3. Enter email → 4. Select role → 5. Send invite → 6. Member activates account', { x: 0.7, y: 4.6, w: 8.5, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 9: API Integration
// ============================================
let slide9 = pptx.addSlide();
addHeader(slide9, 'API Integration', 'Connect your booking system');

slide9.addText('Integrate Airport Transfer Portal with your existing booking system using our REST API.', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

slide9.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 2.5, fill: { color: colors.light } });
slide9.addText('🔑 Getting API Access', { x: 0.7, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addText('1. Go to API Keys page\n2. Generate new API key\n3. Copy key securely\n4. Set in your system headers\n\nHeader: X-API-Key: your_key', { x: 0.7, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide9.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 2.5, fill: { color: 'EFF6FF' } });
slide9.addText('📡 Available Endpoints', { x: 5.4, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
const endpoints = [
  'GET /api/v1/search',
  'GET /api/v1/quote',
  'POST /api/v1/booking',
  'GET /api/v1/booking/{id}',
  'POST /api/v1/booking/{id}/cancel'
];
slide9.addText(endpoints.join('\n'), { x: 5.4, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.primary, fontFace: 'Courier New' });

slide9.addShape('rect', { x: 0.5, y: 4.4, w: 9, h: 0.9, fill: { color: colors.primary } });
slide9.addText('📚 Full API documentation: airporttransferportal.com/api-docs', { x: 0.5, y: 4.4, w: 9, h: 0.9, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 10: Invoices & Billing
// ============================================
let slide10 = pptx.addSlide();
addHeader(slide10, 'Invoices & Billing', 'Monthly invoicing and payment');

slide10.addText('All bookings are compiled into a monthly invoice:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Invoice timeline
const invoiceFlow = [
  { month: 'During Month', desc: 'Book transfers using credit' },
  { month: '1st of Month', desc: 'Invoice generated' },
  { month: 'Within 15 Days', desc: 'Payment due' },
  { month: 'After Payment', desc: 'Credit restored' }
];

invoiceFlow.forEach((item, idx) => {
  const x = 0.5 + (idx * 2.3);
  slide10.addShape('rect', { x: x, y: 1.7, w: 2.2, h: 1.2, fill: { color: colors.primary } });
  slide10.addText(item.month, { x: x, y: 1.8, w: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide10.addText(item.desc, { x: x, y: 2.15, w: 2.2, fontSize: 10, fontFace: 'Arial', color: 'E9D5FF', align: 'center' });
});

// Invoice details
slide10.addShape('rect', { x: 0.5, y: 3.1, w: 4.3, h: 1.8, fill: { color: colors.light } });
slide10.addText('📄 Invoice Contains', { x: 0.7, y: 3.2, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide10.addText('• All bookings for the period\n• Individual booking prices\n• Total amount due\n• Commission breakdown\n• Payment details', { x: 0.7, y: 3.55, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide10.addShape('rect', { x: 5.2, y: 3.1, w: 4.3, h: 1.8, fill: { color: 'ECFDF5' } });
slide10.addText('💳 Payment Methods', { x: 5.4, y: 3.2, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide10.addText('• Bank transfer (IBAN)\n• Credit card\n• PayPal\n• Wire transfer', { x: 5.4, y: 3.55, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 11: White-label Widget
// ============================================
let slide11 = pptx.addSlide();
addHeader(slide11, 'White-label Widget', 'Embed booking on your website');

slide11.addText('Add a transfer booking widget to your own website:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

slide11.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 2.5, fill: { color: colors.light } });
slide11.addText('🎨 Widget Features', { x: 0.7, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('• Customizable colors\n• Your logo\n• Responsive design\n• Seamless booking flow\n• Automatic credit deduction\n• Client receives your branding', { x: 0.7, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide11.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 2.5, fill: { color: 'F5F3FF' } });
slide11.addText('📝 Setup Steps', { x: 5.4, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('1. Go to White-label settings\n2. Upload your logo\n3. Set brand colors\n4. Copy embed code\n5. Paste on your website\n6. Test the widget', { x: 5.4, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Code example
slide11.addShape('rect', { x: 0.5, y: 4.4, w: 9, h: 0.9, fill: { color: colors.dark } });
slide11.addText('<script src="https://airporttransferportal.com/widget.js" data-agency="YOUR_ID"></script>', { x: 0.7, y: 4.6, fontSize: 10, fontFace: 'Courier New', color: colors.success });

// ============================================
// SLIDE 12: Summary
// ============================================
let slide12 = pptx.addSlide();
slide12.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide12.addShape('ellipse', { x: 7, y: -1, w: 4, h: 4, fill: { color: colors.primary, transparency: 80 } });

slide12.addText('Agent Portal Summary', { x: 0.5, y: 1, w: '90%', fontSize: 32, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });

const summary = [
  { icon: '📝', text: 'Register and get verified' },
  { icon: '💳', text: 'Use credit to book instantly' },
  { icon: '📋', text: 'Manage all bookings in dashboard' },
  { icon: '👥', text: 'Add team members with roles' },
  { icon: '🔗', text: 'Integrate via API' },
  { icon: '📄', text: 'Pay monthly invoices' }
];

summary.forEach((item, idx) => {
  slide12.addText(`${item.icon}  ${item.text}`, { x: 2.5, y: 1.8 + (idx * 0.55), fontSize: 16, fontFace: 'Arial', color: colors.white });
});

slide12.addText('🏢 airporttransferportal.com/agency', { x: 0.5, y: 5.2, w: '90%', fontSize: 18, fontFace: 'Arial', color: colors.primary, align: 'center' });

// Save
const outputPath = path.join(__dirname, '..', 'docs', 'Agent-User-Guide.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log(`✅ Agent PPT saved to: ${outputPath}`))
  .catch(err => console.error('Error:', err));
