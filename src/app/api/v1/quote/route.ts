import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

interface TariffRow {
  id: number;
  supplier_id: number;
  supplier_name: string;
  vehicle_type: string;
  base_price: number;
  currency: string;
  max_pax: number;
  airport_name: string;
  zone_name: string;
  distance_km: number;
  duration_min: number;
  commission_rate: number;
}

interface ExtraRow {
  id: number;
  name: string;
  name_key: string;
  price: number;
  currency: string;
}

interface RequestedExtra {
  key: string;
  quantity?: number;
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth;

  const body = await request.json();
  const { airportCode, zoneId, vehicleType, date, time, passengers, extras } = body;

  if (!airportCode || !zoneId || !vehicleType) {
    return NextResponse.json(
      { error: 'Missing required fields: airportCode, zoneId, vehicleType' },
      { status: 400 }
    );
  }

  // Find matching tariff
  const tariff = await queryOne<TariffRow>(
    `SELECT
       t.id, t.supplier_id, s.name as supplier_name,
       t.vehicle_type, t.base_price, t.currency, t.max_pax,
       a.name as airport_name, z.name as zone_name,
       r.approx_distance_km as distance_km, r.approx_duration_min as duration_min,
       ag.commission_rate
     FROM tariffs t
     JOIN suppliers s ON s.id = t.supplier_id AND s.is_active = TRUE
     JOIN routes r ON r.id = t.route_id
     JOIN airports a ON a.id = r.airport_id
     JOIN zones z ON z.id = r.zone_id
     JOIN agencies ag ON ag.id = ?
     WHERE a.code = ?
       AND z.id = ?
       AND t.vehicle_type = ?
       AND t.is_active = TRUE
       AND (t.max_pax IS NULL OR t.max_pax >= ?)
     ORDER BY t.base_price ASC
     LIMIT 1`,
    [agencyId, airportCode, zoneId, vehicleType, passengers || 1]
  );

  if (!tariff) {
    return NextResponse.json(
      { error: 'No available tariff found for this route and vehicle type' },
      { status: 404 }
    );
  }

  // Calculate extras pricing
  let extrasPrice = 0;
  const extrasBreakdown: { name: string; key: string; price: number; quantity: number }[] = [];

  if (extras && Array.isArray(extras) && extras.length > 0) {
    // Fetch available extras for this supplier
    const supplierExtras = await query<ExtraRow>(
      `SELECT id, name, name_key, price, currency
       FROM extras
       WHERE supplier_id = ? AND is_active = TRUE`,
      [tariff.supplier_id]
    );

    // Calculate extras based on requested items
    for (const requestedExtra of extras as RequestedExtra[]) {
      const extra = supplierExtras.find(
        e => e.name_key === requestedExtra.key || e.name.toLowerCase() === requestedExtra.key.toLowerCase()
      );
      if (extra) {
        const quantity = requestedExtra.quantity || 1;
        const extraTotal = Number(extra.price) * quantity;
        extrasPrice += extraTotal;
        extrasBreakdown.push({
          name: extra.name,
          key: extra.name_key || extra.name,
          price: Number(extra.price),
          quantity,
        });
      }
    }
  }

  // Calculate total pricing
  const totalPrice = Number(tariff.base_price) + extrasPrice;

  // Apply agency commission
  const agencyCommission = totalPrice * (tariff.commission_rate / 100);
  const netPrice = totalPrice - agencyCommission;

  const quoteId = `QT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  return NextResponse.json({
    quoteId,
    validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min validity
    route: {
      from: tariff.airport_name,
      to: tariff.zone_name,
      distanceKm: tariff.distance_km,
      durationMin: tariff.duration_min,
    },
    vehicle: {
      type: tariff.vehicle_type,
      maxPassengers: tariff.max_pax,
    },
    pricing: {
      basePrice: Number(tariff.base_price),
      extrasPrice,
      extras: extrasBreakdown,
      totalPrice,
      agencyCommission,
      netPrice,
      currency: tariff.currency,
    },
    pickup: {
      date,
      time,
    },
    passengers: passengers || 1,
  });
}
