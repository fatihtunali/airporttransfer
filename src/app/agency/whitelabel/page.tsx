'use client';

import { useState, useEffect } from 'react';
import {
  FaPalette,
  FaGlobe,
  FaImage,
  FaSave,
  FaSpinner,
  FaEye,
  FaDesktop,
  FaMobile,
} from 'react-icons/fa';

interface WhiteLabelConfig {
  customDomain: string;
  subdomain: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
  tagline: string;
  footerText: string;
  contactEmail: string;
  contactPhone: string;
  showPoweredBy: boolean;
  showReviews: boolean;
  showSuppliers: boolean;
  metaTitle: string;
  metaDescription: string;
  googleAnalytics: string;
  facebookPixel: string;
}

const defaultConfig: WhiteLabelConfig = {
  customDomain: '',
  subdomain: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#0EA5E9',
  secondaryColor: '#64748B',
  accentColor: '#F59E0B',
  companyName: '',
  tagline: '',
  footerText: '',
  contactEmail: '',
  contactPhone: '',
  showPoweredBy: true,
  showReviews: true,
  showSuppliers: false,
  metaTitle: '',
  metaDescription: '',
  googleAnalytics: '',
  facebookPixel: '',
};

export default function AgencyWhiteLabel() {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'domain' | 'seo'>('branding');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/agency/whitelabel');
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...defaultConfig, ...data });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/agency/whitelabel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('Configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: keyof WhiteLabelConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">White Label Settings</h1>
          <p className="text-gray-600">Customize your branded booking experience</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: 'branding', label: 'Branding', icon: FaPalette },
                  { id: 'domain', label: 'Domain', icon: FaGlobe },
                  { id: 'seo', label: 'SEO & Tracking', icon: FaImage },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={config.companyName}
                      onChange={(e) => updateConfig('companyName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your Agency Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      value={config.tagline}
                      onChange={(e) => updateConfig('tagline', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your trusted transfer partner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={config.logoUrl}
                      onChange={(e) => updateConfig('logoUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://yoursite.com/logo.png"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig('primaryColor', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.accentColor}
                          onChange={(e) => updateConfig('accentColor', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.accentColor}
                          onChange={(e) => updateConfig('accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.showPoweredBy}
                        onChange={(e) => updateConfig('showPoweredBy', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">
                        Show "Powered by Airport Transfer Portal" in footer
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.showReviews}
                        onChange={(e) => updateConfig('showReviews', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">
                        Show customer reviews on search results
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={config.showSuppliers}
                        onChange={(e) => updateConfig('showSuppliers', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">
                        Show supplier names on search results
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Footer Text
                    </label>
                    <textarea
                      value={config.footerText}
                      onChange={(e) => updateConfig('footerText', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="© 2025 Your Agency. All rights reserved."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={config.contactEmail}
                        onChange={(e) => updateConfig('contactEmail', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="bookings@youragency.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={config.contactPhone}
                        onChange={(e) => updateConfig('contactPhone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Domain Tab */}
              {activeTab === 'domain' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">Domain Options</h3>
                    <p className="text-sm text-blue-700">
                      You can use a subdomain on our platform or connect your own custom domain.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subdomain
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={config.subdomain}
                        onChange={(e) => updateConfig('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="youragency"
                      />
                      <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500">
                        .airporttransferportal.com
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Only lowercase letters, numbers, and hyphens allowed
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom Domain
                    </label>
                    <input
                      type="text"
                      value={config.customDomain}
                      onChange={(e) => updateConfig('customDomain', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="transfers.youragency.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Add a CNAME record pointing to: custom.airporttransferportal.com
                    </p>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={config.metaTitle}
                      onChange={(e) => updateConfig('metaTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Book Airport Transfers | Your Agency Name"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {config.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={config.metaDescription}
                      onChange={(e) => updateConfig('metaDescription', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Book reliable airport transfers worldwide. Compare prices, read reviews, and book instantly."
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {config.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Favicon URL
                    </label>
                    <input
                      type="url"
                      value={config.faviconUrl}
                      onChange={(e) => updateConfig('faviconUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://yoursite.com/favicon.ico"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-900 mb-4">Tracking</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          value={config.googleAnalytics}
                          onChange={(e) => updateConfig('googleAnalytics', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="G-XXXXXXXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook Pixel ID
                        </label>
                        <input
                          type="text"
                          value={config.facebookPixel}
                          onChange={(e) => updateConfig('facebookPixel', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="XXXXXXXXXXXXXXXXX"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${
                    previewMode === 'desktop' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  <FaDesktop />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${
                    previewMode === 'mobile' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  <FaMobile />
                </button>
              </div>
            </div>

            {/* Mini Preview */}
            <div
              className={`border border-gray-200 rounded-lg overflow-hidden ${
                previewMode === 'mobile' ? 'max-w-[200px] mx-auto' : ''
              }`}
            >
              {/* Header Preview */}
              <div
                className="p-3"
                style={{ backgroundColor: config.primaryColor }}
              >
                <div className="flex items-center justify-between">
                  {config.logoUrl ? (
                    <img
                      src={config.logoUrl}
                      alt="Logo"
                      className="h-6 object-contain"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {config.companyName || 'Your Logo'}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-4 bg-gray-50">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs font-medium text-gray-900 mb-2">
                    {config.tagline || 'Book your transfer'}
                  </p>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full" />
                    <div className="h-2 bg-gray-200 rounded w-3/4" />
                  </div>
                  <button
                    className="mt-3 w-full py-1.5 text-white text-xs rounded"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Footer Preview */}
              <div
                className="p-2 text-center"
                style={{ backgroundColor: config.secondaryColor }}
              >
                <p className="text-white text-[8px]">
                  {config.footerText || '© 2025 Your Agency'}
                </p>
                {config.showPoweredBy && (
                  <p className="text-white/60 text-[6px] mt-0.5">
                    Powered by Airport Transfer Portal
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
          >
            <FaEye /> Preview Full Site
          </button>
        </div>
      </div>
    </div>
  );
}
