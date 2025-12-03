import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgency, canManageAgency } from '@/lib/agency-auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

interface ApiKeyRow {
  id: number;
  api_key: string;
  name: string;
  created_at: string;
  last_used: string | null;
  request_count: number;
}

export async function GET(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId } = auth.payload;

  // For now, we use the main agency API key
  // In a full implementation, you'd have a separate api_keys table
  interface AgencyKeyRow {
    id: number;
    api_key: string | null;
    name: string;
    created_at: string;
  }

  const agency = await query<AgencyKeyRow[]>(
    `SELECT id, api_key, name, created_at FROM agencies WHERE id = ?`,
    [agencyId]
  );

  if (agency.length === 0 || !agency[0].api_key) {
    return NextResponse.json([]);
  }

  const key = agency[0].api_key;
  return NextResponse.json([
    {
      id: agency[0].id,
      keyPreview: `${key.substring(0, 12)}...${key.substring(key.length - 4)}`,
      name: 'Primary API Key',
      createdAt: agency[0].created_at,
      lastUsed: null,
      requestCount: 0,
    },
  ]);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateAgency(request);
  if (!auth.success) return auth.response;

  const { agencyId, agencyRole } = auth.payload;

  if (!canManageAgency(agencyRole)) {
    return NextResponse.json(
      { error: 'Only owners and managers can create API keys' },
      { status: 403 }
    );
  }

  // Generate new API key
  const apiKey = `atp_live_${crypto.randomBytes(24).toString('hex')}`;

  // Update agency with new key
  await query('UPDATE agencies SET api_key = ? WHERE id = ?', [apiKey, agencyId]);

  return NextResponse.json({ apiKey });
}
