import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to contacts.json in scripts folder
const CONTACTS_PATH = path.join(process.cwd(), 'scripts', 'supplier-outreach', 'contacts.json');

interface Contact {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  country: string;
  language: string;
  source: string;
  status: string;
  emails: Array<{ templateNum: number; sentAt: string; messageId?: string; error?: string }>;
  createdAt: string;
  notes: string;
}

interface Database {
  metadata: {
    lastUpdated: string;
    totalContacts: number;
  };
  contacts: Contact[];
}

function loadDatabase(): Database {
  try {
    const data = fs.readFileSync(CONTACTS_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      metadata: { lastUpdated: new Date().toISOString(), totalContacts: 0 },
      contacts: []
    };
  }
}

function saveDatabase(db: Database): void {
  db.metadata.lastUpdated = new Date().toISOString();
  db.metadata.totalContacts = db.contacts.length;
  fs.writeFileSync(CONTACTS_PATH, JSON.stringify(db, null, 2));
}

function detectLanguage(country: string): string {
  const turkishCountries = ['Turkey', 'Türkiye', 'Azerbaijan'];
  const arabicCountries = ['UAE', 'Egypt', 'Morocco', 'Tunisia', 'Jordan', 'Qatar', 'Oman', 'Saudi Arabia', 'Lebanon', 'Kuwait', 'Bahrain'];

  if (turkishCountries.includes(country)) return 'tr';
  if (arabicCountries.includes(country)) return 'ar';
  return 'en';
}

// POST - Add a new supplier lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { company, email, phone, website, city, country, language, source } = body;

    if (!email || !city) {
      return NextResponse.json(
        { error: 'Email and city are required' },
        { status: 400 }
      );
    }

    const db = loadDatabase();

    // Check for duplicates
    const exists = db.contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return NextResponse.json(
        { success: false, message: 'Contact already exists', email },
        { status: 200 }
      );
    }

    const contact: Contact = {
      id: Date.now().toString(),
      companyName: company || 'Unknown Company',
      contactName: 'Team',
      email: email,
      phone: phone || '',
      website: website || '',
      city: city,
      country: country || '',
      language: language || detectLanguage(country || ''),
      source: source || 'api',
      status: 'new',
      emails: [],
      createdAt: new Date().toISOString(),
      notes: ''
    };

    db.contacts.push(contact);
    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Contact added',
      contact: {
        id: contact.id,
        companyName: contact.companyName,
        email: contact.email,
        city: contact.city
      }
    });

  } catch (error) {
    console.error('Error adding supplier lead:', error);
    return NextResponse.json(
      { error: 'Failed to add contact' },
      { status: 500 }
    );
  }
}

// GET - Get all contacts or stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const db = loadDatabase();

    if (action === 'stats') {
      // Return statistics
      const statusCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      const countryCounts: Record<string, number> = {};

      for (const contact of db.contacts) {
        statusCounts[contact.status] = (statusCounts[contact.status] || 0) + 1;
        cityCounts[contact.city] = (cityCounts[contact.city] || 0) + 1;
        countryCounts[contact.country] = (countryCounts[contact.country] || 0) + 1;
      }

      return NextResponse.json({
        total: db.contacts.length,
        lastUpdated: db.metadata.lastUpdated,
        byStatus: statusCounts,
        byCity: cityCounts,
        byCountry: countryCounts
      });
    }

    // Return all contacts (with optional filters)
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '100');

    let contacts = db.contacts;

    if (status) {
      contacts = contacts.filter(c => c.status === status);
    }
    if (city) {
      contacts = contacts.filter(c => c.city.toLowerCase() === city.toLowerCase());
    }
    if (country) {
      contacts = contacts.filter(c => c.country.toLowerCase() === country.toLowerCase());
    }

    return NextResponse.json({
      total: contacts.length,
      contacts: contacts.slice(0, limit)
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

// PATCH - Update contact status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, status, notes } = body;

    if (!email || !status) {
      return NextResponse.json(
        { error: 'Email and status are required' },
        { status: 400 }
      );
    }

    const db = loadDatabase();
    const contact = db.contacts.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    contact.status = status;
    if (notes) contact.notes = notes;

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Contact updated',
      contact: {
        email: contact.email,
        status: contact.status
      }
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}
