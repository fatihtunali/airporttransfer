const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// Create a new presentation
const pptx = new PptxGenJS();

// Set presentation properties
pptx.author = 'Airport Transfer Portal';
pptx.title = 'Airport Transfer Portal - System Overview';
pptx.subject = 'How the booking system works';
pptx.company = 'Airport Transfer Portal';

// Define colors
const colors = {
  primary: '0D9488',      // Teal
  secondary: '06B6D4',    // Cyan
  client: '3B82F6',       // Blue
  agent: '8B5CF6',        // Purple
  supplier: '10B981',     // Green
  admin: 'EF4444',        // Red
  dark: '1F2937',
  light: 'F3F4F6',
  white: 'FFFFFF'
};

// ============================================
// SLIDE 1: Title Slide
// ============================================
let slide1 = pptx.addSlide();

// Background gradient effect (using shape)
slide1.addShape('rect', {
  x: 0, y: 0, w: '100%', h: '100%',
  fill: { color: colors.dark }
});

// Decorative circles
slide1.addShape('ellipse', {
  x: -1, y: -1, w: 4, h: 4,
  fill: { color: colors.primary, transparency: 70 }
});
slide1.addShape('ellipse', {
  x: 8, y: 4, w: 3, h: 3,
  fill: { color: colors.secondary, transparency: 70 }
});

// Title
slide1.addText('Airport Transfer Portal', {
  x: 0.5, y: 2,
  w: '90%',
  fontSize: 44,
  fontFace: 'Arial',
  color: colors.white,
  bold: true,
  align: 'center'
});

// Subtitle
slide1.addText('System Architecture & User Flow', {
  x: 0.5, y: 2.8,
  w: '90%',
  fontSize: 24,
  fontFace: 'Arial',
  color: colors.secondary,
  align: 'center'
});

// Description
slide1.addText('Understanding how Clients, Agents, Suppliers & Admin interact', {
  x: 0.5, y: 3.6,
  w: '90%',
  fontSize: 16,
  fontFace: 'Arial',
  color: 'A0AEC0',
  align: 'center'
});

// Website
slide1.addText('airporttransferportal.com', {
  x: 0.5, y: 4.8,
  w: '90%',
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.primary,
  align: 'center'
});

// ============================================
// SLIDE 2: System Overview
// ============================================
let slide2 = pptx.addSlide();

slide2.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.primary }
});

slide2.addText('System Overview', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

// Central Platform Box
slide2.addShape('rect', {
  x: 3.5, y: 2.5, w: 3, h: 1.2,
  fill: { color: colors.dark },
  line: { color: colors.primary, width: 2 },
  shadow: { type: 'outer', blur: 10, offset: 3, angle: 45, opacity: 0.3 }
});
slide2.addText('Airport Transfer\nPortal Platform', {
  x: 3.5, y: 2.6, w: 3, h: 1.2,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.white,
  bold: true,
  align: 'center',
  valign: 'middle'
});

// User type boxes
const users = [
  { name: 'CLIENTS', color: colors.client, x: 0.5, y: 1.5, icon: '👤' },
  { name: 'AGENTS', color: colors.agent, x: 0.5, y: 3.5, icon: '🏢' },
  { name: 'SUPPLIERS', color: colors.supplier, x: 7, y: 1.5, icon: '🚗' },
  { name: 'ADMIN', color: colors.admin, x: 7, y: 3.5, icon: '⚙️' }
];

users.forEach(user => {
  slide2.addShape('rect', {
    x: user.x, y: user.y, w: 2.2, h: 1,
    fill: { color: user.color },
    line: { color: user.color, width: 1 },
    shadow: { type: 'outer', blur: 5, offset: 2, angle: 45, opacity: 0.2 }
  });
  slide2.addText(`${user.icon} ${user.name}`, {
    x: user.x, y: user.y, w: 2.2, h: 1,
    fontSize: 14,
    fontFace: 'Arial',
    color: colors.white,
    bold: true,
    align: 'center',
    valign: 'middle'
  });
});

// Arrows/Lines connecting to center
slide2.addShape('line', { x: 2.7, y: 2, w: 0.8, h: 0.8, line: { color: colors.client, width: 2, endArrowType: 'triangle' } });
slide2.addShape('line', { x: 2.7, y: 3.5, w: 0.8, h: -0.3, line: { color: colors.agent, width: 2, endArrowType: 'triangle' } });
slide2.addShape('line', { x: 6.5, y: 2, w: -0.5, h: 0.8, line: { color: colors.supplier, width: 2, beginArrowType: 'triangle' } });
slide2.addShape('line', { x: 6.5, y: 3.5, w: -0.5, h: -0.3, line: { color: colors.admin, width: 2, beginArrowType: 'triangle' } });

// Legend
slide2.addText('4 User Types Connected Through One Platform', {
  x: 0.5, y: 4.8,
  w: '90%',
  fontSize: 12,
  fontFace: 'Arial',
  color: colors.dark,
  align: 'center',
  italic: true
});

// ============================================
// SLIDE 3: Client Flow
// ============================================
let slide3 = pptx.addSlide();

slide3.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.client }
});

slide3.addText('👤 Client Journey', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

slide3.addText('How customers book airport transfers', {
  x: 0.5, y: 0.55,
  fontSize: 14,
  fontFace: 'Arial',
  color: 'E0E7FF'
});

// Flow steps
const clientSteps = [
  { num: '1', title: 'Search', desc: 'Enter airport, destination,\ndate & passengers', y: 1.3 },
  { num: '2', title: 'Compare', desc: 'View available vehicles\n& prices from suppliers', y: 2.2 },
  { num: '3', title: 'Book', desc: 'Enter passenger details\n& payment method', y: 3.1 },
  { num: '4', title: 'Confirm', desc: 'Receive booking code\n& confirmation email', y: 4.0 },
  { num: '5', title: 'Track', desc: 'Track driver location\non pickup day', y: 4.9 }
];

clientSteps.forEach((step, idx) => {
  // Step number circle
  slide3.addShape('ellipse', {
    x: 0.5, y: step.y, w: 0.6, h: 0.6,
    fill: { color: colors.client }
  });
  slide3.addText(step.num, {
    x: 0.5, y: step.y, w: 0.6, h: 0.6,
    fontSize: 16,
    fontFace: 'Arial',
    color: colors.white,
    bold: true,
    align: 'center',
    valign: 'middle'
  });

  // Title
  slide3.addText(step.title, {
    x: 1.3, y: step.y + 0.05,
    fontSize: 16,
    fontFace: 'Arial',
    color: colors.dark,
    bold: true
  });

  // Description
  slide3.addText(step.desc, {
    x: 1.3, y: step.y + 0.35,
    fontSize: 11,
    fontFace: 'Arial',
    color: '6B7280'
  });

  // Arrow to next step
  if (idx < clientSteps.length - 1) {
    slide3.addShape('line', {
      x: 0.8, y: step.y + 0.65, w: 0, h: 0.35,
      line: { color: colors.client, width: 2, dashType: 'dash' }
    });
  }
});

// Right side - Access Points
slide3.addShape('rect', {
  x: 5.5, y: 1.3, w: 4, h: 4,
  fill: { color: colors.light },
  line: { color: 'E5E7EB', width: 1 }
});

slide3.addText('🌐 Access Points', {
  x: 5.7, y: 1.5,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const accessPoints = [
  '• Website: airporttransferportal.com',
  '• Mobile responsive design',
  '• Manage Booking page',
  '• Real-time driver tracking',
  '• Email confirmations'
];

slide3.addText(accessPoints.join('\n'), {
  x: 5.7, y: 2,
  w: 3.6, h: 2.5,
  fontSize: 12,
  fontFace: 'Arial',
  color: colors.dark,
  valign: 'top'
});

slide3.addText('💳 Payment Options', {
  x: 5.7, y: 3.8,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

slide3.addText('• Pay Later (cash to driver)\n• Credit Card (online)\n• Bank Transfer', {
  x: 5.7, y: 4.2,
  w: 3.6,
  fontSize: 12,
  fontFace: 'Arial',
  color: colors.dark
});

// ============================================
// SLIDE 4: Agent Flow
// ============================================
let slide4 = pptx.addSlide();

slide4.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.agent }
});

slide4.addText('🏢 Travel Agent Portal', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

slide4.addText('B2B partners who book on behalf of their clients', {
  x: 0.5, y: 0.55,
  fontSize: 14,
  fontFace: 'Arial',
  color: 'E9D5FF'
});

// Two column layout
// Left: Registration & Features
slide4.addShape('rect', {
  x: 0.3, y: 1.2, w: 4.5, h: 4,
  fill: { color: colors.light },
  line: { color: 'E5E7EB', width: 1 }
});

slide4.addText('📝 Agent Registration', {
  x: 0.5, y: 1.4,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const agentReg = [
  '1. Register at /agency/register',
  '2. Submit company documents',
  '3. Admin verifies & approves',
  '4. Receive API key for integration',
  '5. Get credit limit assigned'
];

slide4.addText(agentReg.join('\n'), {
  x: 0.5, y: 1.8,
  w: 4.2,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark,
  bullet: false
});

slide4.addText('✨ Agent Features', {
  x: 0.5, y: 3.3,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const agentFeatures = [
  '• Dashboard with booking stats',
  '• Credit balance management',
  '• Team member access control',
  '• Invoice & payment tracking',
  '• API for system integration',
  '• White-label widget option'
];

slide4.addText(agentFeatures.join('\n'), {
  x: 0.5, y: 3.7,
  w: 4.2,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

// Right: Booking Flow
slide4.addShape('rect', {
  x: 5.2, y: 1.2, w: 4.5, h: 4,
  fill: { color: 'F5F3FF' },
  line: { color: colors.agent, width: 1 }
});

slide4.addText('📋 Agent Booking Process', {
  x: 5.4, y: 1.4,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const agentFlow = [
  { step: '1', text: 'Login to Agent Portal' },
  { step: '2', text: 'Search available transfers' },
  { step: '3', text: 'Enter client details' },
  { step: '4', text: 'Book using credit balance' },
  { step: '5', text: 'Client receives confirmation' },
  { step: '6', text: 'Agent invoiced monthly' }
];

agentFlow.forEach((item, idx) => {
  const yPos = 1.85 + (idx * 0.5);
  slide4.addShape('ellipse', {
    x: 5.4, y: yPos, w: 0.4, h: 0.4,
    fill: { color: colors.agent }
  });
  slide4.addText(item.step, {
    x: 5.4, y: yPos, w: 0.4, h: 0.4,
    fontSize: 11,
    fontFace: 'Arial',
    color: colors.white,
    bold: true,
    align: 'center',
    valign: 'middle'
  });
  slide4.addText(item.text, {
    x: 5.95, y: yPos + 0.05,
    fontSize: 12,
    fontFace: 'Arial',
    color: colors.dark
  });
});

// API note
slide4.addText('🔗 API Endpoint: /api/v1/booking', {
  x: 5.4, y: 4.8,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.agent,
  italic: true
});

// ============================================
// SLIDE 5: Supplier Flow
// ============================================
let slide5 = pptx.addSlide();

slide5.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.supplier }
});

slide5.addText('🚗 Supplier Portal', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

slide5.addText('Transfer companies who fulfill the bookings', {
  x: 0.5, y: 0.55,
  fontSize: 14,
  fontFace: 'Arial',
  color: 'D1FAE5'
});

// Left column - Setup
slide5.addShape('rect', {
  x: 0.3, y: 1.2, w: 3.1, h: 4,
  fill: { color: colors.light }
});

slide5.addText('⚡ Getting Started', {
  x: 0.5, y: 1.4,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const supplierSetup = [
  '1. Register company',
  '2. Upload documents',
  '3. Add vehicles',
  '4. Add drivers',
  '5. Set route pricing',
  '6. Get verified by admin'
];

slide5.addText(supplierSetup.join('\n'), {
  x: 0.5, y: 1.75,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

slide5.addText('📄 Required Documents', {
  x: 0.5, y: 3.4,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

slide5.addText('• Business license\n• Insurance certificate\n• Vehicle registrations\n• Driver licenses', {
  x: 0.5, y: 3.75,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

// Middle column - Daily Operations
slide5.addShape('rect', {
  x: 3.6, y: 1.2, w: 3.1, h: 4,
  fill: { color: 'ECFDF5' }
});

slide5.addText('📅 Daily Operations', {
  x: 3.8, y: 1.4,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const dailyOps = [
  '• View incoming rides',
  '• Assign drivers to rides',
  '• Track ride status:',
  '  - Pending → Assigned',
  '  - En Route → Arrived',
  '  - In Progress → Done',
  '• Handle customer issues',
  '• Manage driver schedule'
];

slide5.addText(dailyOps.join('\n'), {
  x: 3.8, y: 1.75,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

// Right column - Payouts
slide5.addShape('rect', {
  x: 6.9, y: 1.2, w: 2.8, h: 4,
  fill: { color: colors.light }
});

slide5.addText('💰 Payouts', {
  x: 7.1, y: 1.4,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const payouts = [
  '• View earnings',
  '• Track pending payouts',
  '• Monthly settlements',
  '• Commission deducted',
  '• Bank transfer to\n  supplier account'
];

slide5.addText(payouts.join('\n'), {
  x: 7.1, y: 1.75,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

slide5.addText('⭐ Reviews', {
  x: 7.1, y: 3.4,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

slide5.addText('• Customer feedback\n• Rating displayed\n• Respond to reviews', {
  x: 7.1, y: 3.75,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

// ============================================
// SLIDE 6: Admin Panel
// ============================================
let slide6 = pptx.addSlide();

slide6.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.admin }
});

slide6.addText('⚙️ Admin Control Panel', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

slide6.addText('Full system control and management', {
  x: 0.5, y: 0.55,
  fontSize: 14,
  fontFace: 'Arial',
  color: 'FEE2E2'
});

// Grid of admin functions
const adminFunctions = [
  { icon: '👥', title: 'User Management', desc: 'Create, edit, delete users\nAssign roles & permissions', x: 0.3, y: 1.2 },
  { icon: '✈️', title: 'Airports & Zones', desc: 'Manage service areas\nSet coverage zones', x: 3.5, y: 1.2 },
  { icon: '🛣️', title: 'Routes & Pricing', desc: 'Configure routes\nApprove supplier tariffs', x: 6.7, y: 1.2 },
  { icon: '📋', title: 'Booking Management', desc: 'View all bookings\nHandle cancellations', x: 0.3, y: 2.7 },
  { icon: '🏢', title: 'Supplier Verification', desc: 'Verify new suppliers\nReview documents', x: 3.5, y: 2.7 },
  { icon: '🏦', title: 'Agency Management', desc: 'Approve agencies\nManage credit limits', x: 6.7, y: 2.7 },
  { icon: '💳', title: 'Payouts', desc: 'Process supplier payments\nTrack transactions', x: 0.3, y: 4.2 },
  { icon: '📊', title: 'Dashboard & Reports', desc: 'Revenue analytics\nBooking statistics', x: 3.5, y: 4.2 },
  { icon: '🔧', title: 'System Settings', desc: 'Global configuration\nPayment gateway setup', x: 6.7, y: 4.2 }
];

adminFunctions.forEach(func => {
  slide6.addShape('rect', {
    x: func.x, y: func.y, w: 3, h: 1.3,
    fill: { color: colors.white },
    line: { color: colors.admin, width: 1 },
    shadow: { type: 'outer', blur: 3, offset: 1, angle: 45, opacity: 0.1 }
  });

  slide6.addText(`${func.icon} ${func.title}`, {
    x: func.x + 0.15, y: func.y + 0.1,
    fontSize: 12,
    fontFace: 'Arial',
    color: colors.dark,
    bold: true
  });

  slide6.addText(func.desc, {
    x: func.x + 0.15, y: func.y + 0.5,
    w: 2.7,
    fontSize: 10,
    fontFace: 'Arial',
    color: '6B7280'
  });
});

// ============================================
// SLIDE 7: Complete Booking Flow
// ============================================
let slide7 = pptx.addSlide();

slide7.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.primary }
});

slide7.addText('🔄 Complete Booking Flow', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

slide7.addText('How a booking moves through the system', {
  x: 0.5, y: 0.55,
  fontSize: 14,
  fontFace: 'Arial',
  color: 'CCFBF1'
});

// Flow diagram
const flowSteps = [
  { num: '1', actor: 'CLIENT/AGENT', action: 'Creates Booking', color: colors.client, x: 0.5 },
  { num: '2', actor: 'SYSTEM', action: 'Confirms & Notifies', color: colors.primary, x: 2.3 },
  { num: '3', actor: 'SUPPLIER', action: 'Receives Ride', color: colors.supplier, x: 4.1 },
  { num: '4', actor: 'SUPPLIER', action: 'Assigns Driver', color: colors.supplier, x: 5.9 },
  { num: '5', actor: 'DRIVER', action: 'Completes Transfer', color: colors.supplier, x: 7.7 }
];

flowSteps.forEach((step, idx) => {
  // Box
  slide7.addShape('rect', {
    x: step.x, y: 1.4, w: 1.6, h: 1.5,
    fill: { color: step.color },
    line: { color: step.color }
  });

  // Number
  slide7.addText(step.num, {
    x: step.x, y: 1.45, w: 1.6, h: 0.4,
    fontSize: 18,
    fontFace: 'Arial',
    color: colors.white,
    bold: true,
    align: 'center'
  });

  // Actor
  slide7.addText(step.actor, {
    x: step.x, y: 1.85, w: 1.6, h: 0.4,
    fontSize: 9,
    fontFace: 'Arial',
    color: 'E0E7FF',
    align: 'center'
  });

  // Action
  slide7.addText(step.action, {
    x: step.x, y: 2.15, w: 1.6, h: 0.6,
    fontSize: 10,
    fontFace: 'Arial',
    color: colors.white,
    align: 'center',
    valign: 'middle'
  });

  // Arrow
  if (idx < flowSteps.length - 1) {
    slide7.addText('→', {
      x: step.x + 1.6, y: 1.8,
      fontSize: 20,
      fontFace: 'Arial',
      color: colors.dark
    });
  }
});

// Status tracking
slide7.addText('📍 Ride Status Lifecycle', {
  x: 0.5, y: 3.2,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

const statuses = [
  { status: 'PENDING_ASSIGN', desc: 'Waiting for driver', color: 'FCD34D' },
  { status: 'ASSIGNED', desc: 'Driver assigned', color: '60A5FA' },
  { status: 'EN_ROUTE', desc: 'Driver heading to pickup', color: '818CF8' },
  { status: 'ARRIVED', desc: 'Driver at pickup point', color: '34D399' },
  { status: 'IN_PROGRESS', desc: 'Transfer in progress', color: '22D3EE' },
  { status: 'COMPLETED', desc: 'Transfer finished', color: '10B981' }
];

statuses.forEach((s, idx) => {
  const xPos = 0.5 + (idx * 1.6);
  slide7.addShape('rect', {
    x: xPos, y: 3.6, w: 1.5, h: 0.9,
    fill: { color: s.color }
  });
  slide7.addText(s.status.replace('_', '\n'), {
    x: xPos, y: 3.65, w: 1.5, h: 0.5,
    fontSize: 8,
    fontFace: 'Arial',
    color: colors.dark,
    bold: true,
    align: 'center'
  });
  slide7.addText(s.desc, {
    x: xPos, y: 4.1, w: 1.5, h: 0.35,
    fontSize: 7,
    fontFace: 'Arial',
    color: colors.dark,
    align: 'center'
  });
});

// Notifications
slide7.addText('🔔 Automatic Notifications', {
  x: 0.5, y: 4.7,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});

slide7.addText('• Booking confirmation email to client  • Driver assignment notification  • Driver en route SMS  • Pickup reminder  • Payment receipt', {
  x: 0.5, y: 5.05,
  w: 9,
  fontSize: 10,
  fontFace: 'Arial',
  color: '6B7280'
});

// ============================================
// SLIDE 8: Technical Architecture
// ============================================
let slide8 = pptx.addSlide();

slide8.addShape('rect', {
  x: 0, y: 0, w: '100%', h: 1,
  fill: { color: colors.dark }
});

slide8.addText('🏗️ Technical Architecture', {
  x: 0.5, y: 0.2,
  fontSize: 28,
  fontFace: 'Arial',
  color: colors.white,
  bold: true
});

// Frontend
slide8.addShape('rect', {
  x: 0.3, y: 1.2, w: 3, h: 2,
  fill: { color: '3B82F6' }
});
slide8.addText('Frontend', {
  x: 0.3, y: 1.3, w: 3, h: 0.4,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.white,
  bold: true,
  align: 'center'
});
slide8.addText('Next.js 16\nReact 19\nTailwind CSS\nTypeScript', {
  x: 0.3, y: 1.7, w: 3, h: 1.4,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.white,
  align: 'center',
  valign: 'middle'
});

// API
slide8.addShape('rect', {
  x: 3.5, y: 1.2, w: 3, h: 2,
  fill: { color: colors.supplier }
});
slide8.addText('API Layer', {
  x: 3.5, y: 1.3, w: 3, h: 0.4,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.white,
  bold: true,
  align: 'center'
});
slide8.addText('Next.js API Routes\nJWT Authentication\nRole-based Access\nRESTful Endpoints', {
  x: 3.5, y: 1.7, w: 3, h: 1.4,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.white,
  align: 'center',
  valign: 'middle'
});

// Database
slide8.addShape('rect', {
  x: 6.7, y: 1.2, w: 3, h: 2,
  fill: { color: colors.agent }
});
slide8.addText('Database', {
  x: 6.7, y: 1.3, w: 3, h: 0.4,
  fontSize: 14,
  fontFace: 'Arial',
  color: colors.white,
  bold: true,
  align: 'center'
});
slide8.addText('MySQL\nRelational Tables\nBookings, Users\nRides, Payouts', {
  x: 6.7, y: 1.7, w: 3, h: 1.4,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.white,
  align: 'center',
  valign: 'middle'
});

// Integrations
slide8.addShape('rect', {
  x: 0.3, y: 3.5, w: 4.5, h: 1.8,
  fill: { color: colors.light }
});
slide8.addText('🔌 Integrations', {
  x: 0.5, y: 3.6,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});
slide8.addText('• Payment Gateway (MAZAKA)\n• SMS/WhatsApp (Twilio)\n• Currency Exchange API\n• Flight Tracking API', {
  x: 0.5, y: 4,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

// Hosting
slide8.addShape('rect', {
  x: 5.2, y: 3.5, w: 4.5, h: 1.8,
  fill: { color: colors.light }
});
slide8.addText('☁️ Hosting & Deployment', {
  x: 5.4, y: 3.6,
  fontSize: 13,
  fontFace: 'Arial',
  color: colors.dark,
  bold: true
});
slide8.addText('• DigitalOcean VPS\n• PM2 Process Manager\n• Nginx Reverse Proxy\n• SSL Certificate', {
  x: 5.4, y: 4,
  fontSize: 11,
  fontFace: 'Arial',
  color: colors.dark
});

// ============================================
// SLIDE 9: Summary
// ============================================
let slide9 = pptx.addSlide();

slide9.addShape('rect', {
  x: 0, y: 0, w: '100%', h: '100%',
  fill: { color: colors.dark }
});

// Decorative
slide9.addShape('ellipse', {
  x: 7, y: -1, w: 4, h: 4,
  fill: { color: colors.primary, transparency: 80 }
});
slide9.addShape('ellipse', {
  x: -1, y: 4, w: 3, h: 3,
  fill: { color: colors.secondary, transparency: 80 }
});

slide9.addText('Airport Transfer Portal', {
  x: 0.5, y: 1.5,
  w: '90%',
  fontSize: 36,
  fontFace: 'Arial',
  color: colors.white,
  bold: true,
  align: 'center'
});

slide9.addText('Connecting Travelers with Transfer Providers', {
  x: 0.5, y: 2.2,
  w: '90%',
  fontSize: 18,
  fontFace: 'Arial',
  color: colors.secondary,
  align: 'center'
});

// Summary boxes
const summaryItems = [
  { icon: '👤', title: 'Clients', desc: 'Search, book & track transfers', color: colors.client },
  { icon: '🏢', title: 'Agents', desc: 'B2B booking with credit system', color: colors.agent },
  { icon: '🚗', title: 'Suppliers', desc: 'Manage fleet & fulfill rides', color: colors.supplier },
  { icon: '⚙️', title: 'Admin', desc: 'Control entire platform', color: colors.admin }
];

summaryItems.forEach((item, idx) => {
  const xPos = 0.7 + (idx * 2.35);
  slide9.addShape('rect', {
    x: xPos, y: 3, w: 2.1, h: 1.5,
    fill: { color: item.color }
  });
  slide9.addText(item.icon, {
    x: xPos, y: 3.1, w: 2.1, h: 0.5,
    fontSize: 24,
    align: 'center'
  });
  slide9.addText(item.title, {
    x: xPos, y: 3.55, w: 2.1, h: 0.35,
    fontSize: 14,
    fontFace: 'Arial',
    color: colors.white,
    bold: true,
    align: 'center'
  });
  slide9.addText(item.desc, {
    x: xPos, y: 3.9, w: 2.1, h: 0.5,
    fontSize: 10,
    fontFace: 'Arial',
    color: colors.white,
    align: 'center'
  });
});

slide9.addText('🌐 airporttransferportal.com', {
  x: 0.5, y: 4.8,
  w: '90%',
  fontSize: 16,
  fontFace: 'Arial',
  color: colors.primary,
  align: 'center'
});

// Save the presentation
const outputPath = path.join(__dirname, '..', 'docs', 'Airport-Transfer-Portal-System-Overview.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ Presentation saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error creating presentation:', err);
  });
