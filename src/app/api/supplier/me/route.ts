import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { authenticateSupplier } from '@/lib/supplier-auth';

interface UserRow {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
}

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
}

// GET /api/supplier/me - Get current supplier user profile and supplier info
export async function GET(request: NextRequest) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  try {
    // Get user details
    const user = await queryOne<UserRow>(
      `SELECT id, email, full_name, phone, role, is_active
       FROM users WHERE id = ?`,
      [payload.userId]
    );

    // Get supplier details
    const supplier = await queryOne<SupplierRow>(
      `SELECT id, name, legal_name, tax_number, contact_name, contact_email,
              contact_phone, whatsapp, country, city, address, logo_url,
              description, is_verified, is_active, commission_rate,
              rating_avg, rating_count
       FROM suppliers WHERE id = ?`,
      [payload.supplierId]
    );

    if (!user || !supplier) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
        isActive: user.is_active,
      },
      supplier: {
        id: supplier.id,
        name: supplier.name,
        legalName: supplier.legal_name,
        taxNumber: supplier.tax_number,
        contactName: supplier.contact_name,
        contactEmail: supplier.contact_email,
        contactPhone: supplier.contact_phone,
        whatsapp: supplier.whatsapp,
        country: supplier.country,
        city: supplier.city,
        address: supplier.address,
        logoUrl: supplier.logo_url,
        description: supplier.description,
        isVerified: supplier.is_verified,
        isActive: supplier.is_active,
        commissionRate: supplier.commission_rate,
        ratingAvg: supplier.rating_avg,
        ratingCount: supplier.rating_count,
      },
    });
  } catch (error) {
    console.error('Error fetching supplier profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
