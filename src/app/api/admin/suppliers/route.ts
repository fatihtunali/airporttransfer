import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface SupplierRow {
  id: number;
  name: string;
  legal_name: string | null;
  tax_number: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  logo_url: string | null;
  description: string | null;
  is_verified: boolean;
  is_active: boolean;
  commission_rate: number;
  rating_avg: number;
  rating_count: number;
  created_at: Date;
}

interface SupplierCreateRequest {
  name: string;
  legalName?: string;
  taxNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsapp?: string;
  country?: string;
  city?: string;
  address?: string;
  logoUrl?: string;
  description?: string;
  commissionRate?: number;
}

// GET /api/admin/suppliers - List all suppliers
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const suppliers = await query<SupplierRow>(
      `SELECT id, name, legal_name, tax_number, contact_name, contact_email,
              contact_phone, whatsapp, country, city, address, logo_url, description,
              is_verified, is_active, commission_rate, rating_avg, rating_count, created_at
       FROM suppliers
       ORDER BY created_at DESC`
    );

    return NextResponse.json(
      suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        legalName: s.legal_name,
        taxNumber: s.tax_number,
        contactName: s.contact_name,
        contactEmail: s.contact_email,
        contactPhone: s.contact_phone,
        whatsapp: s.whatsapp,
        country: s.country,
        city: s.city,
        address: s.address,
        logoUrl: s.logo_url,
        description: s.description,
        isVerified: s.is_verified,
        isActive: s.is_active,
        commissionRate: s.commission_rate,
        ratingAvg: s.rating_avg,
        ratingCount: s.rating_count,
      }))
    );
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/suppliers - Create supplier company
export async function POST(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body: SupplierCreateRequest = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Insert supplier
    const supplierId = await insert(
      `INSERT INTO suppliers (name, legal_name, tax_number, contact_name, contact_email,
                              contact_phone, whatsapp, country, city, address, logo_url,
                              description, commission_rate, is_verified, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)`,
      [
        body.name,
        body.legalName || null,
        body.taxNumber || null,
        body.contactName || null,
        body.contactEmail || null,
        body.contactPhone || null,
        body.whatsapp || null,
        body.country || null,
        body.city || null,
        body.address || null,
        body.logoUrl || null,
        body.description || null,
        body.commissionRate || 15.00,
      ]
    );

    return NextResponse.json(
      {
        id: supplierId,
        name: body.name,
        legalName: body.legalName || null,
        taxNumber: body.taxNumber || null,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        whatsapp: body.whatsapp || null,
        country: body.country || null,
        city: body.city || null,
        address: body.address || null,
        logoUrl: body.logoUrl || null,
        description: body.description || null,
        isVerified: false,
        isActive: true,
        commissionRate: body.commissionRate || 15.00,
        ratingAvg: 0,
        ratingCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
