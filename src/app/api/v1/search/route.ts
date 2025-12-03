import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiKey } from '@/lib/agency-auth';
import { query } from '@/lib/db';

interface TariffRow {
  id: number;
  supplier_id: number;
  supplier_name: string;
  supplier_rating: number;
  vehicle_type: string;
  base_price: number;
  currency: string;
  max_pax: number;
  airport_name: string;
  zone_name: string;
  distance_km: number;
  duration_min: number;
}

export async function GET(request: NextRequest) {
  // Authenticate API key
  const auth = await authenticateApiKey(request);
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(request.url);
  const airportCode = searchParams.get('airport');
  const zoneId = searchParams.get('zone');
  const date = searchParams.get('date');
  const passengers = parseInt(searchParams.get('passengers') || '1');

  if (!airportCode || !zoneId) {
    return NextResponse.json(
      { error: 'Missing required parameters: airport, zone' },
      { status: 400 }
    );
  }

  // Find available tariffs
  const tariffs = await query<TariffRow>(
    `SELECT
       t.id, t.supplier_id, s.name as supplier_name, s.rating_avg as supplier_rating,
       t.vehicle_type, t.base_price, t.currency, t.max_pax,
       a.name as airport_name, z.name as zone_name,
       r.approx_distance_km as distance_km, r.approx_duration_min as duration_min
     FROM tariffs t
     JOIN suppliers s ON s.id = t.supplier_id AND s.is_active = TRUE AND s.is_verified = TRUE
     JOIN routes r ON r.id = t.route_id
     JOIN airports a ON a.id = r.airport_id
     JOIN zones z ON z.id = r.zone_id
     WHERE a.code = ?
       AND z.id = ?
       AND t.is_active = TRUE
       AND (t.max_pax IS NULL OR t.max_pax >= ?)
     ORDER BY t.base_price ASC
     LIMIT 20`,
    [airportCode, zoneId, passengers]
  );

  return NextResponse.json({
    results: tariffs.map((t) => ({
      quoteId: `Q${t.id}-${Date.now()}`,
      supplierId: t.supplier_id,
      supplierName: t.supplier_name,
      supplierRating: t.supplier_rating,
      vehicleType: t.vehicle_type,
      maxPassengers: t.max_pax,
      price: {
        amount: t.base_price,
        currency: t.currency,
      },
      route: {
        from: t.airport_name,
        to: t.zone_name,
        distanceKm: t.distance_km,
        durationMin: t.duration_min,
      },
    })),
    meta: {
      airport: airportCode,
      zoneId: parseInt(zoneId),
      date,
      passengers,
      resultCount: tariffs.length,
    },
  });
}
