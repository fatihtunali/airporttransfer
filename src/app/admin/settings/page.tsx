'use client';

import { useState, useEffect } from 'react';

interface SystemSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultCommissionRate: number;
  freeWaitingMinutes: number;
  cancellationHours24: number;
  cancellationHours12: number;
  nightSurchargeStart: string;
  nightSurchargeEnd: string;
  nightSurchargePercent: number;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
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
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Load settings error:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Save settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - US Dollar</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="TRY">TRY - Turkish Lira</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission Rate (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={settings.defaultCommissionRate}
              onChange={(e) => setSettings({ ...settings, defaultCommissionRate: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Waiting Time (min)</label>
            <input
              type="number"
              min="0"
              value={settings.freeWaitingMinutes}
              onChange={(e) => setSettings({ ...settings, freeWaitingMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Refund (hours before pickup)
            </label>
            <input
              type="number"
              min="0"
              value={settings.cancellationHours24}
              onChange={(e) => setSettings({ ...settings, cancellationHours24: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Cancellation before this time = 100% refund</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              50% Refund (hours before pickup)
            </label>
            <input
              type="number"
              min="0"
              value={settings.cancellationHours12}
              onChange={(e) => setSettings({ ...settings, cancellationHours12: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Cancellation before this time = 50% refund</p>
          </div>
        </div>
      </div>

      {/* Night Surcharge */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Night Surcharge</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              value={settings.nightSurchargeStart}
              onChange={(e) => setSettings({ ...settings, nightSurchargeStart: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              value={settings.nightSurchargeEnd}
              onChange={(e) => setSettings({ ...settings, nightSurchargeEnd: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surcharge (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.nightSurchargePercent}
              onChange={(e) => setSettings({ ...settings, nightSurchargePercent: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Mode</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable Maintenance Mode</p>
            <p className="text-sm text-gray-500">
              When enabled, the public site will show a maintenance page
            </p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {settings.maintenanceMode && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ Maintenance mode is currently enabled. Public visitors will see a maintenance page.
            </p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Clear All Cache</p>
              <p className="text-sm text-gray-500">Clear system cache and regenerate data</p>
            </div>
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
              Clear Cache
            </button>
          </div>
          <div className="border-t pt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Export All Data</p>
              <p className="text-sm text-gray-500">Download a complete backup of all data</p>
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
