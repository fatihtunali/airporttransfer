import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { query, queryOne, insert, execute } from '@/lib/db';

interface SLARule {
  id: number;
  rule_key: string;
  rule_name: string;
  rule_value: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET /api/admin/sla-rules - List all SLA rules
export async function GET(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  const rules = await query<SLARule>(
    `SELECT * FROM sla_rules ORDER BY rule_key`,
    []
  );

  return NextResponse.json(rules);
}

// POST /api/admin/sla-rules - Create or update SLA rule
export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { ruleKey, ruleName, ruleValue, description, isActive } = body;

    if (!ruleKey || !ruleName || ruleValue === undefined) {
      return NextResponse.json(
        { error: 'ruleKey, ruleName, and ruleValue are required' },
        { status: 400 }
      );
    }

    // Check if rule exists
    const existing = await queryOne<SLARule>(
      'SELECT id FROM sla_rules WHERE rule_key = ?',
      [ruleKey]
    );

    if (existing) {
      // Update existing rule
      await execute(
        `UPDATE sla_rules
         SET rule_name = ?, rule_value = ?, description = ?, is_active = ?, updated_at = NOW()
         WHERE rule_key = ?`,
        [ruleName, ruleValue, description || null, isActive !== false, ruleKey]
      );

      return NextResponse.json({
        id: existing.id,
        ruleKey,
        ruleName,
        ruleValue,
        description,
        isActive: isActive !== false,
        message: 'SLA rule updated successfully',
      });
    } else {
      // Insert new rule
      const ruleId = await insert(
        `INSERT INTO sla_rules (rule_key, rule_name, rule_value, description, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [ruleKey, ruleName, ruleValue, description || null, isActive !== false]
      );

      return NextResponse.json(
        {
          id: ruleId,
          ruleKey,
          ruleName,
          ruleValue,
          description,
          isActive: isActive !== false,
          message: 'SLA rule created successfully',
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error saving SLA rule:', error);
    return NextResponse.json(
      { error: 'Failed to save SLA rule' },
      { status: 500 }
    );
  }
}
