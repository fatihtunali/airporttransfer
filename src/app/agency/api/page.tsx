'use client';

import { useState, useEffect } from 'react';
import {
  FaKey,
  FaCode,
  FaCopy,
  FaCheck,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaExternalLinkAlt,
} from 'react-icons/fa';

interface ApiKey {
  id: number;
  keyPreview: string;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
}

interface Widget {
  id: number;
  widgetKey: string;
  widgetType: string;
  theme: string;
  impressions: number;
  conversions: number;
  isActive: boolean;
  createdAt: string;
}

export default function AgencyApi() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showNewWidgetModal, setShowNewWidgetModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [widgetForm, setWidgetForm] = useState({
    widgetType: 'SEARCH_FORM',
    theme: 'LIGHT',
    allowedDomains: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [keysRes, widgetsRes] = await Promise.all([
        fetch('/api/agency/api-keys'),
        fetch('/api/agency/widgets'),
      ]);

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data);
      }
      if (widgetsRes.ok) {
        const data = await widgetsRes.json();
        setWidgets(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setSaving(true);

    try {
      const res = await fetch('/api/agency/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.apiKey);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating key:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const res = await fetch(`/api/agency/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  const handleCreateWidget = async () => {
    setSaving(true);

    try {
      const res = await fetch('/api/agency/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widgetForm),
      });

      if (res.ok) {
        setShowNewWidgetModal(false);
        setWidgetForm({ widgetType: 'SEARCH_FORM', theme: 'LIGHT', allowedDomains: '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating widget:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getWidgetEmbed = (widget: Widget) => {
    return `<script src="https://airporttransferportal.com/widget.js" data-key="${widget.widgetKey}" data-theme="${widget.theme.toLowerCase()}"></script>`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin w-8 h-8 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API & Widget</h1>
        <p className="text-gray-600">Integrate booking into your website or application</p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaKey className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
          </div>
          <button
            onClick={() => {
              setNewKeyName('');
              setNewKey(null);
              setShowNewKeyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <FaPlus /> Create Key
          </button>
        </div>

        <div className="p-6">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <FaKey className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No API keys created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{key.name}</p>
                    <p className="text-sm text-gray-500 font-mono">{key.keyPreview}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(key.createdAt).toLocaleDateString()} •{' '}
                      {key.requestCount} requests
                      {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* API Documentation Link */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">API Documentation</h3>
            <p className="text-emerald-100 mt-1">
              Complete reference for integrating our B2B API
            </p>
          </div>
          <a
            href="/api-docs"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            View Docs <FaExternalLinkAlt />
          </a>
        </div>

        <div className="mt-4 bg-emerald-700/50 rounded-lg p-4">
          <p className="text-sm text-emerald-100 mb-2">Base URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-emerald-800 px-3 py-2 rounded text-sm">
              https://airporttransferportal.com/api/v1
            </code>
            <button
              onClick={() => copyToClipboard('https://airporttransferportal.com/api/v1', 'baseUrl')}
              className="p-2 hover:bg-emerald-700 rounded"
            >
              {copied === 'baseUrl' ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
      </div>

      {/* Widget Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCode className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Booking Widget</h2>
          </div>
          <button
            onClick={() => setShowNewWidgetModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <FaPlus /> Create Widget
          </button>
        </div>

        <div className="p-6">
          {widgets.length === 0 ? (
            <div className="text-center py-8">
              <FaCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No widgets created yet</p>
              <p className="text-sm text-gray-500">
                Create a widget to embed a booking form on your website
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {widget.widgetType.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            widget.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {widget.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Theme: {widget.theme} • {widget.impressions} impressions •{' '}
                        {widget.conversions} conversions
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <p className="text-xs text-gray-500 mb-2">Embed Code:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-xs overflow-x-auto">
                        {getWidgetEmbed(widget)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(getWidgetEmbed(widget), `widget-${widget.id}`)}
                        className="p-2 text-gray-500 hover:text-emerald-600"
                      >
                        {copied === `widget-${widget.id}` ? (
                          <FaCheck className="text-green-600" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* API Quick Reference */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-mono text-sm text-emerald-600 mb-1">GET /search</p>
            <p className="text-sm text-gray-600">Search available transfers</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-mono text-sm text-emerald-600 mb-1">POST /quote</p>
            <p className="text-sm text-gray-600">Get a price quote</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-mono text-sm text-emerald-600 mb-1">POST /booking</p>
            <p className="text-sm text-gray-600">Create a new booking</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-mono text-sm text-emerald-600 mb-1">GET /booking/:id</p>
            <p className="text-sm text-gray-600">Get booking details</p>
          </div>
        </div>
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {newKey ? 'API Key Created' : 'Create API Key'}
            </h2>

            {newKey ? (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    Make sure to copy your API key now. You won't be able to see it again!
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm break-all mb-4">
                  {newKey}
                </div>
                <button
                  onClick={() => copyToClipboard(newKey, 'newKey')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  {copied === 'newKey' ? <FaCheck /> : <FaCopy />}
                  {copied === 'newKey' ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={() => setShowNewKeyModal(false)}
                  className="w-full mt-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Production Key"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={saving || !newKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                    Create
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Widget Modal */}
      {showNewWidgetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Widget</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget Type
                </label>
                <select
                  value={widgetForm.widgetType}
                  onChange={(e) => setWidgetForm({ ...widgetForm, widgetType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="SEARCH_FORM">Search Form Only</option>
                  <option value="FULL_BOOKING">Full Booking Flow</option>
                  <option value="QUOTE_ONLY">Quote Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={widgetForm.theme}
                  onChange={(e) => setWidgetForm({ ...widgetForm, theme: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="LIGHT">Light</option>
                  <option value="DARK">Dark</option>
                  <option value="AUTO">Auto (match system)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Domains (optional)
                </label>
                <input
                  type="text"
                  value={widgetForm.allowedDomains}
                  onChange={(e) => setWidgetForm({ ...widgetForm, allowedDomains: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="example.com, mysite.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of domains. Leave empty to allow all.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewWidgetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWidget}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                Create Widget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
