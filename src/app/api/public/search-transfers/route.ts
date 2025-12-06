import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import { applyRateLimit, getRateLimitHeaders, RateLimits } from '@/lib/rate-limit';

type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';
type RouteDirection = 'FROM_AIRPORT' | 'TO_AIRPORT' | 'BOTH';

interface TransferSearchRequest {
  airportId: number;
  zoneId: number;
  direction: RouteDirection;
  pickupTime: string;
  paxAdults: number;
  paxChildren?: number;
  currency: string;
}

interface TransferOption {
  supplier: {
    id: number;
    name: string;
    rating: number;
    ratingCount: number;
  };
  vehicleType: VehicleType;
  currency: string;
  totalPrice: number;
  estimatedDurationMin: number;
  cancellationPolicy: string;
  optionCode: string;
}

interface TariffRow {
  tariff_id: number;
  supplier_id: number;
  supplier_name: string;
  rating_avg: number;
  rating_count: number;
  vehicle_type: VehicleType;
  base_price: number;
  price_per_pax: number | null;
  min_pax: number;
  max_pax: number | null;
  currency: string;
  approx_duration_min: number;
}

// Generate option code for booking reference
function generateOptionCode(
  tariffId: number,
  supplierId: number,
  vehicleType: string,
  pickupTime: string
): string {
  const data = `${tariffId}-${supplierId}-${vehicleType}-${pickupTime}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex').slice(0, 12);
  return `OPT-${hash.toUpperCase()}`;
}

// Calculate price with rules and adjustments
async function calculatePrice(
  tariffId: number,
  basePrice: number,
  pricePerPax: number | null,
  totalPax: number,
  pickupTime: Date
): Promise<number> {
  let price = basePrice;

  // Add per-pax pricing if applicable
  if (pricePerPax && totalPax > 1) {
    price += pricePerPax * (totalPax - 1);
  }

  // Get active tariff rules
  const rules = await query<{
    rule_type: string;
    day_of_week: number | null;
    start_time: string | null;
    end_time: string | null;
    season_from: string | null;
    season_to: string | null;
    hours_before: number | null;
    perc_adjustment: number | null;
    fixed_adjustment: number | null;
  }>(
    `SELECT rule_type, day_of_week, start_time, end_time,
            season_from, season_to, hours_before,
            perc_adjustment, fixed_adjustment
     FROM tariff_rules
     WHERE tariff_id = ? AND is_active = TRUE`,
    [tariffId]
  );

  const pickupHour = pickupTime.getHours();
  const pickupMinutes = pickupHour * 60 + pickupTime.getMinutes();
  const pickupDayOfWeek = pickupTime.getDay() || 7; // Convert 0 (Sunday) to 7
  const hoursUntilPickup = (pickupTime.getTime() - Date.now()) / (1000 * 60 * 60);

  for (const rule of rules) {
    let applies = false;

    switch (rule.rule_type) {
      case 'TIME_OF_DAY':
        if (rule.start_time && rule.end_time) {
          const [startH, startM] = rule.start_time.split(':').map(Number);
          const [endH, endM] = rule.end_time.split(':').map(Number);
          const startMinutes = startH * 60 + startM;
          const endMinutes = endH * 60 + endM;
          applies = pickupMinutes >= startMinutes && pickupMinutes <= endMinutes;
        }
        break;

      case 'DAY_OF_WEEK':
        applies = rule.day_of_week === pickupDayOfWeek;
        break;

      case 'SEASON':
        if (rule.season_from && rule.season_to) {
          const pickupDate = pickupTime.toISOString().split('T')[0];
          applies = pickupDate >= rule.season_from && pickupDate <= rule.season_to;
        }
        break;

      case 'LAST_MINUTE':
        if (rule.hours_before) {
          applies = hoursUntilPickup <= rule.hours_before;
        }
        break;
    }

    if (applies) {
      if (rule.perc_adjustment) {
        price += price * (rule.perc_adjustment / 100);
      }
      if (rule.fixed_adjustment) {
        price += rule.fixed_adjustment;
      }
    }
  }

  return Math.round(price * 100) / 100; // Round to 2 decimals
}

// POST /api/public/search-transfers - Search transfer options
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const { response: rateLimitResponse, result: rateLimitResult } = applyRateLimit(request, RateLimits.SEARCH);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body: TransferSearchRequest = await request.json();

    // Validate required fields
    if (!body.airportId || !body.zoneId || !body.direction || !body.pickupTime || !body.paxAdults || !body.currency) {
      return NextResponse.json(
        { error: 'Missing required fields: airportId, zoneId, direction, pickupTime, paxAdults, currency' },
        { status: 400 }
      );
    }

    const totalPax = body.paxAdults + (body.paxChildren || 0);
    const pickupTime = new Date(body.pickupTime);

    // Validate pickup time is in the future
    if (pickupTime <= new Date()) {
      return NextResponse.json(
        { error: 'Pickup time must be in the future' },
        { status: 400 }
      );
    }

    // Find route
    const route = await query<{ id: number; approx_duration_min: number }>(
      `SELECT id, approx_duration_min
       FROM routes
       WHERE airport_id = ?
         AND zone_id = ?
         AND (direction = ? OR direction = 'BOTH')
         AND is_active = TRUE
       LIMIT 1`,
      [body.airportId, body.zoneId, body.direction]
    );

    if (route.length === 0) {
      return NextResponse.json(
        { error: 'No route found for this airport-zone combination' },
        { status: 404 }
      );
    }

    const routeId = route[0].id;
    const estimatedDuration = route[0].approx_duration_min || 60;

    // Find available tariffs from verified, active suppliers
    const tariffs = await query<TariffRow>(
      `SELECT
         t.id as tariff_id,
         t.supplier_id,
         s.name as supplier_name,
         s.rating_avg,
         s.rating_count,
         t.vehicle_type,
         t.base_price,
         t.price_per_pax,
         t.min_pax,
         t.max_pax,
         t.currency,
         r.approx_duration_min
       FROM tariffs t
       INNER JOIN suppliers s ON s.id = t.supplier_id
       INNER JOIN routes r ON r.id = t.route_id
       WHERE t.route_id = ?
         AND t.is_active = TRUE
         AND s.is_verified = TRUE
         AND s.is_active = TRUE
         AND (t.min_pax IS NULL OR t.min_pax <= ?)
         AND (t.max_pax IS NULL OR t.max_pax >= ?)
         AND (t.valid_from IS NULL OR t.valid_from <= DATE(?))
         AND (t.valid_to IS NULL OR t.valid_to >= DATE(?))
       ORDER BY t.base_price ASC`,
      [routeId, totalPax, totalPax, body.pickupTime, body.pickupTime]
    );

    // Calculate prices and build options
    const options: TransferOption[] = [];

    for (const tariff of tariffs) {
      const totalPrice = await calculatePrice(
        tariff.tariff_id,
        Number(tariff.base_price),
        tariff.price_per_pax ? Number(tariff.price_per_pax) : null,
        totalPax,
        pickupTime
      );

      // TODO: Currency conversion if needed
      // For now, we assume prices are in the requested currency

      const optionCode = generateOptionCode(
        tariff.tariff_id,
        tariff.supplier_id,
        tariff.vehicle_type,
        body.pickupTime
      );

      options.push({
        supplier: {
          id: tariff.supplier_id,
          name: tariff.supplier_name,
          rating: Number(tariff.rating_avg) || 0,
          ratingCount: tariff.rating_count || 0,
        },
        vehicleType: tariff.vehicle_type,
        currency: tariff.currency,
        totalPrice,
        estimatedDurationMin: tariff.approx_duration_min || estimatedDuration,
        cancellationPolicy: 'Free cancellation up to 24 hours before pickup',
        optionCode,
      });
    }

    // Sort by price
    options.sort((a, b) => a.totalPrice - b.totalPrice);

    return NextResponse.json({ options }, {
      headers: getRateLimitHeaders(rateLimitResult),
    });
  } catch (error) {
    console.error('Error searching transfers:', error);
    return NextResponse.json(
      { error: 'Failed to search transfers' },
      { status: 500 }
    );
  }
}
