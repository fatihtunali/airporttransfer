const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();

pptx.author = 'Airport Transfer Portal';
pptx.title = 'Supplier Guide - Airport Transfer Portal';
pptx.subject = 'Complete supplier operations guide';

const colors = {
  primary: '10B981',
  secondary: '34D399',
  dark: '1F2937',
  light: 'F3F4F6',
  white: 'FFFFFF',
  warning: 'F59E0B',
  blue: '3B82F6',
  purple: '8B5CF6'
};

function addHeader(slide, title, subtitle) {
  slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: colors.primary } });
  slide.addText(title, { x: 0.5, y: 0.2, fontSize: 28, fontFace: 'Arial', color: colors.white, bold: true });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.5, y: 0.6, fontSize: 14, fontFace: 'Arial', color: 'D1FAE5' });
  }
}

// ============================================
// SLIDE 1: Title
// ============================================
let slide1 = pptx.addSlide();
slide1.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide1.addShape('ellipse', { x: -2, y: -2, w: 6, h: 6, fill: { color: colors.primary, transparency: 70 } });
slide1.addShape('ellipse', { x: 7, y: 3, w: 4, h: 4, fill: { color: colors.secondary, transparency: 70 } });

slide1.addText('🚗', { x: 0, y: 1.5, w: '100%', fontSize: 72, align: 'center' });
slide1.addText('Supplier Guide', { x: 0.5, y: 2.5, w: '90%', fontSize: 44, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
slide1.addText('Manage Your Transfer Business', { x: 0.5, y: 3.2, w: '90%', fontSize: 20, fontFace: 'Arial', color: colors.secondary, align: 'center' });
slide1.addText('airporttransferportal.com/supplier', { x: 0.5, y: 4.5, w: '90%', fontSize: 16, fontFace: 'Arial', color: colors.primary, align: 'center' });

// ============================================
// SLIDE 2: Supplier Overview
// ============================================
let slide2 = pptx.addSlide();
addHeader(slide2, '🚗 Supplier Overview', 'Who are suppliers?');

slide2.addText('Suppliers are transfer companies that provide vehicles and drivers to fulfill bookings.', {
  x: 0.5, y: 1.3, w: 9, fontSize: 12, fontFace: 'Arial', color: '4B5563'
});

slide2.addShape('rect', { x: 0.5, y: 1.8, w: 4.3, h: 2.8, fill: { color: 'ECFDF5' } });
slide2.addText('✅ What Suppliers Can Do', { x: 0.7, y: 1.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
const canDo = ['Register their company', 'Add vehicles to fleet', 'Add and manage drivers', 'Set route pricing (tariffs)', 'Receive booking notifications', 'Assign drivers to rides', 'Track earnings & payouts', 'Respond to customer reviews'];
slide2.addText(canDo.map(i => '• ' + i).join('\n'), { x: 0.7, y: 2.3, w: 4, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide2.addShape('rect', { x: 5.2, y: 1.8, w: 4.3, h: 2.8, fill: { color: colors.light } });
slide2.addText('👥 User Roles', { x: 5.4, y: 1.9, fontSize: 14, fontFace: 'Arial', color: colors.dark, bold: true });
const roles = [
  { role: 'Supplier Owner', desc: 'Full access to everything' },
  { role: 'Supplier Manager', desc: 'Manage fleet & rides' },
  { role: 'Driver', desc: 'View assigned rides only' }
];
roles.forEach((r, idx) => {
  slide2.addText(`${r.role}:`, { x: 5.4, y: 2.3 + (idx * 0.7), fontSize: 11, fontFace: 'Arial', color: colors.primary, bold: true });
  slide2.addText(r.desc, { x: 5.4, y: 2.55 + (idx * 0.7), fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

// ============================================
// SLIDE 3: Registration
// ============================================
let slide3 = pptx.addSlide();
addHeader(slide3, 'Step 1: Register Your Company', 'Join the platform');

const regSteps = [
  { num: '1', title: 'Visit Registration Page', desc: 'Go to /supplier/register' },
  { num: '2', title: 'Company Details', desc: 'Name, address, tax ID, phone' },
  { num: '3', title: 'Owner Account', desc: 'Your personal login details' },
  { num: '4', title: 'Upload Documents', desc: 'License, insurance, registration' },
  { num: '5', title: 'Submit Application', desc: 'Wait for admin review' },
  { num: '6', title: 'Get Verified', desc: 'Start receiving bookings!' }
];

regSteps.forEach((step, idx) => {
  const y = 1.3 + (idx * 0.7);
  slide3.addShape('ellipse', { x: 0.5, y: y, w: 0.5, h: 0.5, fill: { color: colors.primary } });
  slide3.addText(step.num, { x: 0.5, y: y, w: 0.5, h: 0.5, fontSize: 14, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });
  slide3.addText(step.title, { x: 1.2, y: y + 0.05, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
  slide3.addText(step.desc, { x: 1.2, y: y + 0.3, fontSize: 10, fontFace: 'Arial', color: '6B7280' });
});

slide3.addShape('rect', { x: 5.5, y: 1.3, w: 4, h: 3.5, fill: { color: 'FEF3C7' } });
slide3.addText('📄 Required Documents', { x: 5.7, y: 1.4, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide3.addText('Company Documents:\n• Business license\n• Tax registration\n• Insurance certificate\n• Service agreement\n\nVehicle Documents:\n• Vehicle registration\n• Insurance per vehicle\n• Inspection certificate\n\nDriver Documents:\n• Driver license\n• ID card\n• Background check', { x: 5.7, y: 1.8, fontSize: 10, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 4: Adding Vehicles
// ============================================
let slide4 = pptx.addSlide();
addHeader(slide4, 'Step 2: Add Your Vehicles', 'Build your fleet');

slide4.addText('After registration, add all vehicles you want to use for transfers:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Vehicle types
const vehicleTypes = [
  { type: 'SEDAN', pax: '1-3', icon: '🚗', desc: 'Standard cars' },
  { type: 'VAN', pax: '4-7', icon: '🚐', desc: 'Minivans, SUVs' },
  { type: 'MINIBUS', pax: '8-16', icon: '🚌', desc: 'Small buses' },
  { type: 'BUS', pax: '17-50', icon: '🚍', desc: 'Large coaches' },
  { type: 'VIP', pax: '1-3', icon: '🚙', desc: 'Luxury vehicles' }
];

vehicleTypes.forEach((v, idx) => {
  const x = 0.5 + (idx * 1.9);
  slide4.addShape('rect', { x: x, y: 1.7, w: 1.8, h: 1.4, fill: { color: colors.white }, line: { color: colors.primary, width: 1 } });
  slide4.addText(v.icon, { x: x, y: 1.8, w: 1.8, fontSize: 24, align: 'center' });
  slide4.addText(v.type, { x: x, y: 2.3, w: 1.8, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true, align: 'center' });
  slide4.addText(`${v.pax} pax`, { x: x, y: 2.55, w: 1.8, fontSize: 10, fontFace: 'Arial', color: '6B7280', align: 'center' });
  slide4.addText(v.desc, { x: x, y: 2.8, w: 1.8, fontSize: 9, fontFace: 'Arial', color: '6B7280', align: 'center' });
});

// Vehicle info required
slide4.addText('Information needed for each vehicle:', { x: 0.5, y: 3.3, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide4.addShape('rect', { x: 0.5, y: 3.6, w: 4.3, h: 1.7, fill: { color: colors.light } });
slide4.addText('• Brand (e.g., Mercedes, Toyota)\n• Model (e.g., Vito, Hiace)\n• Year\n• Color\n• Plate number\n• Passenger capacity\n• Luggage capacity', { x: 0.7, y: 3.7, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide4.addShape('rect', { x: 5.2, y: 3.6, w: 4.3, h: 1.7, fill: { color: 'ECFDF5' } });
slide4.addText('📸 Upload Photos:', { x: 5.4, y: 3.7, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
slide4.addText('• Exterior photo\n• Interior photo\n• Registration document\n• Insurance document\n\nGood photos = more bookings!', { x: 5.4, y: 4, fontSize: 10, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 5: Adding Drivers
// ============================================
let slide5 = pptx.addSlide();
addHeader(slide5, 'Step 3: Add Your Drivers', 'Manage your team');

slide5.addText('Add all drivers who will perform the transfers:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

slide5.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 2.5, fill: { color: colors.light } });
slide5.addText('👤 Driver Information', { x: 0.7, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('• Full name\n• Phone number\n• Email address\n• License number\n• License expiry date\n• Photo (shown to customers)\n• Languages spoken', { x: 0.7, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide5.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 2.5, fill: { color: 'FEF3C7' } });
slide5.addText('📄 Driver Documents', { x: 5.4, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide5.addText('• Driver license (front & back)\n• ID card / Passport\n• Professional driver certificate\n• Medical certificate\n• Background check result', { x: 5.4, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide5.addShape('rect', { x: 0.5, y: 4.4, w: 9, h: 0.9, fill: { color: colors.primary } });
slide5.addText('💡 Tip: Keep driver documents updated! You\'ll get alerts before they expire.', { x: 0.5, y: 4.4, w: 9, h: 0.9, fontSize: 13, fontFace: 'Arial', color: colors.white, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 6: Setting Prices (Tariffs)
// ============================================
let slide6 = pptx.addSlide();
addHeader(slide6, 'Step 4: Set Your Prices', 'Create tariffs for routes');

slide6.addText('Tariffs determine how much you charge for each route and vehicle type:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

slide6.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 2, fill: { color: colors.light } });
slide6.addText('📍 Tariff = Route + Vehicle + Price', { x: 0.7, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('Example:\n• Route: IST Airport → Taksim\n• Vehicle: Sedan\n• Price: €45\n• Currency: EUR', { x: 0.7, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.dark });

slide6.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 2, fill: { color: 'ECFDF5' } });
slide6.addText('💰 Price Settings', { x: 5.4, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addText('• Base price (one-way)\n• Extra passenger fee (optional)\n• Night surcharge (optional)\n• Holiday surcharge (optional)\n• Child seat fee (optional)', { x: 5.4, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Tariff table example
slide6.addText('Your Tariff Table:', { x: 0.5, y: 3.9, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide6.addShape('rect', { x: 0.5, y: 4.2, w: 9, h: 0.4, fill: { color: colors.primary } });
slide6.addText('Route | Sedan | Van | Minibus | Status', { x: 0.5, y: 4.2, w: 9, h: 0.4, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

slide6.addShape('rect', { x: 0.5, y: 4.6, w: 9, h: 0.4, fill: { color: colors.light } });
slide6.addText('IST → Taksim | €45 | €65 | €95 | Active', { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 10, fontFace: 'Arial', color: colors.dark, align: 'center', valign: 'middle' });

slide6.addShape('rect', { x: 0.5, y: 5, w: 9, h: 0.4, fill: { color: colors.white } });
slide6.addText('IST → Sultanahmet | €50 | €70 | €100 | Active', { x: 0.5, y: 5, w: 9, h: 0.4, fontSize: 10, fontFace: 'Arial', color: colors.dark, align: 'center', valign: 'middle' });

// ============================================
// SLIDE 7: Receiving Rides
// ============================================
let slide7 = pptx.addSlide();
addHeader(slide7, 'Receiving Rides', 'When a booking comes in');

slide7.addText('When a customer books a transfer on your route, you receive the ride:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Notification methods
slide7.addShape('rect', { x: 0.5, y: 1.7, w: 3, h: 1.5, fill: { color: 'EFF6FF' } });
slide7.addText('📧 Email', { x: 0.7, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide7.addText('Instant notification\nwith all ride details', { x: 0.7, y: 2.15, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide7.addShape('rect', { x: 3.7, y: 1.7, w: 3, h: 1.5, fill: { color: 'ECFDF5' } });
slide7.addText('📱 SMS', { x: 3.9, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide7.addText('Quick alert with\nbooking code', { x: 3.9, y: 2.15, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide7.addShape('rect', { x: 6.9, y: 1.7, w: 2.6, h: 1.5, fill: { color: 'F5F3FF' } });
slide7.addText('🖥️ Dashboard', { x: 7.1, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide7.addText('New ride appears\nin your ride list', { x: 7.1, y: 2.15, fontSize: 10, fontFace: 'Arial', color: colors.dark });

// Ride information
slide7.addText('Ride Details You Receive:', { x: 0.5, y: 3.4, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide7.addShape('rect', { x: 0.5, y: 3.7, w: 9, h: 1.6, fill: { color: colors.light } });

const rideDetails = [
  ['Booking Code', 'Customer Name', 'Phone Number'],
  ['Pickup Location', 'Dropoff Address', 'Flight Number'],
  ['Pickup Date/Time', 'Passengers', 'Vehicle Type'],
  ['Special Requests', 'Payment Status', 'Your Payout']
];

rideDetails.forEach((row, rIdx) => {
  row.forEach((item, cIdx) => {
    slide7.addText(`• ${item}`, { x: 0.7 + (cIdx * 3), y: 3.8 + (rIdx * 0.35), fontSize: 10, fontFace: 'Arial', color: colors.dark });
  });
});

// ============================================
// SLIDE 8: Assigning Drivers
// ============================================
let slide8 = pptx.addSlide();
addHeader(slide8, 'Assigning Drivers', 'Assign driver to each ride');

slide8.addText('New rides come in as "Pending Assignment". You need to assign a driver:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Assignment flow
const assignSteps = [
  { num: '1', text: 'Go to Rides page' },
  { num: '2', text: 'Find the pending ride' },
  { num: '3', text: 'Click "Assign Driver"' },
  { num: '4', text: 'Select available driver' },
  { num: '5', text: 'Select vehicle' },
  { num: '6', text: 'Confirm assignment' }
];

assignSteps.forEach((step, idx) => {
  const x = 0.5 + (idx * 1.55);
  slide8.addShape('rect', { x: x, y: 1.7, w: 1.45, h: 0.9, fill: { color: colors.primary } });
  slide8.addText(step.num, { x: x, y: 1.75, w: 1.45, fontSize: 16, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide8.addText(step.text, { x: x, y: 2.1, w: 1.45, fontSize: 9, fontFace: 'Arial', color: colors.white, align: 'center' });
});

slide8.addShape('rect', { x: 0.5, y: 2.8, w: 9, h: 0.6, fill: { color: colors.secondary } });
slide8.addText('✅ After assignment: Customer receives driver details & tracking link', { x: 0.5, y: 2.8, w: 9, h: 0.6, fontSize: 12, fontFace: 'Arial', color: colors.white, align: 'center', valign: 'middle' });

// Tips
slide8.addText('💡 Assignment Tips:', { x: 0.5, y: 3.6, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide8.addShape('rect', { x: 0.5, y: 3.9, w: 9, h: 1.4, fill: { color: colors.light } });
slide8.addText('• Assign drivers at least 24 hours before pickup\n• Check driver availability before assigning\n• Match vehicle type to booking requirement\n• Consider driver location for efficiency\n• You can reassign if needed (customer will be notified)', { x: 0.7, y: 4, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 9: Ride Status Flow
// ============================================
let slide9 = pptx.addSlide();
addHeader(slide9, 'Ride Status Flow', 'Track ride progress');

slide9.addText('Each ride goes through these statuses:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

const statuses = [
  { status: 'PENDING\nASSIGN', color: 'FCD34D', desc: 'Waiting for driver' },
  { status: 'ASSIGNED', color: '60A5FA', desc: 'Driver assigned' },
  { status: 'EN ROUTE', color: '818CF8', desc: 'Driver heading to pickup' },
  { status: 'ARRIVED', color: '34D399', desc: 'Driver at pickup' },
  { status: 'IN\nPROGRESS', color: '22D3EE', desc: 'Transfer ongoing' },
  { status: 'COMPLETED', color: colors.primary, desc: 'Done!' }
];

statuses.forEach((s, idx) => {
  const x = 0.5 + (idx * 1.55);
  slide9.addShape('rect', { x: x, y: 1.7, w: 1.45, h: 1.2, fill: { color: s.color } });
  slide9.addText(s.status, { x: x, y: 1.8, w: 1.45, fontSize: 10, fontFace: 'Arial', color: colors.dark, bold: true, align: 'center' });
  slide9.addText(s.desc, { x: x, y: 3, w: 1.45, fontSize: 9, fontFace: 'Arial', color: '6B7280', align: 'center' });
  if (idx < statuses.length - 1) {
    slide9.addText('→', { x: x + 1.45, y: 2, fontSize: 16, fontFace: 'Arial', color: colors.dark });
  }
});

// Who updates status
slide9.addText('Who Updates Status?', { x: 0.5, y: 3.5, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addShape('rect', { x: 0.5, y: 3.8, w: 4.3, h: 1.5, fill: { color: 'ECFDF5' } });
slide9.addText('🚗 Driver App', { x: 0.7, y: 3.9, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addText('• Driver updates status\n• Location auto-tracked\n• Customer sees live updates', { x: 0.7, y: 4.2, fontSize: 10, fontFace: 'Arial', color: colors.dark });

slide9.addShape('rect', { x: 5.2, y: 3.8, w: 4.3, h: 1.5, fill: { color: 'F5F3FF' } });
slide9.addText('🖥️ Supplier Dashboard', { x: 5.4, y: 3.9, fontSize: 11, fontFace: 'Arial', color: colors.dark, bold: true });
slide9.addText('• Manager can update too\n• Useful for manual tracking\n• Override if needed', { x: 5.4, y: 4.2, fontSize: 10, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 10: Earnings & Payouts
// ============================================
let slide10 = pptx.addSlide();
addHeader(slide10, 'Earnings & Payouts', 'Get paid for your services');

slide10.addText('You earn money for each completed transfer:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Earnings breakdown
slide10.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 2, fill: { color: 'ECFDF5' } });
slide10.addText('💰 Earnings Calculation', { x: 0.7, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide10.addText('Booking Price:     €45.00\nPlatform Fee:     - €4.50 (10%)\n─────────────────\nYour Payout:       €40.50', { x: 0.7, y: 2.2, fontSize: 11, fontFace: 'Courier New', color: colors.dark });

slide10.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 2, fill: { color: colors.light } });
slide10.addText('📅 Payout Schedule', { x: 5.4, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide10.addText('• Weekly settlements\n• Bank transfer to your account\n• Minimum payout: €50\n• Processing: 2-3 business days', { x: 5.4, y: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Payout page features
slide10.addText('Payouts Page Shows:', { x: 0.5, y: 3.9, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide10.addShape('rect', { x: 0.5, y: 4.2, w: 9, h: 1.2, fill: { color: colors.light } });
slide10.addText('• Pending balance (rides awaiting payout)\n• Processing (being transferred)\n• Paid (completed payouts)\n• Transaction history with booking details', { x: 0.7, y: 4.3, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 11: Reviews & Ratings
// ============================================
let slide11 = pptx.addSlide();
addHeader(slide11, 'Reviews & Ratings', 'Build your reputation');

slide11.addText('Customers can rate and review your service after each transfer:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Rating display
slide11.addShape('rect', { x: 0.5, y: 1.7, w: 4.3, h: 1.8, fill: { color: 'FEF3C7' } });
slide11.addText('⭐ Your Rating', { x: 0.7, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('⭐⭐⭐⭐⭐', { x: 0.7, y: 2.2, fontSize: 24 });
slide11.addText('4.8 out of 5 (124 reviews)', { x: 0.7, y: 2.7, fontSize: 11, fontFace: 'Arial', color: '6B7280' });
slide11.addText('Shown to customers when booking', { x: 0.7, y: 3, fontSize: 10, fontFace: 'Arial', color: colors.dark, italic: true });

slide11.addShape('rect', { x: 5.2, y: 1.7, w: 4.3, h: 1.8, fill: { color: colors.light } });
slide11.addText('📝 Reviews Include', { x: 5.4, y: 1.8, fontSize: 13, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addText('• Star rating (1-5)\n• Written comment\n• Driver name\n• Trip details\n• Date of transfer', { x: 5.4, y: 2.15, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// Responding
slide11.addText('Responding to Reviews:', { x: 0.5, y: 3.7, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
slide11.addShape('rect', { x: 0.5, y: 4, w: 9, h: 1.3, fill: { color: 'ECFDF5' } });
slide11.addText('• You can respond to any review\n• Thank positive reviewers\n• Address concerns professionally\n• Responses are public - be polite!\n• Good reviews = more bookings', { x: 0.7, y: 4.1, fontSize: 11, fontFace: 'Arial', color: colors.dark });

// ============================================
// SLIDE 12: Document Management
// ============================================
let slide12 = pptx.addSlide();
addHeader(slide12, 'Document Management', 'Keep documents up to date');

slide12.addText('All documents must be valid for you to receive bookings:', { x: 0.5, y: 1.3, fontSize: 12, fontFace: 'Arial', color: colors.dark });

// Document categories
const docCategories = [
  { title: 'Company Docs', docs: ['Business license', 'Insurance', 'Tax cert'], color: 'EFF6FF' },
  { title: 'Vehicle Docs', docs: ['Registration', 'Insurance', 'Inspection'], color: 'ECFDF5' },
  { title: 'Driver Docs', docs: ['License', 'ID', 'Medical'], color: 'FEF3C7' }
];

docCategories.forEach((cat, idx) => {
  const x = 0.5 + (idx * 3.1);
  slide12.addShape('rect', { x: x, y: 1.7, w: 2.9, h: 1.5, fill: { color: cat.color } });
  slide12.addText(cat.title, { x: x + 0.1, y: 1.8, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
  slide12.addText(cat.docs.map(d => '• ' + d).join('\n'), { x: x + 0.1, y: 2.1, fontSize: 10, fontFace: 'Arial', color: colors.dark });
});

// Expiry alerts
slide12.addShape('rect', { x: 0.5, y: 3.4, w: 9, h: 0.7, fill: { color: colors.warning } });
slide12.addText('⚠️ You\'ll receive alerts 30 days before any document expires!', { x: 0.5, y: 3.4, w: 9, h: 0.7, fontSize: 13, fontFace: 'Arial', color: colors.white, bold: true, align: 'center', valign: 'middle' });

slide12.addText('Document Status:', { x: 0.5, y: 4.3, fontSize: 12, fontFace: 'Arial', color: colors.dark, bold: true });
const statuses2 = [
  { status: 'Valid', color: colors.primary, desc: 'Active & approved' },
  { status: 'Expiring', color: colors.warning, desc: 'Expires within 30 days' },
  { status: 'Expired', color: 'EF4444', desc: 'Must renew immediately' },
  { status: 'Pending', color: colors.blue, desc: 'Awaiting admin review' }
];

statuses2.forEach((s, idx) => {
  const x = 0.5 + (idx * 2.35);
  slide12.addShape('rect', { x: x, y: 4.6, w: 2.2, h: 0.7, fill: { color: s.color } });
  slide12.addText(s.status, { x: x, y: 4.65, w: 2.2, fontSize: 11, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });
  slide12.addText(s.desc, { x: x, y: 4.9, w: 2.2, fontSize: 8, fontFace: 'Arial', color: colors.white, align: 'center' });
});

// ============================================
// SLIDE 13: Summary
// ============================================
let slide13 = pptx.addSlide();
slide13.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: colors.dark } });
slide13.addShape('ellipse', { x: 7, y: -1, w: 4, h: 4, fill: { color: colors.primary, transparency: 80 } });

slide13.addText('Supplier Portal Summary', { x: 0.5, y: 0.8, w: '90%', fontSize: 32, fontFace: 'Arial', color: colors.white, bold: true, align: 'center' });

const summary = [
  { icon: '📝', text: 'Register & get verified' },
  { icon: '🚗', text: 'Add vehicles to your fleet' },
  { icon: '👤', text: 'Add and manage drivers' },
  { icon: '💰', text: 'Set prices for routes' },
  { icon: '📋', text: 'Receive & manage rides' },
  { icon: '🎯', text: 'Assign drivers to rides' },
  { icon: '📍', text: 'Track ride status' },
  { icon: '💳', text: 'Get paid weekly' }
];

summary.forEach((item, idx) => {
  const col = idx < 4 ? 0 : 1;
  const row = idx % 4;
  slide13.addText(`${item.icon}  ${item.text}`, { x: 1.5 + (col * 4.5), y: 1.6 + (row * 0.6), fontSize: 14, fontFace: 'Arial', color: colors.white });
});

slide13.addText('🚗 airporttransferportal.com/supplier', { x: 0.5, y: 5.2, w: '90%', fontSize: 18, fontFace: 'Arial', color: colors.primary, align: 'center' });

// Save
const outputPath = path.join(__dirname, '..', 'docs', 'Supplier-User-Guide.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log(`✅ Supplier PPT saved to: ${outputPath}`))
  .catch(err => console.error('Error:', err));
