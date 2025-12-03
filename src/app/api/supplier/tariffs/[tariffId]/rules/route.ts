import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert } from '@/lib/db';
import { authenticateSupplier, canManageFleet } from '@/lib/supplier-auth';

type TariffRuleType = 'TIME_OF_DAY' | 'DAY_OF_WEEK' | 'SEASON' | 'LAST_MINUTE';

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

interface TariffRuleCreateRequest {
  ruleType: TariffRuleType;
  ruleName?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  seasonFrom?: string;
  seasonTo?: string;
  hoursBefore?: number;
  percAdjustment?: number;
  fixedAdjustment?: number;
}

// GET /api/supplier/tariffs/[tariffId]/rules - List rules for a tariff
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
    // Verify tariff belongs to supplier
    const tariff = await queryOne<{ id: number }>(
      `SELECT id FROM tariffs WHERE id = ? AND supplier_id = ?`,
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

    return NextResponse.json(
      rules.map((r) => ({
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
      }))
    );
  } catch (error) {
    console.error('Error fetching tariff rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tariff rules' },
      { status: 500 }
    );
  }
}

// POST /api/supplier/tariffs/[tariffId]/rules - Add pricing rule to a tariff
export async function POST(
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
    // Verify tariff belongs to supplier
    const tariff = await queryOne<{ id: number }>(
      `SELECT id FROM tariffs WHERE id = ? AND supplier_id = ?`,
      [tariffId, payload.supplierId]
    );

    if (!tariff) {
      return NextResponse.json(
        { error: 'Tariff not found' },
        { status: 404 }
      );
    }

    const body: TariffRuleCreateRequest = await request.json();

    // Validate required fields
    if (!body.ruleType) {
      return NextResponse.json(
        { error: 'ruleType is required' },
        { status: 400 }
      );
    }

    // Validate rule type
    const validTypes: TariffRuleType[] = ['TIME_OF_DAY', 'DAY_OF_WEEK', 'SEASON', 'LAST_MINUTE'];
    if (!validTypes.includes(body.ruleType)) {
      return NextResponse.json(
        { error: `Invalid ruleType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate based on rule type
    if (body.ruleType === 'TIME_OF_DAY' && (!body.startTime || !body.endTime)) {
      return NextResponse.json(
        { error: 'TIME_OF_DAY rule requires startTime and endTime' },
        { status: 400 }
      );
    }

    if (body.ruleType === 'DAY_OF_WEEK' && (body.dayOfWeek === undefined || body.dayOfWeek < 1 || body.dayOfWeek > 7)) {
      return NextResponse.json(
        { error: 'DAY_OF_WEEK rule requires dayOfWeek (1-7)' },
        { status: 400 }
      );
    }

    if (body.ruleType === 'SEASON' && (!body.seasonFrom || !body.seasonTo)) {
      return NextResponse.json(
        { error: 'SEASON rule requires seasonFrom and seasonTo' },
        { status: 400 }
      );
    }

    if (body.ruleType === 'LAST_MINUTE' && !body.hoursBefore) {
      return NextResponse.json(
        { error: 'LAST_MINUTE rule requires hoursBefore' },
        { status: 400 }
      );
    }

    // Must have at least one adjustment
    if (body.percAdjustment === undefined && body.fixedAdjustment === undefined) {
      return NextResponse.json(
        { error: 'At least one of percAdjustment or fixedAdjustment is required' },
        { status: 400 }
      );
    }

    // Insert rule
    const ruleId = await insert(
      `INSERT INTO tariff_rules (tariff_id, rule_type, rule_name, day_of_week,
                                 start_time, end_time, season_from, season_to,
                                 hours_before, perc_adjustment, fixed_adjustment, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        tariffId,
        body.ruleType,
        body.ruleName || null,
        body.dayOfWeek || null,
        body.startTime || null,
        body.endTime || null,
        body.seasonFrom || null,
        body.seasonTo || null,
        body.hoursBefore || null,
        body.percAdjustment || null,
        body.fixedAdjustment || null,
      ]
    );

    return NextResponse.json(
      {
        id: ruleId,
        tariffId: parseInt(tariffId),
        ruleType: body.ruleType,
        ruleName: body.ruleName || null,
        dayOfWeek: body.dayOfWeek || null,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        seasonFrom: body.seasonFrom || null,
        seasonTo: body.seasonTo || null,
        hoursBefore: body.hoursBefore || null,
        percAdjustment: body.percAdjustment || null,
        fixedAdjustment: body.fixedAdjustment || null,
        isActive: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tariff rule:', error);
    return NextResponse.json(
      { error: 'Failed to create tariff rule' },
      { status: 500 }
    );
  }
}
