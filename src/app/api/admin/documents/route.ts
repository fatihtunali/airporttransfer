import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

interface DocumentWithDetails {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_name: string;
  supplier_name: string;
  doc_type: string;
  doc_name: string;
  file_url: string;
  expiry_date: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

// GET /api/admin/documents - List all pending documents for verification
export async function GET(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending'; // pending, verified, all
  const entityType = searchParams.get('entityType'); // supplier, driver, vehicle

  let verifiedCondition = '';
  if (status === 'pending') {
    verifiedCondition = 'AND is_verified = FALSE';
  } else if (status === 'verified') {
    verifiedCondition = 'AND is_verified = TRUE';
  }

  const documents: DocumentWithDetails[] = [];

  // Supplier documents
  if (!entityType || entityType === 'supplier') {
    const supplierDocs = await query<DocumentWithDetails>(
      `SELECT
         sd.id,
         'supplier' as entity_type,
         sd.supplier_id as entity_id,
         s.name as entity_name,
         s.name as supplier_name,
         sd.doc_type,
         sd.doc_name,
         sd.file_url,
         sd.expiry_date,
         sd.is_verified,
         sd.verified_at,
         sd.created_at
       FROM supplier_documents sd
       JOIN suppliers s ON s.id = sd.supplier_id
       WHERE 1=1 ${verifiedCondition}
       ORDER BY sd.created_at DESC`,
      []
    );
    documents.push(...supplierDocs);
  }

  // Driver documents
  if (!entityType || entityType === 'driver') {
    const driverDocs = await query<DocumentWithDetails>(
      `SELECT
         dd.id,
         'driver' as entity_type,
         dd.driver_id as entity_id,
         d.full_name as entity_name,
         s.name as supplier_name,
         dd.doc_type,
         dd.doc_name,
         dd.file_url,
         dd.expiry_date,
         dd.is_verified,
         NULL as verified_at,
         dd.created_at
       FROM driver_documents dd
       JOIN drivers d ON d.id = dd.driver_id
       JOIN suppliers s ON s.id = d.supplier_id
       WHERE 1=1 ${verifiedCondition}
       ORDER BY dd.created_at DESC`,
      []
    );
    documents.push(...driverDocs);
  }

  // Vehicle documents
  if (!entityType || entityType === 'vehicle') {
    const vehicleDocs = await query<DocumentWithDetails>(
      `SELECT
         vd.id,
         'vehicle' as entity_type,
         vd.vehicle_id as entity_id,
         CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as entity_name,
         s.name as supplier_name,
         vd.doc_type,
         vd.doc_name,
         vd.file_url,
         vd.expiry_date,
         vd.is_verified,
         NULL as verified_at,
         vd.created_at
       FROM vehicle_documents vd
       JOIN vehicles v ON v.id = vd.vehicle_id
       JOIN suppliers s ON s.id = v.supplier_id
       WHERE 1=1 ${verifiedCondition}
       ORDER BY vd.created_at DESC`,
      []
    );
    documents.push(...vehicleDocs);
  }

  // Sort all by created_at desc
  documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({
    documents,
    total: documents.length,
  });
}
