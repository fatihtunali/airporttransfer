import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier } from '@/lib/supplier-auth';
import { query } from '@/lib/db';

interface ExpiringDocument {
  entity_type: string;
  entity_id: number;
  entity_name: string;
  doc_type: string;
  doc_name: string;
  expiry_date: string;
  days_until_expiry: number;
  expiry_status: string;
}

// GET /api/supplier/expiring-documents - List supplier's expiring documents
export async function GET(request: NextRequest) {
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId, supplierName } = auth.payload;

  // Get supplier documents
  const supplierDocs = await query<ExpiringDocument>(
    `SELECT
       'company' as entity_type,
       sd.supplier_id as entity_id,
       ? as entity_name,
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
     WHERE sd.supplier_id = ?
       AND sd.expiry_date IS NOT NULL
       AND DATEDIFF(sd.expiry_date, CURDATE()) <= 60
     ORDER BY days_until_expiry ASC`,
    [supplierName, supplierId]
  );

  // Get driver documents
  const driverDocs = await query<ExpiringDocument>(
    `SELECT
       'driver' as entity_type,
       d.id as entity_id,
       d.full_name as entity_name,
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
     WHERE d.supplier_id = ?
       AND dd.expiry_date IS NOT NULL
       AND DATEDIFF(dd.expiry_date, CURDATE()) <= 60
     ORDER BY days_until_expiry ASC`,
    [supplierId]
  );

  // Get vehicle documents
  const vehicleDocs = await query<ExpiringDocument>(
    `SELECT
       'vehicle' as entity_type,
       v.id as entity_id,
       CONCAT(v.brand, ' ', v.model, ' (', v.plate_number, ')') as entity_name,
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
     WHERE v.supplier_id = ?
       AND vd.expiry_date IS NOT NULL
       AND DATEDIFF(vd.expiry_date, CURDATE()) <= 60
     ORDER BY days_until_expiry ASC`,
    [supplierId]
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

  // Alert message
  let alertLevel: 'none' | 'warning' | 'critical' | 'expired' = 'none';
  let alertMessage = '';

  if (summary.expired > 0) {
    alertLevel = 'expired';
    alertMessage = `You have ${summary.expired} expired document(s). Please renew immediately to avoid service suspension.`;
  } else if (summary.critical > 0) {
    alertLevel = 'critical';
    alertMessage = `You have ${summary.critical} document(s) expiring within 7 days. Please renew soon.`;
  } else if (summary.warning > 0) {
    alertLevel = 'warning';
    alertMessage = `You have ${summary.warning} document(s) expiring within 30 days.`;
  }

  return NextResponse.json({
    documents: allDocs,
    summary,
    alert: {
      level: alertLevel,
      message: alertMessage,
    },
  });
}
