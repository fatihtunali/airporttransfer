import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';

interface IssueRow {
  id: number;
  booking_id: number | null;
  public_code: string | null;
  ride_id: number | null;
  driver_id: number | null;
  supplier_id: number | null;
  type: string;
  severity: string;
  title: string;
  description: string | null;
  status: string;
  resolution: string | null;
  reported_by: string;
  reporter_id: number | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  driver_name: string | null;
  supplier_name: string | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'open';

  let whereClause = '1=1';
  switch (filter) {
    case 'open':
      whereClause = "di.status = 'OPEN'";
      break;
    case 'in_progress':
      whereClause = "di.status = 'IN_PROGRESS'";
      break;
    case 'critical':
      whereClause = "di.severity = 'CRITICAL' AND di.status NOT IN ('CLOSED', 'RESOLVED')";
      break;
    case 'resolved':
      whereClause = "di.status IN ('RESOLVED', 'CLOSED')";
      break;
    case 'all':
    default:
      whereClause = 'di.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)';
  }

  try {
    const issues = await query<IssueRow>(`
      SELECT
        di.id,
        di.booking_id,
        b.public_code,
        di.ride_id,
        di.driver_id,
        di.supplier_id,
        di.issue_type as type,
        di.severity,
        di.title,
        di.description,
        di.status,
        di.resolution,
        di.reported_by,
        di.reporter_id,
        di.resolved_by,
        di.resolved_at,
        di.created_at,
        di.updated_at,
        bp.full_name as customer_name,
        d.full_name as driver_name,
        s.name as supplier_name
      FROM dispatch_issues di
      LEFT JOIN bookings b ON b.id = di.booking_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      LEFT JOIN drivers d ON d.id = di.driver_id
      LEFT JOIN suppliers s ON s.id = di.supplier_id
      WHERE ${whereClause}
      ORDER BY
        CASE di.severity
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          ELSE 4
        END,
        di.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({
      issues: issues.map((issue) => ({
        id: issue.id,
        bookingId: issue.booking_id,
        bookingCode: issue.public_code,
        rideId: issue.ride_id,
        driverId: issue.driver_id,
        supplierId: issue.supplier_id,
        type: issue.type,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        resolution: issue.resolution,
        reportedBy: issue.reported_by,
        reporterId: issue.reporter_id,
        resolvedBy: issue.resolved_by,
        resolvedAt: issue.resolved_at,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        customerName: issue.customer_name,
        driverName: issue.driver_name,
        supplierName: issue.supplier_name,
      })),
    });
  } catch (error) {
    console.error('Dispatch issues error:', error);
    return NextResponse.json({ issues: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, rideId, type, severity, title, description, reportedBy } = body;

    if (!type || !severity || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertId = await insert(
      `INSERT INTO dispatch_issues (booking_id, ride_id, issue_type, severity, title, description, reported_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId || null, rideId || null, type, severity, title, description || null, reportedBy || 'SYSTEM', 'OPEN']
    );

    return NextResponse.json({ success: true, issueId: insertId });
  } catch (error) {
    console.error('Create issue error:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, resolution, resolvedBy } = body;

    if (!id) {
      return NextResponse.json({ error: 'Issue ID required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
      // If status is RESOLVED or CLOSED, set resolved_at
      if (status === 'RESOLVED' || status === 'CLOSED') {
        updates.push('resolved_at = NOW()');
      }
    }
    if (resolution !== undefined) {
      updates.push('resolution = ?');
      values.push(resolution);
    }
    if (resolvedBy !== undefined) {
      updates.push('resolved_by = ?');
      values.push(resolvedBy);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE dispatch_issues SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update issue error:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}
