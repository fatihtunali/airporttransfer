'use client';

import { useState, useEffect } from 'react';

interface Zone {
  id: number;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  routeCount: number;
}

interface SupplierDestination {
  name: string;
  address: string | null;
  city: string;
  country: string;
  supplierCount: number;
  routeCount: number;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [supplierDestinations, setSupplierDestinations] = useState<SupplierDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [search, setSearch] = useState('');
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'official' | 'supplier'>('official');
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const res = await fetch('/api/admin/zones');
      if (res.ok) {
        const data = await res.json();
        setZones(data.zones || []);
        setSupplierDestinations(data.supplierDestinations || []);
      }
    } catch (error) {
      console.error('Load zones error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingZone
        ? `/api/admin/zones/${editingZone.id}`
        : '/api/admin/zones';
      const method = editingZone ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (res.ok) {
        loadZones();
        closeModal();
      }
    } catch (error) {
      console.error('Save zone error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (zone: Zone) => {
    try {
      const res = await fetch(`/api/admin/zones/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !zone.isActive }),
      });
      if (res.ok) {
        loadZones();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const openModal = (zone?: Zone) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        city: zone.city,
        country: zone.country,
        latitude: zone.latitude?.toString() || '',
        longitude: zone.longitude?.toString() || '',
      });
    } else {
      setEditingZone(null);
      setFormData({
        name: '',
        city: '',
        country: '',
        latitude: '',
        longitude: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingZone(null);
    setFormData({
      name: '',
      city: '',
      country: '',
      latitude: '',
      longitude: '',
    });
  };

  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(search.toLowerCase()) ||
    z.city.toLowerCase().includes(search.toLowerCase()) ||
    z.country.toLowerCase().includes(search.toLowerCase())
  );

  // Group zones by city
  const groupedZones = filteredZones.reduce((acc, zone) => {
    const key = `${zone.city}, ${zone.country}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(zone);
    return acc;
  }, {} as Record<string, Zone[]>);

  const toggleCity = (city: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(city)) {
      newExpanded.delete(city);
    } else {
      newExpanded.add(city);
    }
    setExpandedCities(newExpanded);
  };

  const expandAll = () => {
    setExpandedCities(new Set(Object.keys(groupedZones)));
  };

  const collapseAll = () => {
    setExpandedCities(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Zones</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Zone
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('official')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'official'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Official Zones ({zones.length})
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'supplier'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Supplier Destinations ({supplierDestinations.length})
          {supplierDestinations.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
              New
            </span>
          )}
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder={activeTab === 'official' ? "Search zones..." : "Search destinations..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Collapse All
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-sm">
            <span className="text-gray-500">Cities: </span>
            <span className="font-bold">{Object.keys(groupedZones).length}</span>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-sm">
            <span className="text-gray-500">{activeTab === 'official' ? 'Zones' : 'Dest.'}: </span>
            <span className="font-bold">{activeTab === 'official' ? zones.length : supplierDestinations.length}</span>
          </div>
          {activeTab === 'official' && (
            <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-sm">
              <span className="text-gray-500">Active: </span>
              <span className="font-bold text-green-600">{zones.filter(z => z.isActive).length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : activeTab === 'official' ? (
          /* Official Zones Tab */
          Object.keys(groupedZones).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              No zones found
            </div>
          ) : (
            Object.entries(groupedZones).map(([city, cityZones]) => (
              <div key={city} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleCity(city)}
                  className="w-full bg-gray-50 px-4 py-3 border-b flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <span className={`transform transition-transform ${expandedCities.has(city) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    {city}
                    <span className="ml-2 text-sm text-gray-500">({cityZones.length} zones)</span>
                  </h3>
                  <span className="text-sm text-gray-400">
                    {expandedCities.has(city) ? 'Click to collapse' : 'Click to expand'}
                  </span>
                </button>
                {expandedCities.has(city) && (
                  <div className="divide-y">
                    {cityZones.map((zone) => (
                      <div key={zone.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{zone.name}</p>
                          {zone.routeCount !== undefined && (
                            <p className="text-xs text-gray-500">{zone.routeCount} routes</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {zone.isActive ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Inactive
                            </span>
                          )}
                          <button
                            onClick={() => openModal(zone)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(zone)}
                            className={`px-3 py-1 text-sm rounded ${
                              zone.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {zone.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          /* Supplier Destinations Tab */
          supplierDestinations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              <p className="mb-2">No custom supplier destinations found</p>
              <p className="text-sm">When suppliers add routes with custom destinations (not linked to official zones), they will appear here.</p>
            </div>
          ) : (
            (() => {
              // Filter and group supplier destinations
              const filteredDestinations = supplierDestinations.filter(d =>
                d.name.toLowerCase().includes(search.toLowerCase()) ||
                d.city.toLowerCase().includes(search.toLowerCase()) ||
                d.country.toLowerCase().includes(search.toLowerCase())
              );
              const groupedDestinations = filteredDestinations.reduce((acc, dest) => {
                const key = `${dest.city}, ${dest.country}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(dest);
                return acc;
              }, {} as Record<string, SupplierDestination[]>);

              return Object.entries(groupedDestinations).map(([city, destinations]) => (
                <div key={city} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleCity(city)}
                    className="w-full bg-orange-50 px-4 py-3 border-b flex items-center justify-between hover:bg-orange-100 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <span className={`transform transition-transform ${expandedCities.has(city) ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      {city}
                      <span className="ml-2 text-sm text-gray-500">({destinations.length} destinations)</span>
                    </h3>
                    <span className="text-sm text-gray-400">
                      {expandedCities.has(city) ? 'Click to collapse' : 'Click to expand'}
                    </span>
                  </button>
                  {expandedCities.has(city) && (
                    <div className="divide-y">
                      {destinations.map((dest, idx) => (
                        <div key={`${dest.name}-${idx}`} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{dest.name}</p>
                            {dest.address && (
                              <p className="text-xs text-gray-500">{dest.address}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {dest.supplierCount} supplier{dest.supplierCount !== 1 ? 's' : ''} • {dest.routeCount} route{dest.routeCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Supplier Added
                            </span>
                            <button
                              onClick={() => {
                                setFormData({
                                  name: dest.name,
                                  city: dest.city,
                                  country: dest.country,
                                  latitude: '',
                                  longitude: '',
                                });
                                setEditingZone(null);
                                setShowModal(true);
                              }}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Make Official
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ));
            })()
          )
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-16">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingZone ? 'Edit Zone' : 'Add Zone'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Sultanahmet, Belek, Side"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="36.8500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="31.0200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingZone ? 'Update Zone' : 'Add Zone'}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
