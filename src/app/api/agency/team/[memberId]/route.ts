import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency, canManageAgency } from '@/lib/agency-auth';
import { query, queryOne } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyRole } = auth.payload;
  const { memberId } = await params;

  if (!canManageAgency(agencyRole)) {
    return NextResponse.json(
      { error: 'Only owners and managers can update team members' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { role, isActive } = body;

  // Verify member belongs to agency
  const member = await queryOne<{ id: number; role: string }>(
    'SELECT id, role FROM agency_users WHERE id = ? AND agency_id = ?',
    [memberId, agencyId]
  );

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  // Cannot change owner role
  if (member.role === 'OWNER' && role && role !== 'OWNER') {
    return NextResponse.json(
      { error: 'Cannot change owner role' },
      { status: 400 }
    );
  }

  const updates: string[] = [];
  const params_arr: (string | boolean | number)[] = [];

  if (role !== undefined && member.role !== 'OWNER') {
    updates.push('role = ?');
    params_arr.push(role);
  }

  if (isActive !== undefined) {
    updates.push('is_active = ?');
    params_arr.push(isActive);
  }

  if (updates.length > 0) {
    params_arr.push(parseInt(memberId), agencyId);
    await query(
      `UPDATE agency_users SET ${updates.join(', ')} WHERE id = ? AND agency_id = ?`,
      params_arr
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyRole } = auth.payload;
  const { memberId } = await params;

  if (!canManageAgency(agencyRole)) {
    return NextResponse.json(
      { error: 'Only owners and managers can remove team members' },
      { status: 403 }
    );
  }

  // Verify member belongs to agency and is not owner
  const member = await queryOne<{ id: number; role: string; user_id: number }>(
    'SELECT id, role, user_id FROM agency_users WHERE id = ? AND agency_id = ?',
    [memberId, agencyId]
  );

  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  if (member.role === 'OWNER') {
    return NextResponse.json(
      { error: 'Cannot remove agency owner' },
      { status: 400 }
    );
  }

  // Remove from agency
  await query('DELETE FROM agency_users WHERE id = ?', [memberId]);

  return NextResponse.json({ success: true });
}
