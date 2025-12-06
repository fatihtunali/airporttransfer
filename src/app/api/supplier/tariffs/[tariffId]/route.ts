import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

type VehicleType = 'SEDAN' | 'VAN' | 'MINIBUS' | 'BUS' | 'VIP';
type TariffRuleType = 'TIME_OF_DAY' | 'DAY_OF_WEEK' | 'SEASON' | 'LAST_MINUTE';

interface TariffRow {
  id: number;
  supplier_id: number;
  route_id: number;
  vehicle_type: VehicleType;
  currency: string;
  base_price: number;
  price_per_pax: number | null;
  min_pax: number;
  max_pax: number | null;
  valid_from: Date | null;
  valid_to: Date | null;
  is_active: boolean;
  airport_code: string;
  airport_name: string;
  zone_name: string;
  direction: string;
}

interface TariffRuleRow {
  id: number;
  tariff_id: number;
  rule_type: TariffRuleType;
  rule_name: string | null;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  season_from: Date | null;
  season_to: Date | null;
  hours_before: number | null;
  perc_adjustment: number | null;
  fixed_adjustment: number | null;
  is_active: boolean;
}

// GET /api/supplier/tariffs/[tariffId] - Get tariff details with rules
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tariffId: string }> }
) {
  // Authenticate supplier
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  // Check role for fleet management
  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  const { tariffId } = await params;

  try {
    // Get tariff details
    const tariff = await queryOne<TariffRow>(
      `SELECT t.id, t.supplier_id, t.route_id, t.vehicle_type, t.currency,
              t.base_price, t.price_per_pax, t.min_pax, t.max_pax,
              t.valid_from, t.valid_to, t.is_active,
              a.code as airport_code, a.name as airport_name,
              z.name as zone_name, r.direction
       FROM tariffs t
       JOIN routes r ON r.id = t.route_id
       JOIN airports a ON a.id = r.airport_id
       JOIN zones z ON z.id = r.zone_id
       WHERE t.id = ? AND t.supplier_id = ?`,
      [tariffId, payload.supplierId]
    );

    if (!tariff) {
      return NextResponse.json(
        { error: 'Tariff not found' },
        { status: 404 }
      );
    }

    // Get tariff rules
    const rules = await query<TariffRuleRow>(
      `SELECT id, tariff_id, rule_type, rule_name, day_of_week, start_time,
              end_time, season_from, season_to, hours_before,
              perc_adjustment, fixed_adjustment, is_active
       FROM tariff_rules
       WHERE tariff_id = ?
       ORDER BY rule_type, id`,
      [tariffId]
    );

    return NextResponse.json({
      tariff: {
        id: tariff.id,
        supplierId: tariff.supplier_id,
        routeId: tariff.route_id,
        vehicleType: tariff.vehicle_type,
        currency: tariff.currency,
        basePrice: tariff.base_price,
        pricePerPax: tariff.price_per_pax,
        minPax: tariff.min_pax,
        maxPax: tariff.max_pax,
        validFrom: tariff.valid_from,
        validTo: tariff.valid_to,
        isActive: tariff.is_active,
        route: {
          airportCode: tariff.airport_code,
          airportName: tariff.airport_name,
          zoneName: tariff.zone_name,
          direction: tariff.direction,
        },
      },
      rules: rules.map((r) => ({
        id: r.id,
        tariffId: r.tariff_id,
        ruleType: r.rule_type,
        ruleName: r.rule_name,
        dayOfWeek: r.day_of_week,
        startTime: r.start_time,
        endTime: r.end_time,
        seasonFrom: r.season_from,
        seasonTo: r.season_to,
        hoursBefore: r.hours_before,
        percAdjustment: r.perc_adjustment,
        fixedAdjustment: r.fixed_adjustment,
        isActive: r.is_active,
      })),
    });
  } catch (error) {
    console.error('Error fetching tariff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tariff' },
      { status: 500 }
    );
  }
}

interface TariffUpdateRequest {
  currency?: string;
  basePrice?: number;
  pricePerPax?: number | null;
  minPax?: number;
  maxPax?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  isActive?: boolean;
}

// PUT /api/supplier/tariffs/[tariffId] - Update tariff
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ tariffId: string }> }
) {
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  const { tariffId } = await params;

  try {
    // Verify tariff belongs to supplier
    const existingTariff = await queryOne<{ id: number }>(
      `SELECT id FROM tariffs WHERE id = ? AND supplier_id = ?`,
      [tariffId, payload.supplierId]
    );

    if (!existingTariff) {
      return NextResponse.json({ error: 'Tariff not found' }, { status: 404 });
    }

    const body: TariffUpdateRequest = await request.json();

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (body.currency !== undefined) {
      updates.push('currency = ?');
      values.push(body.currency.toUpperCase());
    }
    if (body.basePrice !== undefined) {
      updates.push('base_price = ?');
      values.push(body.basePrice);
    }
    if (body.pricePerPax !== undefined) {
      updates.push('price_per_pax = ?');
      values.push(body.pricePerPax);
    }
    if (body.minPax !== undefined) {
      updates.push('min_pax = ?');
      values.push(body.minPax);
    }
    if (body.maxPax !== undefined) {
      updates.push('max_pax = ?');
      values.push(body.maxPax);
    }
    if (body.validFrom !== undefined) {
      updates.push('valid_from = ?');
      values.push(body.validFrom);
    }
    if (body.validTo !== undefined) {
      updates.push('valid_to = ?');
      values.push(body.validTo);
    }
    if (body.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(parseInt(tariffId));

    await query(`UPDATE tariffs SET ${updates.join(', ')} WHERE id = ?`, values);

    return NextResponse.json({ success: true, message: 'Tariff updated successfully' });
  } catch (error) {
    console.error('Error updating tariff:', error);
    return NextResponse.json({ error: 'Failed to update tariff' }, { status: 500 });
  }
}

// DELETE /api/supplier/tariffs/[tariffId] - Delete tariff
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tariffId: string }> }
) {
  const authResult = await authenticateSupplier(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { payload } = authResult;

  if (!canManageFleet(payload.role)) {
    return NextResponse.json(
      { error: 'Access denied. Fleet management role required.' },
      { status: 403 }
    );
  }

  const { tariffId } = await params;

  try {
    // Verify tariff belongs to supplier
    const existingTariff = await queryOne<{ id: number }>(
      `SELECT id FROM tariffs WHERE id = ? AND supplier_id = ?`,
      [tariffId, payload.supplierId]
    );

    if (!existingTariff) {
      return NextResponse.json({ error: 'Tariff not found' }, { status: 404 });
    }

    // Delete associated rules first
    await query(`DELETE FROM tariff_rules WHERE tariff_id = ?`, [tariffId]);

    // Delete the tariff
    await query(`DELETE FROM tariffs WHERE id = ?`, [tariffId]);

    return NextResponse.json({ success: true, message: 'Tariff deleted successfully' });
  } catch (error) {
    console.error('Error deleting tariff:', error);
    return NextResponse.json({ error: 'Failed to delete tariff' }, { status: 500 });
  }
}
