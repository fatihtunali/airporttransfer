import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

type BookingStatus = 'PENDING' | 'AWAITING_PAYMENT' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface BookingRow {
  id: number;
  public_code: string;
  customer_id: number | null;
  supplier_id: number | null;
  channel: string;
  airport_id: number;
  zone_id: number;
  direction: string;
  flight_number: string | null;
  pickup_datetime: Date;
  pax_adults: number;
  pax_children: number;
  vehicle_type: string;
  currency: string;
  total_price: number;
  commission: number;
  status: BookingStatus;
  payment_status: string;
  created_at: Date;
  // Airport/Zone info via JOIN
  airport_code: string;
  airport_name: string;
  zone_name: string;
  // Supplier info via JOIN
  supplier_name: string | null;
  // Passenger info via JOIN
  passenger_name: string | null;
  passenger_phone: string | null;
  passenger_email: string | null;
}

// GET /api/admin/bookings - List all bookings
export async function GET(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    let sql = `
      SELECT b.id, b.public_code, b.customer_id, b.supplier_id, b.channel,
             b.airport_id, b.zone_id, b.direction, b.flight_number,
             b.pickup_datetime, b.pax_adults, b.pax_children, b.vehicle_type,
             b.currency, b.total_price, b.commission, b.status, b.payment_status,
             b.created_at,
             a.code as airport_code, a.name as airport_name,
             z.name as zone_name,
             s.name as supplier_name,
             bp.full_name as passenger_name, bp.phone as passenger_phone, bp.email as passenger_email
      FROM bookings b
      JOIN airports a ON a.id = b.airport_id
      JOIN zones z ON z.id = b.zone_id
      LEFT JOIN suppliers s ON s.id = b.supplier_id
      LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
      WHERE 1=1
    `;
    const params: (string)[] = [];

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    if (fromDate) {
      sql += ` AND DATE(b.pickup_datetime) >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      sql += ` AND DATE(b.pickup_datetime) <= ?`;
      params.push(toDate);
    }

    // Get page and pageSize from query params
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;
    const offset = (page - 1) * pageSize;

    // Get total count first
    let countSql = `
      SELECT COUNT(*) as total
      FROM bookings b
      WHERE 1=1
    `;
    const countParams: string[] = [];

    if (status) {
      countSql += ` AND b.status = ?`;
      countParams.push(status);
    }
    if (fromDate) {
      countSql += ` AND DATE(b.pickup_datetime) >= ?`;
      countParams.push(fromDate);
    }
    if (toDate) {
      countSql += ` AND DATE(b.pickup_datetime) <= ?`;
      countParams.push(toDate);
    }

    const countResult = await query<{ total: number }>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    sql += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize.toString(), offset.toString());

    const bookings = await query<BookingRow>(sql, params);

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        publicCode: b.public_code,
        customerId: b.customer_id,
        supplierId: b.supplier_id,
        channel: b.channel,
        direction: b.direction,
        flightNumber: b.flight_number,
        pickupDatetime: b.pickup_datetime,
        paxAdults: b.pax_adults,
        paxChildren: b.pax_children,
        vehicleType: b.vehicle_type,
        currency: b.currency,
        totalPrice: Number(b.total_price),
        commission: Number(b.commission),
        status: b.status,
        paymentStatus: b.payment_status,
        createdAt: b.created_at,
        // Flat fields for the frontend
        airportCode: b.airport_code,
        airportName: b.airport_name,
        zoneName: b.zone_name,
        supplierName: b.supplier_name,
        customerName: b.passenger_name,
        customerPhone: b.passenger_phone,
        customerEmail: b.passenger_email,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
