import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/admin-auth';
import { query, queryOne, insert, execute } from '@/lib/db';

interface CancellationPolicy {
  id: number;
  policy_code: string;
  policy_name: string;
  description: string;
  hours_before: number;
  refund_percent: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

// GET /api/admin/cancellation-policies - List all cancellation policies
export async function GET(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  const policies = await query<CancellationPolicy>(
    `SELECT * FROM cancellation_policies ORDER BY hours_before DESC`,
    []
  );

  return NextResponse.json(policies);
}

// POST /api/admin/cancellation-policies - Create new policy
export async function POST(request: NextRequest) {
  const auth = await authenticateAdmin(request);
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const { policyCode, policyName, description, hoursBefore, refundPercent, isDefault } = body;

    if (!policyCode || !policyName || hoursBefore === undefined || refundPercent === undefined) {
      return NextResponse.json(
        { error: 'policyCode, policyName, hoursBefore, and refundPercent are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await queryOne(
      'SELECT id FROM cancellation_policies WHERE policy_code = ?',
      [policyCode]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Policy code already exists' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await execute('UPDATE cancellation_policies SET is_default = FALSE', []);
    }

    const policyId = await insert(
      `INSERT INTO cancellation_policies (policy_code, policy_name, description, hours_before, refund_percent, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [policyCode, policyName, description || null, hoursBefore, refundPercent, isDefault || false]
    );

    return NextResponse.json(
      {
        id: policyId,
        policyCode,
        policyName,
        description,
        hoursBefore,
        refundPercent,
        isDefault: isDefault || false,
        message: 'Cancellation policy created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating cancellation policy:', error);
    return NextResponse.json(
      { error: 'Failed to create cancellation policy' },
      { status: 500 }
    );
  }
}
