import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin-auth';

interface SettingRow {
  setting_key: string;
  setting_value: string;
}

export async function GET(request: NextRequest) {
  // Authenticate admin for settings access
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const settings = await query<SettingRow>('SELECT setting_key, setting_value FROM system_settings');

    const settingsMap: Record<string, string | number | boolean> = {};
    for (const row of settings) {
      // Try to parse as JSON, otherwise keep as string
      try {
        settingsMap[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settingsMap[row.setting_key] = row.setting_value;
      }
    }

    // Return default settings if none exist
    return NextResponse.json({
      settings: {
        siteName: settingsMap.siteName || 'Airport Transfer Portal',
        siteUrl: settingsMap.siteUrl || 'https://airporttransferportal.com',
        supportEmail: settingsMap.supportEmail || 'support@airporttransferportal.com',
        supportPhone: settingsMap.supportPhone || '+90 555 123 4567',
        defaultCurrency: settingsMap.defaultCurrency || 'EUR',
        defaultCommissionRate: settingsMap.defaultCommissionRate || 15,
        freeWaitingMinutes: settingsMap.freeWaitingMinutes || 60,
        cancellationHours24: settingsMap.cancellationHours24 || 24,
        cancellationHours12: settingsMap.cancellationHours12 || 12,
        nightSurchargeStart: settingsMap.nightSurchargeStart || '22:00',
        nightSurchargeEnd: settingsMap.nightSurchargeEnd || '06:00',
        nightSurchargePercent: settingsMap.nightSurchargePercent || 20,
        maintenanceMode: settingsMap.maintenanceMode || false,
      },
    });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({
      settings: {
        siteName: 'Airport Transfer Portal',
        siteUrl: 'https://airporttransferportal.com',
        supportEmail: 'support@airporttransferportal.com',
        supportPhone: '+90 555 123 4567',
        defaultCurrency: 'EUR',
        defaultCommissionRate: 15,
        freeWaitingMinutes: 60,
        cancellationHours24: 24,
        cancellationHours12: 12,
        nightSurchargeStart: '22:00',
        nightSurchargeEnd: '06:00',
        nightSurchargePercent: 20,
        maintenanceMode: false,
      },
    });
  }
}

export async function PUT(request: NextRequest) {
  // Authenticate admin
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const settings = await request.json();

    // Upsert each setting
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await query(`
        INSERT INTO system_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [key, stringValue]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
