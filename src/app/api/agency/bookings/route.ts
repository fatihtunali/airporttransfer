import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency } from '@/lib/agency-auth';
import { query } from '@/lib/db';

interface BookingRow {
  id: number;
  public_code: string;
  agency_ref: string | null;
  customer_name: string;
  customer_phone: string;
  airport_name: string;
  zone_name: string;
  pickup_datetime: string;
  vehicle_type: string;
  pax_adults: number;
  pax_children: number;
  status: string;
  total_price: number;
  commission: number;
  currency: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  let sql = `
    SELECT
      b.id, b.public_code, b.agency_ref,
      bp.full_name as customer_name, bp.phone as customer_phone,
      a.name as airport_name, z.name as zone_name,
      b.pickup_datetime, b.vehicle_type,
      b.pax_adults, b.pax_children,
      b.status, b.total_price, b.commission, b.currency, b.created_at
    FROM bookings b
    LEFT JOIN booking_passengers bp ON bp.booking_id = b.id AND bp.is_lead = TRUE
    LEFT JOIN airports a ON a.id = b.airport_id
    LEFT JOIN zones z ON z.id = b.zone_id
    WHERE b.agency_id = ?
  `;
  const params: (string | number)[] = [agencyId];

  if (status) {
    sql += ' AND b.status = ?';
    params.push(status);
  }

  if (dateFrom) {
    sql += ' AND DATE(b.pickup_datetime) >= ?';
    params.push(dateFrom);
  }

  if (dateTo) {
    sql += ' AND DATE(b.pickup_datetime) <= ?';
    params.push(dateTo);
  }

  sql += ' ORDER BY b.created_at DESC LIMIT 100';

  const bookings = await query<BookingRow[]>(sql, params);

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      publicCode: b.public_code,
      agencyRef: b.agency_ref,
      customerName: b.customer_name || 'Guest',
      customerPhone: b.customer_phone || '',
      route: `${b.airport_name} → ${b.zone_name}`,
      pickupDatetime: b.pickup_datetime,
      vehicleType: b.vehicle_type,
      paxCount: b.pax_adults + b.pax_children,
      status: b.status,
      totalPrice: b.total_price,
      commission: b.commission,
      currency: b.currency,
      createdAt: b.created_at,
    })),
  });
}
