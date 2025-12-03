import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { query } from '@/lib/db';

interface ExpiringDocument {
  entity_type: string;
  entity_id: number;
  entity_name: string;
  supplier_id: number;
  supplier_name: string;
  doc_type: string;
  doc_name: string;
  expiry_date: string;
  days_until_expiry: number;
  expiry_status: string;
}

// GET /api/admin/expiring-documents - List documents expiring soon
export async function GET(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // EXPIRED, CRITICAL, WARNING, or null for all

  let statusFilter = '';
  if (status) {
    statusFilter = `AND expiry_status = '${status}'`;
  }

  // Get supplier documents
  const supplierDocs = await query<ExpiringDocument>(
    `SELECT
       'supplier' as entity_type,
       sd.supplier_id as entity_id,
       s.name as entity_name,
       sd.supplier_id,
       s.name as supplier_name,
       sd.doc_type,
       sd.doc_name,
       sd.expiry_date,
       DATEDIFF(sd.expiry_date, CURDATE()) as days_until_expiry,
       CASE
         WHEN sd.expiry_date < CURDATE() THEN 'EXPIRED'
         WHEN DATEDIFF(sd.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
         WHEN DATEDIFF(sd.expiry_date, CURDATE()) <= 30 THEN 'WARNING'
         ELSE 'OK'
       END as expiry_status
     FROM supplier_documents sd
     JOIN suppliers s ON s.id = sd.supplier_id
     WHERE sd.expiry_date IS NOT NULL
       AND sd.is_verified = TRUE
       AND DATEDIFF(sd.expiry_date, CURDATE()) <= 30
     HAVING 1=1 ${statusFilter}
     ORDER BY days_until_expiry ASC`,
    []
  );

  // Get driver documents
  const driverDocs = await query<ExpiringDocument>(
    `SELECT
       'driver' as entity_type,
       d.id as entity_id,
       d.full_name as entity_name,
       d.supplier_id,
       s.name as supplier_name,
       dd.doc_type,
       dd.doc_name,
       dd.expiry_date,
       DATEDIFF(dd.expiry_date, CURDATE()) as days_until_expiry,
       CASE
         WHEN dd.expiry_date < CURDATE() THEN 'EXPIRED'
         WHEN DATEDIFF(dd.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
         WHEN DATEDIFF(dd.expiry_date, CURDATE()) <= 30 THEN 'WARNING'
         ELSE 'OK'
       END as expiry_status
     FROM driver_documents dd
     JOIN drivers d ON d.id = dd.driver_id
     JOIN suppliers s ON s.id = d.supplier_id
     WHERE dd.expiry_date IS NOT NULL
       AND dd.is_verified = TRUE
       AND DATEDIFF(dd.expiry_date, CURDATE()) <= 30
     HAVING 1=1 ${statusFilter}
     ORDER BY days_until_expiry ASC`,
    []
  );

  // Get vehicle documents
  const vehicleDocs = await query<ExpiringDocument>(
    `SELECT
       'vehicle' as entity_type,
       v.id as entity_id,
       CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as entity_name,
       v.supplier_id,
       s.name as supplier_name,
       vd.doc_type,
       vd.doc_name,
       vd.expiry_date,
       DATEDIFF(vd.expiry_date, CURDATE()) as days_until_expiry,
       CASE
         WHEN vd.expiry_date < CURDATE() THEN 'EXPIRED'
         WHEN DATEDIFF(vd.expiry_date, CURDATE()) <= 7 THEN 'CRITICAL'
         WHEN DATEDIFF(vd.expiry_date, CURDATE()) <= 30 THEN 'WARNING'
         ELSE 'OK'
       END as expiry_status
     FROM vehicle_documents vd
     JOIN vehicles v ON v.id = vd.vehicle_id
     JOIN suppliers s ON s.id = v.supplier_id
     WHERE vd.expiry_date IS NOT NULL
       AND vd.is_verified = TRUE
       AND DATEDIFF(vd.expiry_date, CURDATE()) <= 30
     HAVING 1=1 ${statusFilter}
     ORDER BY days_until_expiry ASC`,
    []
  );

  // Combine and sort all
  const allDocs = [...supplierDocs, ...driverDocs, ...vehicleDocs]
    .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

  // Count by status
  const summary = {
    expired: allDocs.filter(d => d.expiry_status === 'EXPIRED').length,
    critical: allDocs.filter(d => d.expiry_status === 'CRITICAL').length,
    warning: allDocs.filter(d => d.expiry_status === 'WARNING').length,
    total: allDocs.length,
  };

  return NextResponse.json({
    documents: allDocs,
    summary,
  });
}
