import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency, canManageAgency } from '@/lib/agency-auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

interface WidgetRow {
  id: number;
  widget_key: string;
  widget_type: string;
  allowed_domains: string | null;
  theme: string;
  impressions: number;
  conversions: number;
  is_active: boolean;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  const widgets = await query<WidgetRow>(
    `SELECT id, widget_key, widget_type, allowed_domains, theme,
            impressions, conversions, is_active, created_at
     FROM agency_widgets
     WHERE agency_id = ?
     ORDER BY created_at DESC`,
    [agencyId]
  );

  return NextResponse.json(
    widgets.map((w) => ({
      id: w.id,
      widgetKey: w.widget_key,
      widgetType: w.widget_type,
      allowedDomains: w.allowed_domains,
      theme: w.theme,
      impressions: w.impressions,
      conversions: w.conversions,
      isActive: w.is_active,
      createdAt: w.created_at,
    }))
  );
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyRole } = auth.payload;

  if (!canManageAgency(agencyRole)) {
    return NextResponse.json(
      { error: 'Only owners and managers can create widgets' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { widgetType, theme, allowedDomains } = body;

  // Generate widget key
  const widgetKey = `wgt_${crypto.randomBytes(16).toString('hex')}`;

  const result = await query(
    `INSERT INTO agency_widgets (agency_id, widget_key, widget_type, theme, allowed_domains, is_active)
     VALUES (?, ?, ?, ?, ?, TRUE)`,
    [agencyId, widgetKey, widgetType || 'SEARCH_FORM', theme || 'LIGHT', allowedDomains || null]
  );

  return NextResponse.json({
    id: (result as { insertId: number }).insertId,
    widgetKey,
  });
}
