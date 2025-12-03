import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
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
  response_time_avg: number;
  created_at: Date;
}

// GET /api/admin/suppliers/[supplierId] - Get supplier details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { supplierId } = await params;

  try {
    const supplier = await queryOne<SupplierRow>(
      `SELECT id, name, legal_name, tax_number, contact_name, contact_email,
              contact_phone, whatsapp, country, city, address, logo_url, description,
              is_verified, is_active, commission_rate, rating_avg, rating_count,
              response_time_avg, created_at
       FROM suppliers
       WHERE id = ?`,
      [supplierId]
    );

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
      responseTimeAvg: supplier.response_time_avg,
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}
