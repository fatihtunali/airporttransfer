'use client';

import { useState, useEffect } from 'react';

interface Route {
  id: number;
  airportId: number;
  airportCode: string;
  airportName: string;
  zoneId: number;
  zoneName: string;
  zoneCity: string;
  direction: string;
  approxDistanceKm: number;
  approxDurationMin: number;
  isActive: boolean;
}

interface Airport {
  id: number;
  code: string;
  name: string;
}

interface Zone {
  id: number;
  name: string;
  city: string;
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [filterAirport, setFilterAirport] = useState('');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    airportId: '',
    zoneId: '',
    direction: 'BOTH',
    approxDistanceKm: '',
    approxDurationMin: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routesRes, airportsRes, zonesRes] = await Promise.all([
        fetch('/api/admin/routes'),
        fetch('/api/admin/airports'),
        fetch('/api/admin/zones'),
      ]);

      if (routesRes.ok) {
        const data = await routesRes.json();
        setRoutes(data.routes || data || []);
      }
      if (airportsRes.ok) {
        const data = await airportsRes.json();
        setAirports(data.airports || data || []);
      }
      if (zonesRes.ok) {
        const data = await zonesRes.json();
        setZones(data.zones || data || []);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingRoute
        ? `/api/admin/routes/${editingRoute.id}`
        : '/api/admin/routes';
      const method = editingRoute ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airportId: parseInt(formData.airportId),
          zoneId: parseInt(formData.zoneId),
          direction: formData.direction,
          approxDistanceKm: formData.approxDistanceKm ? parseFloat(formData.approxDistanceKm) : null,
          approxDurationMin: formData.approxDurationMin ? parseInt(formData.approxDurationMin) : null,
        }),
      });

      if (res.ok) {
        loadData();
        closeModal();
      }
    } catch (error) {
      console.error('Save route error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (route: Route) => {
    try {
      const res = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !route.isActive }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  const handleDelete = async (route: Route) => {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
      const res = await fetch(`/api/admin/routes/${route.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Delete route error:', error);
    }
  };

  const openModal = (route?: Route) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        airportId: route.airportId.toString(),
        zoneId: route.zoneId.toString(),
        direction: route.direction,
        approxDistanceKm: route.approxDistanceKm?.toString() || '',
        approxDurationMin: route.approxDurationMin?.toString() || '',
      });
    } else {
      setEditingRoute(null);
      setFormData({
        airportId: '',
        zoneId: '',
        direction: 'BOTH',
        approxDistanceKm: '',
        approxDurationMin: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRoute(null);
  };

  const filteredRoutes = routes.filter(r => {
    const matchesAirport = !filterAirport || r.airportId.toString() === filterAirport;
    const matchesSearch = !search ||
      r.airportCode.toLowerCase().includes(search.toLowerCase()) ||
      r.zoneName.toLowerCase().includes(search.toLowerCase()) ||
      r.zoneCity.toLowerCase().includes(search.toLowerCase());
    return matchesAirport && matchesSearch;
  });

  const getDirectionLabel = (direction: string) => {
    switch (direction) {
      case 'FROM_AIRPORT': return '← From Airport';
      case 'TO_AIRPORT': return '→ To Airport';
      case 'BOTH': return '↔ Both Ways';
      default: return direction;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Route
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-64">
          <select
            value={filterAirport}
            onChange={(e) => setFilterAirport(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Airports</option>
            {airports.map((airport) => (
              <option key={airport.id} value={airport.id}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Routes</p>
          <p className="text-2xl font-bold">{routes.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{routes.filter(r => r.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Airports</p>
          <p className="text-2xl font-bold text-blue-600">{airports.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Zones</p>
          <p className="text-2xl font-bold text-purple-600">{zones.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No routes found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Airport</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-blue-600">{route.airportCode}</span>
                      <p className="text-xs text-gray-500">{route.airportName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{route.zoneName}</p>
                      <p className="text-xs text-gray-500">{route.zoneCity}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm ${
                        route.direction === 'BOTH' ? 'text-purple-600' :
                        route.direction === 'FROM_AIRPORT' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {getDirectionLabel(route.direction)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">
                        {route.approxDistanceKm ? `${route.approxDistanceKm} km` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">
                        {route.approxDurationMin ? `${route.approxDurationMin} min` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {route.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(route)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(route)}
                          className={`px-3 py-1 text-sm rounded ${
                            route.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {route.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleDelete(route)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingRoute ? 'Edit Route' : 'Add Route'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airport *
                </label>
                <select
                  value={formData.airportId}
                  onChange={(e) => setFormData({ ...formData, airportId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Airport</option>
                  {airports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.code} - {airport.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone *
                </label>
                <select
                  value={formData.zoneId}
                  onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} ({zone.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction *
                </label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="BOTH">Both Ways</option>
                  <option value="FROM_AIRPORT">From Airport Only</option>
                  <option value="TO_AIRPORT">To Airport Only</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.approxDistanceKm}
                    onChange={(e) => setFormData({ ...formData, approxDistanceKm: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.approxDurationMin}
                    onChange={(e) => setFormData({ ...formData, approxDurationMin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="60"
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
                  {saving ? 'Saving...' : editingRoute ? 'Update Route' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
