const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();

pptx.author = 'Airport Transfer Portal';
pptx.title = 'Admin Guide - Airport Transfer Portal';
pptx.subject = 'Complete admin control panel guide';

const colors = {
  primary: 'EF4444',
  secondary: 'F87171',
  dark: '1F2937',
  light: 'F3F4F6',
  white: 'FFFFFF',
  success: '10B981',
  warning: 'F59E0B',
  blue: '3B82F6',
  purple: '8B5CF6',
  teal: '14B8A6'
};

function addHeader(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: colors.primary } });
  slide.addText(title, { x: 0.5, y: 0.2, fontSize: 28, fontFace: 'Arial', color: colors.white, bold: true });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.5, y: 0.6, fontSize: 14, fontFace: 'Arial', color: 'FEE2E2' });
  }
}

// ============================================
// SLIDE 1: Title
// ============================================
let slide1 = pptx.addSlide();
slide1.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide1.addShape('ellipse', { x: -2, y: -2, w: 6, h: 6, fill: { color: colors.primary, transparency: 70 } });
slide1.addShape('ellipse', { x: 7, y: 3, w: 4, h: 4, fill: { color: colors.secondary, transparency: 70 } });

slide1.addText('⚙️', { x: 0, y: 1.5, w: '100%', fontSize: 72, align: 'center' });
slide1.addText('Admin Control Panel', { x: 0.5, y: 2.5, w: '90%', fontSize: 44, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
slide1.addText('Full System Management Guide', { x: 0.5, y: 3.2, w: '90%', fontSize: 20, fontFace: 'Arial', color: colors.secondary, align: 'center' });
slide1.addText('airporttransferportal.com/admin', { x: 0.5, y: 4.5, w: '90%', fontSize: 16, fontFace: 'Arial', color: colors.primary, align: 'center' });

// ============================================
// SLIDE 2: Admin Overview
// ============================================
let slide2 = pptx.addSlide();
addHeader(slide2, '⚙️ Admin Overview', 'What can admins control?');

slide2.addText('The Admin panel provides complete control over the entire Airport Transfer Portal platform.', {
  x: 0.5, y: 1.3, w: 9, fontSize: 12, fontFace: 'Arial', color: '4B5563'
});

// Admin capabilities grid
const capabilities = [
  { icon: '👥', title: 'Users', desc: 'Manage all user accounts' },
  { icon: '✈️', title: 'Airports', desc: 'Configure airports' },
  { icon: '📍', title: 'Zones', desc: 'Set destination zones' },
  { icon: '🛣️', title: 'Routes', desc: 'Link airports to zones' },
  { icon: '🚗', title: 'Suppliers', desc: 'Verify & manage suppliers' },
  { icon: '🏢', title: 'Agencies', desc: 'Manage travel agents' },
  { icon: '📋', title: 'Bookings', desc: 'View all bookings' },
  { icon: '💳', title: 'Payouts', desc: 'Process payments' },
  { icon: '🔧', title: 'Settings', desc: 'System configuration' }
];

capabilities.forEach((cap, idx) => {
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  const x = 0.5 + (col * 3.1);
  const y = 1.8 + (row * 1.1);

  slide2.addShape('rect', { x: x, y: y, w: 2.9, h: 0.95, fill: { color: colors.white }, line: { color: colors.primary, width: 1 } });
  slide2.addText(cap.icon, { x: x + 0.1, y: y + 0.15, fontSize: 18 });
  slide2.addText(cap.title, { x: x + 0.6, y: y + 0.15, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
  slide2.addText(cap.desc, { x: x + 0.6, y: y + 0.5, fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

// ============================================
// SLIDE 3: Dashboard
// ============================================
let slide3 = pptx.addSlide();
addHeader(slide3, 'Admin Dashboard', 'Overview at a glance');

slide3.addText('The dashboard shows key metrics and recent activity:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Stats cards
const stats = [
  { title: 'Today\'s Bookings', value: '24', color: colors.blue },
  { title: 'Active Suppliers', value: '15', color: colors.success },
  { title: 'Pending Payouts', value: '€2,450', color: colors.warning },
  { title: 'Active Agencies', value: '8', color: colors.purple }
];

stats.forEach((stat, idx) => {
  const x = 0.5 + (idx * 2.35);
  slide3.addShape('rect', { x: x, y: 1.7, w: 2.2, h: 1.1, fill: { color: stat.color } });
  slide3.addText(stat.value, { x: x, y: 1.8, w: 2.2, fontSize: 24, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide3.addText(stat.title, { x: x, y: 2.3, w: 2.2, fontSize: 10, fontFace: 'Arial', color: colors.white, align: 'center' });
});

// Recent activity
slide3.addText('Recent Activity:', { x: 0.5, y: 3, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide3.addShape('rect', { x: 0.5, y: 3.3, w: 9, h: 2, fill: { color: colors.light } });

const activities = [
  '• New booking: B1A2B3C4 - IST → Taksim',
  '• Supplier registered: ABC Transfer Co.',
  '• Payout processed: €450 to XYZ Transfers',
  '• Document expiring: Driver license - John Doe',
  '• New agency application: Travel Plus Ltd.'
];

slide3.addText(activities.join('\n'), { x: 0.7, y: 3.4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 4: User Management
// ============================================
let slide4 = pptx.addSlide();
addHeader(slide4, 'User Management', 'Manage all user accounts');

slide4.addText('Create, edit, and manage users across all roles:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// User roles
const userRoles = [
  { role: 'ADMIN', desc: 'Full platform access', color: colors.primary },
  { role: 'DISPATCHER', desc: 'Manage rides & issues', color: colors.teal },
  { role: 'SUPPLIER_OWNER', desc: 'Supplier company owner', color: colors.success },
  { role: 'SUPPLIER_MANAGER', desc: 'Supplier staff', color: colors.success },
  { role: 'DRIVER', desc: 'Perform transfers', color: colors.blue },
  { role: 'AGENCY_OWNER', desc: 'Travel agency owner', color: colors.purple },
  { role: 'AGENCY_MANAGER', desc: 'Agency manager', color: colors.purple },
  { role: 'AGENCY_BOOKER', desc: 'Make bookings only', color: colors.purple }
];

slide4.addShape('rect', { x: 0.5, y: 1.7, w: 9, h: 0.4, fill: { color: colors.primary } });
slide4.addText('Role | Description | Access Level', { x: 0.5, y: 1.7, w: 9, h: 0.4, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

userRoles.forEach((r, idx) => {
  const y = 2.1 + (idx * 0.38);
  slide4.addShape('rect', { x: 0.5, y: y, w: 9, h: 0.38, fill: { color: idx % 2 === 0 ? colors.light : colors.white } });
  slide4.addShape('rect', { x: 0.5, y: y, w: 0.15, h: 0.38, fill: { color: r.color } });
  slide4.addText(r.role, { x: 0.7, y: y + 0.05, fontSize: 10, fontFace: 'Arial', color: colors.dark, bold: true });
  slide4.addText(r.desc, { x: 4, y: y + 0.05, fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

// Actions
slide4.addText('User Actions: Create | Edit | Deactivate | Reset Password | View Activity', { x: 0.5, y: 5.3, fontSize: 11, fontFace: 'Arial', color: colors.primary });

// ============================================
// SLIDE 5: Airports & Zones
// ============================================
let slide5 = pptx.addSlide();
addHeader(slide5, 'Airports & Zones', 'Configure service areas');

// Airports section
slide5.addShape('rect', { x: 0.5, y: 1.3, w: 4.3, h: 2.5, fill: { color: 'EFF6FF' } });
slide5.addText('✈️ Airports', { x: 0.7, y: 1.4, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('Configure airports where transfers operate:\n\n• Airport code (IATA)\n• Full name\n• City & Country\n• Timezone\n• Terminal information\n• Active/Inactive status', { x: 0.7, y: 1.8, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Zones section
slide5.addShape('rect', { x: 5.2, y: 1.3, w: 4.3, h: 2.5, fill: { color: 'ECFDF5' } });
slide5.addText('📍 Zones', { x: 5.4, y: 1.4, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('Define destination zones:\n\n• Zone name (e.g., Taksim)\n• City & Country\n• Description\n• Boundaries/area\n• Active/Inactive status', { x: 5.4, y: 1.8, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Routes section
slide5.addShape('rect', { x: 0.5, y: 4, w: 9, h: 1.3, fill: { color: 'FEF3C7' } });
slide5.addText('🛣️ Routes = Airport ↔ Zone', { x: 0.7, y: 4.1, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('Link airports to zones to create routes. Suppliers then set prices (tariffs) for each route.\nExample: IST Airport → Taksim (Zone) = Route that suppliers can price', { x: 0.7, y: 4.5, w: 8.5, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 6: Supplier Management
// ============================================
let slide6 = pptx.addSlide();
addHeader(slide6, 'Supplier Management', 'Verify and manage transfer companies');

slide6.addText('Suppliers must be verified before they can receive bookings:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Verification flow
const verifySteps = [
  { step: 'Application', desc: 'Supplier registers', color: colors.blue },
  { step: 'Review', desc: 'Check documents', color: colors.warning },
  { step: 'Verify', desc: 'Approve or reject', color: colors.success },
  { step: 'Active', desc: 'Can receive bookings', color: colors.primary }
];

verifySteps.forEach((s, idx) => {
  const x = 0.5 + (idx * 2.35);
  slide6.addShape('rect', { x: x, y: 1.7, w: 2.2, h: 0.9, fill: { color: s.color } });
  slide6.addText(s.step, { x: x, y: 1.8, w: 2.2, fontSize: 12, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide6.addText(s.desc, { x: x, y: 2.15, w: 2.2, fontSize: 10, fontFace: 'Arial', color: colors.white, align: 'center' });
  if (idx < verifySteps.length - 1) {
    slide6.addText('→', { x: x + 2.2, y: 1.9, fontSize: 18, fontFace: 'Arial', color: colors.dark });
  }
});

// Supplier info
slide6.addShape('rect', { x: 0.5, y: 2.8, w: 4.3, h: 2.2, fill: { color: colors.light } });
slide6.addText('📋 Supplier Details', { x: 0.7, y: 2.9, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('• Company name & address\n• Tax ID & registration\n• Contact person\n• Fleet size (vehicles)\n• Driver count\n• Service areas (routes)', { x: 0.7, y: 3.25, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide6.addShape('rect', { x: 5.2, y: 2.8, w: 4.3, h: 2.2, fill: { color: 'FEE2E2' } });
slide6.addText('⚠️ Document Verification', { x: 5.4, y: 2.9, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('Review and approve:\n• Business license\n• Insurance certificates\n• Vehicle documents\n• Driver licenses\n\nReject with reason if issues found', { x: 5.4, y: 3.25, fontSize: 10, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 7: Agency Management
// ============================================
let slide7 = pptx.addSlide();
addHeader(slide7, 'Agency Management', 'Manage B2B travel agent partners');

slide7.addText('Travel agencies book on behalf of their clients using credit:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Agency settings
slide7.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 2.3, fill: { color: 'F5F3FF' } });
slide7.addText('🏢 Agency Configuration', { x: 0.7, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide7.addText('• Set credit limit\n• Configure commission rate\n• Approve/reject applications\n• Generate API keys\n• View booking history\n• Manage team members', { x: 0.7, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide7.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 2.3, fill: { color: colors.light } });
slide7.addText('💳 Credit Management', { x: 5.4, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide7.addText('• View credit usage\n• Adjust credit limit\n• Process credit top-ups\n• Generate invoices\n• Track payments\n• Credit history', { x: 5.4, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Commission example
slide7.addShape('rect', { x: 0.5, y: 4.2, w: 9, h: 1.1, fill: { color: 'ECFDF5' } });
slide7.addText('💰 Commission Example: Booking €100, Agency Rate 15% = Agency earns €15, Platform receives €85', { x: 0.7, y: 4.5, w: 8.5, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 8: Booking Management
// ============================================
let slide8 = pptx.addSlide();
addHeader(slide8, 'Booking Management', 'View and manage all bookings');

slide8.addText('Access all bookings across the platform:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Filters
slide8.addShape('rect', { x: 0.5, y: 1.6, w: 9, h: 0.7, fill: { color: colors.light } });
slide8.addText('🔍 Filters: Status | Date Range | Supplier | Channel | Airport | Customer', { x: 0.7, y: 1.75, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Booking statuses
slide8.addText('Booking Statuses:', { x: 0.5, y: 2.5, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const bookingStatuses = [
  { status: 'PENDING', color: colors.warning },
  { status: 'CONFIRMED', color: colors.blue },
  { status: 'COMPLETED', color: colors.success },
  { status: 'CANCELLED', color: colors.primary }
];

bookingStatuses.forEach((s, idx) => {
  const x = 0.5 + (idx * 2.35);
  slide8.addShape('rect', { x: x, y: 2.8, w: 2.2, h: 0.5, fill: { color: s.color } });
  slide8.addText(s.status, { x: x, y: 2.8, w: 2.2, h: 0.5, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });
});

// Admin actions
slide8.addText('Admin Actions:', { x: 0.5, y: 3.5, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide8.addShape('rect', { x: 0.5, y: 3.8, w: 9, h: 1.5, fill: { color: colors.light } });
slide8.addText('• View complete booking details\n• See customer & supplier information\n• Track ride status\n• Process cancellations & refunds\n• Reassign to different supplier\n• Send notifications to customer/supplier', { x: 0.7, y: 3.9, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 9: Tariffs & Pricing
// ============================================
let slide9 = pptx.addSlide();
addHeader(slide9, 'Tariffs & Pricing', 'Manage supplier pricing');

slide9.addText('Review and approve supplier tariffs:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Tariff flow
slide9.addShape('rect', { x: 0.5, y: 1.7, w: 3, h: 1.8, fill: { color: 'EFF6FF' } });
slide9.addText('1️⃣ Supplier Sets', { x: 0.7, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addText('Supplier creates tariff:\n• Select route\n• Set vehicle type\n• Enter price\n• Add rules', { x: 0.7, y: 2.15, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide9.addShape('rect', { x: 3.7, y: 1.7, w: 3, h: 1.8, fill: { color: 'FEF3C7' } });
slide9.addText('2️⃣ Admin Reviews', { x: 3.9, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addText('Admin checks:\n• Price reasonable?\n• Market rate?\n• Supplier verified?\n• Route exists?', { x: 3.9, y: 2.15, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide9.addShape('rect', { x: 6.9, y: 1.7, w: 2.6, h: 1.8, fill: { color: 'ECFDF5' } });
slide9.addText('3️⃣ Approve', { x: 7.1, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addText('Once approved:\n• Visible to customers\n• Bookable online\n• Active status', { x: 7.1, y: 2.15, fontSize: 10, fontFace: 'Arial', color: colors.dark });

// Platform commission
slide9.addShape('rect', { x: 0.5, y: 3.7, w: 9, h: 1.1, fill: { color: colors.primary } });
slide9.addText('💰 Platform Commission: Configure in Settings (e.g., 10% of each booking)', { x: 0.5, y: 3.7, w: 9, h: 1.1, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 10: Payouts
// ============================================
let slide10 = pptx.addSlide();
addHeader(slide10, 'Payouts', 'Process supplier payments');

slide10.addText('Manage payouts to suppliers for completed transfers:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Payout statuses
const payoutStatuses = [
  { status: 'PENDING', desc: 'Awaiting processing', color: colors.warning },
  { status: 'PROCESSING', desc: 'Being transferred', color: colors.blue },
  { status: 'PAID', desc: 'Successfully paid', color: colors.success },
  { status: 'FAILED', desc: 'Transfer failed', color: colors.primary }
];

payoutStatuses.forEach((p, idx) => {
  const x = 0.5 + (idx * 2.35);
  slide10.addShape('rect', { x: x, y: 1.7, w: 2.2, h: 1, fill: { color: p.color } });
  slide10.addText(p.status, { x: x, y: 1.8, w: 2.2, fontSize: 12, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide10.addText(p.desc, { x: x, y: 2.15, w: 2.2, fontSize: 9, fontFace: 'Arial', color: colors.white, align: 'center' });
});

// Payout process
slide10.addText('Payout Process:', { x: 0.5, y: 2.9, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide10.addShape('rect', { x: 0.5, y: 3.2, w: 9, h: 1.5, fill: { color: colors.light } });
slide10.addText('1. Rides completed → Payout records created (PENDING)\n2. Admin reviews pending payouts\n3. Select payouts to process → Click "Mark as Paid"\n4. Transfer money via bank\n5. Status updates to PAID', { x: 0.7, y: 3.3, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Payout info
slide10.addText('Each payout shows: Supplier | Booking | Amount | Commission | Net Payout | Bank Details', { x: 0.5, y: 4.9, fontSize: 10, fontFace: 'Arial', color: colors.primary });

// ============================================
// SLIDE 11: Dispatch Center
// ============================================
let slide11 = pptx.addSlide();
addHeader(slide11, 'Dispatch Center', 'Monitor live operations');

slide11.addText('Real-time monitoring and issue management:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Dispatch features
const dispatchFeatures = [
  { icon: '📍', title: 'Live Map', desc: 'Track all active rides on map' },
  { icon: '📋', title: 'Ride Queue', desc: 'View today\'s rides by status' },
  { icon: '✈️', title: 'Flight Tracking', desc: 'Monitor flight delays' },
  { icon: '⚠️', title: 'Issues', desc: 'Handle problems in real-time' },
  { icon: '💬', title: 'Messages', desc: 'Communicate with drivers' },
  { icon: '🔔', title: 'Alerts', desc: 'Urgent notifications' }
];

dispatchFeatures.forEach((f, idx) => {
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  const x = 0.5 + (col * 3.1);
  const y = 1.7 + (row * 1.2);

  slide11.addShape('rect', { x: x, y: y, w: 2.9, h: 1, fill: { color: colors.light } });
  slide11.addText(f.icon, { x: x + 0.1, y: y + 0.1, fontSize: 20 });
  slide11.addText(f.title, { x: x + 0.6, y: y + 0.1, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
  slide11.addText(f.desc, { x: x + 0.6, y: y + 0.45, w: 2.2, fontSize: 9, fontFace: 'Arial', color: '6B7280' });
});

// Issue severities
slide11.addText('Issue Severity Levels:', { x: 0.5, y: 4.2, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const severities = [
  { level: 'CRITICAL', color: colors.primary, desc: 'Immediate action' },
  { level: 'HIGH', color: colors.warning, desc: 'Urgent attention' },
  { level: 'MEDIUM', color: colors.blue, desc: 'Review today' },
  { level: 'LOW', color: colors.success, desc: 'When available' }
];

severities.forEach((s, idx) => {
  const x = 0.5 + (idx * 2.35);
  slide11.addShape('rect', { x: x, y: 4.5, w: 2.2, h: 0.7, fill: { color: s.color } });
  slide11.addText(s.level, { x: x, y: 4.55, w: 2.2, fontSize: 10, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide11.addText(s.desc, { x: x, y: 4.8, w: 2.2, fontSize: 8, fontFace: 'Arial', color: colors.white, align: 'center' });
});

// ============================================
// SLIDE 12: System Settings
// ============================================
let slide12 = pptx.addSlide();
addHeader(slide12, 'System Settings', 'Global configuration');

slide12.addText('Configure platform-wide settings:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Settings categories
const settings = [
  { cat: '💰 Payment', items: ['Gateway config', 'Currency', 'Commission %'] },
  { cat: '📧 Notifications', items: ['Email templates', 'SMS settings', 'WhatsApp'] },
  { cat: '🌍 Localization', items: ['Languages', 'Timezones', 'Date format'] },
  { cat: '📋 Booking Rules', items: ['Cancellation policy', 'Lead time', 'Waiting time'] },
  { cat: '🔒 Security', items: ['Password policy', 'Session timeout', 'API limits'] },
  { cat: '📊 Reports', items: ['Export settings', 'Scheduled reports', 'Metrics'] }
];

settings.forEach((s, idx) => {
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  const x = 0.5 + (col * 3.1);
  const y = 1.7 + (row * 1.6);

  slide12.addShape('rect', { x: x, y: y, w: 2.9, h: 1.4, fill: { color: colors.light } });
  slide12.addText(s.cat, { x: x + 0.1, y: y + 0.1, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
  slide12.addText(s.items.map(i => '• ' + i).join('\n'), { x: x + 0.1, y: y + 0.45, fontSize: 9, fontFace: 'Arial', color: '6B7280' });
});

// ============================================
// SLIDE 13: Reports & Analytics
// ============================================
let slide13 = pptx.addSlide();
addHeader(slide13, 'Reports & Analytics', 'Data insights');

slide13.addText('Access comprehensive reports and analytics:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

const reports = [
  { icon: '📈', title: 'Revenue Report', desc: 'Daily/weekly/monthly earnings' },
  { icon: '📋', title: 'Booking Report', desc: 'Booking trends & statistics' },
  { icon: '🚗', title: 'Supplier Report', desc: 'Performance by supplier' },
  { icon: '🏢', title: 'Agency Report', desc: 'Credit usage & bookings' },
  { icon: '⭐', title: 'Rating Report', desc: 'Customer satisfaction' },
  { icon: '📍', title: 'Route Report', desc: 'Popular routes & pricing' }
];

reports.forEach((r, idx) => {
  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const x = 0.5 + (col * 4.7);
  const y = 1.7 + (row * 0.9);

  slide13.addShape('rect', { x: x, y: y, w: 4.5, h: 0.8, fill: { color: colors.light } });
  slide13.addText(r.icon, { x: x + 0.1, y: y + 0.15, fontSize: 20 });
  slide13.addText(r.title, { x: x + 0.7, y: y + 0.1, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
  slide13.addText(r.desc, { x: x + 0.7, y: y + 0.4, fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

// Export options
slide13.addShape('rect', { x: 0.5, y: 4.5, w: 9, h: 0.8, fill: { color: colors.primary } });
slide13.addText('📥 Export Options: CSV | Excel | PDF | API', { x: 0.5, y: 4.5, w: 9, h: 0.8, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 14: Summary
// ============================================
let slide14 = pptx.addSlide();
slide14.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide14.addShape('ellipse', { x: 7, y: -1, w: 4, h: 4, fill: { color: colors.primary, transparency: 80 } });

slide14.addText('Admin Control Summary', { x: 0.5, y: 0.7, w: '90%', fontSize: 32, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });

const summary = [
  { icon: '👥', text: 'Manage users & roles' },
  { icon: '✈️', text: 'Configure airports & zones' },
  { icon: '🚗', text: 'Verify suppliers' },
  { icon: '🏢', text: 'Manage agencies & credit' },
  { icon: '📋', text: 'Monitor all bookings' },
  { icon: '💳', text: 'Process payouts' },
  { icon: '📍', text: 'Dispatch & live tracking' },
  { icon: '⚙️', text: 'System settings' },
  { icon: '📊', text: 'Reports & analytics' }
];

summary.forEach((item, idx) => {
  const col = idx < 5 ? 0 : 1;
  const row = idx < 5 ? idx : idx - 5;
  slide14.addText(`${item.icon}  ${item.text}`, { x: 1.2 + (col * 4.5), y: 1.4 + (row * 0.55), fontSize: 14, fontFace: 'Arial', color: colors.white });
});

slide14.addText('⚙️ airporttransferportal.com/admin', { x: 0.5, y: 5.2, w: '90%', fontSize: 18, fontFace: 'Arial', color: colors.primary, align: 'center' });

// Save
const outputPath = path.join(__dirname, '..', 'docs', 'Admin-User-Guide.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log(`✅ Admin PPT saved to: ${outputPath}`))
  .catch(err => console.error('Error:', err));
