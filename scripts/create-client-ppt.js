const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();

pptx.author = 'Airport Transfer Portal';
pptx.title = 'Client User Guide - Airport Transfer Portal';
pptx.subject = 'Complete client booking process';

const colors = {
  primary: '3B82F6',
  secondary: '06B6D4',
  dark: '1F2937',
  light: 'F3F4F6',
  white: 'FFFFFF',
  success: '10B981',
  warning: 'F59E0B',
  accent: '8B5CF6'
};

// Helper function for header
function addHeader(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: colors.primary } });
  slide.addText(title, { x: 0.5, y: 0.2, fontSize: 28, fontFace: 'Arial', color: colors.white, bold: true });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.5, y: 0.6, fontSize: 14, fontFace: 'Arial', color: 'BFDBFE' });
  }
}

// ============================================
// SLIDE 1: Title
// ============================================
let slide1 = pptx.addSlide();
slide1.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide1.addShape('ellipse', { x: -2, y: -2, w: 6, h: 6, fill: { color: colors.primary, transparency: 70 } });
slide1.addShape('ellipse', { x: 7, y: 3, w: 4, h: 4, fill: { color: colors.secondary, transparency: 70 } });

slide1.addText('👤', { x: 0, y: 1.5, w: '100%', fontSize: 72, align: 'center' });
slide1.addText('Client User Guide', { x: 0.5, y: 2.5, w: '90%', fontSize: 44, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
slide1.addText('How to Book Airport Transfers', { x: 0.5, y: 3.2, w: '90%', fontSize: 20, fontFace: 'Arial', color: colors.secondary, align: 'center' });
slide1.addText('airporttransferportal.com', { x: 0.5, y: 4.5, w: '90%', fontSize: 16, fontFace: 'Arial', color: colors.primary, align: 'center' });

// ============================================
// SLIDE 2: Client Overview
// ============================================
let slide2 = pptx.addSlide();
addHeader(slide2, '👤 Client Overview', 'Who are the clients and what can they do?');

slide2.addText('What is a Client?', { x: 0.5, y: 1.3, fontSize: 18, fontFace: 'Arial', color: colors.dark, bold: true });
slide2.addText('A client is any person who needs airport transfer services. Clients can book transfers directly through the website without registration.', {
  x: 0.5, y: 1.7, w: 9, fontSize: 12, fontFace: 'Arial', color: '4B5563'
});

slide2.addShape('rect', { x: 0.5, y: 2.3, w: 4.3, h: 2.8, fill: { color: colors.light } });
slide2.addText('✅ What Clients Can Do', { x: 0.7, y: 2.4, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
const canDo = ['Search available transfers', 'Compare prices & vehicles', 'Book without registration', 'Pay online or later', 'Track driver location', 'Manage existing bookings', 'Cancel bookings', 'Leave reviews'];
slide2.addText(canDo.map(i => '• ' + i).join('\n'), { x: 0.7, y: 2.8, w: 4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide2.addShape('rect', { x: 5.2, y: 2.3, w: 4.3, h: 2.8, fill: { color: 'FEF3C7' } });
slide2.addText('📱 Access Methods', { x: 5.4, y: 2.4, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
const access = ['Desktop website', 'Mobile responsive site', 'Booking confirmation email', 'SMS notifications', 'WhatsApp updates', 'Driver tracking page'];
slide2.addText(access.map(i => '• ' + i).join('\n'), { x: 5.4, y: 2.8, w: 4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 3: Step 1 - Search
// ============================================
let slide3 = pptx.addSlide();
addHeader(slide3, 'Step 1: Search for Transfer', 'Find available transfers for your journey');

slide3.addShape('rect', { x: 0.5, y: 1.3, w: 9, h: 0.5, fill: { color: colors.primary } });
slide3.addText('🔍 SEARCH', { x: 0.5, y: 1.3, w: 9, h: 0.5, fontSize: 16, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

slide3.addText('Go to airporttransferportal.com and fill in the search form:', { x: 0.5, y: 2, fontSize: 12, fontFace: 'Arial', color: colors.dark });

const searchFields = [
  { field: 'Pick-up Location', desc: 'Select the airport (e.g., IST - Istanbul Airport)', icon: '✈️' },
  { field: 'Drop-off Location', desc: 'Select destination zone (e.g., Taksim, Sultanahmet)', icon: '📍' },
  { field: 'Date', desc: 'Choose your travel date', icon: '📅' },
  { field: 'Time', desc: 'Select pickup time', icon: '⏰' },
  { field: 'Passengers', desc: 'Number of travelers (affects vehicle options)', icon: '👥' }
];

searchFields.forEach((item, idx) => {
  const y = 2.4 + (idx * 0.55);
  slide3.addShape('rect', { x: 0.5, y: y, w: 9, h: 0.5, fill: { color: idx % 2 === 0 ? colors.light : colors.white } });
  slide3.addText(item.icon, { x: 0.6, y: y + 0.05, fontSize: 14 });
  slide3.addText(item.field, { x: 1.1, y: y + 0.1, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
  slide3.addText(item.desc, { x: 3.5, y: y + 0.1, fontSize: 11, fontFace: 'Arial', color: '6B7280' });
});

slide3.addShape('rect', { x: 0.5, y: 5, w: 9, h: 0.5, fill: { color: colors.success } });
slide3.addText('Click "Search Transfers" to see available options →', { x: 0.5, y: 5, w: 9, h: 0.5, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 4: Step 2 - Compare Results
// ============================================
let slide4 = pptx.addSlide();
addHeader(slide4, 'Step 2: Compare Results', 'Choose the best option for your needs');

slide4.addShape('rect', { x: 0.5, y: 1.3, w: 9, h: 0.5, fill: { color: colors.secondary } });
slide4.addText('📋 COMPARE OPTIONS', { x: 0.5, y: 1.3, w: 9, h: 0.5, fontSize: 16, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

slide4.addText('Search results show available vehicles from different suppliers:', { x: 0.5, y: 2, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Sample vehicle cards
const vehicles = [
  { type: 'SEDAN', pax: '1-3', luggage: '3', price: '€45', icon: '🚗' },
  { type: 'VAN', pax: '1-7', luggage: '7', price: '€65', icon: '🚐' },
  { type: 'MINIBUS', pax: '8-16', luggage: '16', price: '€95', icon: '🚌' }
];

vehicles.forEach((v, idx) => {
  const x = 0.5 + (idx * 3.1);
  slide4.addShape('rect', { x: x, y: 2.4, w: 2.9, h: 2, fill: { color: colors.white }, line: { color: 'E5E7EB', width: 1 } });
  slide4.addText(v.icon, { x: x, y: 2.5, w: 2.9, fontSize: 28, align: 'center' });
  slide4.addText(v.type, { x: x, y: 3, w: 2.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true, align: 'center' });
  slide4.addText(`👥 ${v.pax}  🧳 ${v.luggage}`, { x: x, y: 3.4, w: 2.9, fontSize: 11, fontFace: 'Arial', color: '6B7280', align: 'center' });
  slide4.addText(v.price, { x: x, y: 3.8, w: 2.9, fontSize: 18, fontFace: 'Arial', color: colors.primary, bold: true, align: 'center' });
});

slide4.addText('Each result shows:', { x: 0.5, y: 4.6, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const resultInfo = ['Vehicle type & photo', 'Passenger capacity', 'Luggage capacity', 'Supplier name & rating', 'Total price', 'Included features (Meet & Greet, Flight Tracking, etc.)'];
slide4.addText(resultInfo.map(i => '• ' + i).join('     '), { x: 0.5, y: 4.95, w: 9, fontSize: 10, fontFace: 'Arial', color: '6B7280' });

// ============================================
// SLIDE 5: Step 3 - Enter Details
// ============================================
let slide5 = pptx.addSlide();
addHeader(slide5, 'Step 3: Enter Passenger Details', 'Provide your information for the booking');

slide5.addShape('rect', { x: 0.5, y: 1.3, w: 9, h: 0.5, fill: { color: colors.accent } });
slide5.addText('📝 PASSENGER DETAILS', { x: 0.5, y: 1.3, w: 9, h: 0.5, fontSize: 16, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

const passengerFields = [
  { field: 'First Name *', desc: 'Lead passenger first name', required: true },
  { field: 'Last Name *', desc: 'Lead passenger last name', required: true },
  { field: 'Email *', desc: 'For booking confirmation', required: true },
  { field: 'Phone *', desc: 'Driver will contact you here', required: true },
  { field: 'Flight Number', desc: 'For flight tracking (optional)', required: false },
  { field: 'Drop-off Address', desc: 'Hotel name or full address', required: false },
  { field: 'Special Requests', desc: 'Child seat, wheelchair, etc.', required: false }
];

passengerFields.forEach((item, idx) => {
  const y = 1.95 + (idx * 0.45);
  slide5.addShape('rect', { x: 0.5, y: y, w: 9, h: 0.42, fill: { color: item.required ? 'EFF6FF' : colors.light } });
  slide5.addText(item.field, { x: 0.7, y: y + 0.08, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
  slide5.addText(item.desc, { x: 3.5, y: y + 0.08, fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

slide5.addText('* Required fields', { x: 0.5, y: 5.2, fontSize: 10, fontFace: 'Arial', color: colors.primary, italic: true });

// ============================================
// SLIDE 6: Step 4 - Payment Options
// ============================================
let slide6 = pptx.addSlide();
addHeader(slide6, 'Step 4: Choose Payment Method', 'Select how you want to pay');

slide6.addShape('rect', { x: 0.5, y: 1.3, w: 9, h: 0.5, fill: { color: colors.success } });
slide6.addText('💳 PAYMENT OPTIONS', { x: 0.5, y: 1.3, w: 9, h: 0.5, fontSize: 16, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

// Payment option 1
slide6.addShape('rect', { x: 0.5, y: 2, w: 9, h: 1.2, fill: { color: 'ECFDF5' }, line: { color: colors.success, width: 2 } });
slide6.addText('💵 Pay Later (Most Popular)', { x: 0.7, y: 2.1, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('No payment required now. Pay the driver directly in cash or card upon arrival.\nPerfect if you want flexibility or prefer to pay after your flight.', { x: 0.7, y: 2.5, w: 8.5, fontSize: 11, fontFace: 'Arial', color: '4B5563' });

// Payment option 2
slide6.addShape('rect', { x: 0.5, y: 3.3, w: 9, h: 1.2, fill: { color: 'EFF6FF' }, line: { color: colors.primary, width: 2 } });
slide6.addText('💳 Credit/Debit Card', { x: 0.7, y: 3.4, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('Pay securely online with Visa, Mastercard, or American Express.\nYou\'ll be redirected to our secure payment gateway.', { x: 0.7, y: 3.8, w: 8.5, fontSize: 11, fontFace: 'Arial', color: '4B5563' });

// Payment option 3
slide6.addShape('rect', { x: 0.5, y: 4.6, w: 9, h: 1.2, fill: { color: 'F5F3FF' }, line: { color: colors.accent, width: 2 } });
slide6.addText('🏦 Bank Transfer', { x: 0.7, y: 4.7, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('Pay via bank transfer before your trip.\nBank details will be provided after booking confirmation.', { x: 0.7, y: 5.1, w: 8.5, fontSize: 11, fontFace: 'Arial', color: '4B5563' });

// ============================================
// SLIDE 7: Step 5 - Confirmation
// ============================================
let slide7 = pptx.addSlide();
addHeader(slide7, 'Step 5: Booking Confirmation', 'Your booking is confirmed!');

slide7.addShape('rect', { x: 2.5, y: 1.4, w: 5, h: 2.5, fill: { color: colors.white }, line: { color: colors.success, width: 2 } });
slide7.addText('✅', { x: 2.5, y: 1.5, w: 5, fontSize: 40, align: 'center' });
slide7.addText('Booking Confirmed!', { x: 2.5, y: 2.2, w: 5, fontSize: 18, fontFace: 'Arial', color: colors.dark, bold: true, align: 'center' });
slide7.addText('Your Reference: B1A2B3C4', { x: 2.5, y: 2.7, w: 5, fontSize: 14, fontFace: 'Arial', color: colors.primary, bold: true, align: 'center' });
slide7.addText('Save this code!', { x: 2.5, y: 3.1, w: 5, fontSize: 11, fontFace: 'Arial', color: '6B7280', align: 'center' });

slide7.addText('What happens next:', { x: 0.5, y: 4.1, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });

const nextSteps = [
  { icon: '📧', text: 'Confirmation email sent to your email address' },
  { icon: '📱', text: 'SMS notification with booking details' },
  { icon: '🚗', text: 'Driver assigned 24 hours before pickup' },
  { icon: '📍', text: 'Track your driver on pickup day' }
];

nextSteps.forEach((item, idx) => {
  slide7.addText(`${item.icon}  ${item.text}`, { x: 0.7, y: 4.5 + (idx * 0.4), fontSize: 12, fontFace: 'Arial', color: colors.dark });
});

// ============================================
// SLIDE 8: Manage Booking
// ============================================
let slide8 = pptx.addSlide();
addHeader(slide8, 'Manage Your Booking', 'View, modify or cancel your booking');

slide8.addText('Access your booking at: airporttransferportal.com/manage-booking', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.primary });

slide8.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 1.2, fill: { color: colors.light } });
slide8.addText('🔑 To access your booking:', { x: 0.7, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide8.addText('1. Enter your booking reference\n2. Enter your email address\n3. Click "Find Booking"', { x: 0.7, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide8.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 1.2, fill: { color: 'FEF3C7' } });
slide8.addText('📋 You can view:', { x: 5.4, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide8.addText('• Booking details\n• Driver information\n• Vehicle details\n• Payment status', { x: 5.4, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide8.addText('Available Actions:', { x: 0.5, y: 3.1, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });

const actions = [
  { action: 'View Details', desc: 'See complete booking information, driver, vehicle', color: colors.primary },
  { action: 'Track Driver', desc: 'Real-time location on pickup day', color: colors.success },
  { action: 'Cancel Booking', desc: 'Free cancellation up to 24 hours before', color: 'EF4444' },
  { action: 'Contact Support', desc: 'Get help with your booking', color: colors.accent }
];

actions.forEach((item, idx) => {
  const y = 3.5 + (idx * 0.6);
  slide8.addShape('rect', { x: 0.5, y: y, w: 2, h: 0.5, fill: { color: item.color } });
  slide8.addText(item.action, { x: 0.5, y: y, w: 2, h: 0.5, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });
  slide8.addText(item.desc, { x: 2.7, y: y + 0.1, fontSize: 11, fontFace: 'Arial', color: colors.dark });
});

// ============================================
// SLIDE 9: Track Your Driver
// ============================================
let slide9 = pptx.addSlide();
addHeader(slide9, 'Track Your Driver', 'Real-time location tracking on pickup day');

slide9.addShape('rect', { x: 0.5, y: 1.3, w: 9, h: 0.5, fill: { color: colors.success } });
slide9.addText('📍 LIVE TRACKING', { x: 0.5, y: 1.3, w: 9, h: 0.5, fontSize: 16, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

slide9.addText('On the day of your transfer, you can track your driver in real-time:', { x: 0.5, y: 2, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Status flow
const statuses = [
  { status: 'ASSIGNED', desc: 'Driver assigned to your ride', icon: '👤' },
  { status: 'EN ROUTE', desc: 'Driver is on the way', icon: '🚗' },
  { status: 'ARRIVED', desc: 'Driver at pickup point', icon: '📍' },
  { status: 'IN PROGRESS', desc: 'Transfer in progress', icon: '🛣️' },
  { status: 'COMPLETED', desc: 'Arrived at destination', icon: '✅' }
];

statuses.forEach((item, idx) => {
  const x = 0.5 + (idx * 1.9);
  slide9.addShape('rect', { x: x, y: 2.5, w: 1.8, h: 1.2, fill: { color: colors.primary } });
  slide9.addText(item.icon, { x: x, y: 2.55, w: 1.8, fontSize: 20, align: 'center' });
  slide9.addText(item.status, { x: x, y: 3, w: 1.8, fontSize: 9, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide9.addText(item.desc, { x: x, y: 3.8, w: 1.8, fontSize: 8, fontFace: 'Arial', color: '6B7280', align: 'center' });
});

slide9.addText('What you\'ll see on the tracking page:', { x: 0.5, y: 4.3, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const trackingInfo = ['Driver name & photo', 'Vehicle details (make, model, color, plate)', 'Estimated arrival time', 'Driver phone number', 'Current location on map'];
slide9.addText(trackingInfo.map(i => '• ' + i).join('\n'), { x: 0.7, y: 4.65, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 10: Cancellation Policy
// ============================================
let slide10 = pptx.addSlide();
addHeader(slide10, 'Cancellation Policy', 'Free cancellation available');

slide10.addShape('rect', { x: 0.5, y: 1.4, w: 9, h: 1.5, fill: { color: 'ECFDF5' }, line: { color: colors.success, width: 2 } });
slide10.addText('✅ Free Cancellation', { x: 0.7, y: 1.5, fontSize: 16, fontFace: 'Arial', color: colors.success, bold: true });
slide10.addText('Cancel up to 24 hours before pickup time for a full refund.\nNo questions asked, no fees charged.', { x: 0.7, y: 1.95, w: 8.5, fontSize: 12, fontFace: 'Arial', color: colors.dark });

slide10.addShape('rect', { x: 0.5, y: 3.1, w: 9, h: 1.5, fill: { color: 'FEF3C7' }, line: { color: colors.warning, width: 2 } });
slide10.addText('⚠️ Late Cancellation (Less than 24 hours)', { x: 0.7, y: 3.2, fontSize: 16, fontFace: 'Arial', color: colors.warning, bold: true });
slide10.addText('Cancellations within 24 hours of pickup may incur a fee.\nContact support for special circumstances.', { x: 0.7, y: 3.65, w: 8.5, fontSize: 12, fontFace: 'Arial', color: colors.dark });

slide10.addShape('rect', { x: 0.5, y: 4.8, w: 9, h: 1, fill: { color: 'FEE2E2' }, line: { color: 'EF4444', width: 2 } });
slide10.addText('❌ No-Show', { x: 0.7, y: 4.9, fontSize: 16, fontFace: 'Arial', color: 'EF4444', bold: true });
slide10.addText('If you don\'t show up, the full amount is charged. Driver waits 60 minutes at airport pickups.', { x: 0.7, y: 5.25, w: 8.5, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 11: Contact & Support
// ============================================
let slide11 = pptx.addSlide();
addHeader(slide11, 'Contact & Support', 'We\'re here to help');

slide11.addShape('rect', { x: 0.5, y: 1.4, w: 4.3, h: 2, fill: { color: colors.light } });
slide11.addText('📧 Email Support', { x: 0.7, y: 1.5, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('info@airporttransferportal.com\n\nResponse within 24 hours\nInclude your booking reference', { x: 0.7, y: 1.9, w: 4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide11.addShape('rect', { x: 5.2, y: 1.4, w: 4.3, h: 2, fill: { color: colors.light } });
slide11.addText('📱 WhatsApp', { x: 5.4, y: 1.5, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('+90 XXX XXX XXXX\n\nQuick responses\nSend booking code for faster help', { x: 5.4, y: 1.9, w: 4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide11.addShape('rect', { x: 0.5, y: 3.6, w: 9, h: 1.5, fill: { color: 'EFF6FF' } });
slide11.addText('🌐 Self-Service Options', { x: 0.7, y: 3.7, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('• FAQ page: airporttransferportal.com/faq\n• Manage Booking: airporttransferportal.com/manage-booking\n• Help Center: airporttransferportal.com/help', { x: 0.7, y: 4.1, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 12: Summary
// ============================================
let slide12 = pptx.addSlide();
slide12.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide12.addShape('ellipse', { x: 7, y: -1, w: 4, h: 4, fill: { color: colors.primary, transparency: 80 } });

slide12.addText('Client Booking Process', { x: 0.5, y: 1, w: '90%', fontSize: 32, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });

const summary = [
  { num: '1', text: 'Search - Enter trip details' },
  { num: '2', text: 'Compare - View available vehicles' },
  { num: '3', text: 'Book - Enter passenger details' },
  { num: '4', text: 'Pay - Choose payment method' },
  { num: '5', text: 'Confirm - Receive booking code' },
  { num: '6', text: 'Track - Monitor driver on pickup day' }
];

summary.forEach((item, idx) => {
  const y = 1.8 + (idx * 0.55);
  slide12.addShape('ellipse', { x: 2, y: y, w: 0.45, h: 0.45, fill: { color: colors.primary } });
  slide12.addText(item.num, { x: 2, y: y, w: 0.45, h: 0.45, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });
  slide12.addText(item.text, { x: 2.6, y: y + 0.08, fontSize: 16, fontFace: 'Arial', color: colors.white });
});

slide12.addText('🌐 airporttransferportal.com', { x: 0.5, y: 5.2, w: '90%', fontSize: 18, fontFace: 'Arial', color: colors.primary, align: 'center' });

// Save
const outputPath = path.join(__dirname, '..', 'docs', 'Client-User-Guide.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log(`✅ Client PPT saved to: ${outputPath}`))
  .catch(err => console.error('Error:', err));
