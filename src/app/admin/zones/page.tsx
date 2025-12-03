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

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [search, setSearch] = useState('');
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
        setZones(data.zones || data || []);
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

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search zones by name, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-500">Total: </span>
            <span className="font-bold">{zones.length}</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
            <span className="text-sm text-gray-500">Active: </span>
            <span className="font-bold text-green-600">{zones.filter(z => z.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Zones by City */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : Object.keys(groupedZones).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No zones found
          </div>
        ) : (
          Object.entries(groupedZones).map(([city, cityZones]) => (
            <div key={city} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium text-gray-900">
                  📍 {city}
                  <span className="ml-2 text-sm text-gray-500">({cityZones.length} zones)</span>
                </h3>
              </div>
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
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
      )}
    </div>
  );
}
