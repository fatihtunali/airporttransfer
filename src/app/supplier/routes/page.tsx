'use client';

import { useState, useEffect } from 'react';
import {
  FaRoute,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaMapMarkerAlt,
  FaPlane,
  FaArrowRight,
} from 'react-icons/fa';

interface Route {
  id: number;
  airportId: number;
  zoneId: number | null;
  destinationName: string | null;
  destinationAddress: string | null;
  direction: string;
  distanceKm: number | null;
  durationMin: number | null;
  airportCode: string;
  airportName: string;
  airportCity: string;
  zoneName: string | null;
  zoneCity: string | null;
  isActive: boolean;
}

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Zone {
  id: number;
  name: string;
  city: string;
}

interface ServiceZone {
  id: number;
  airportId: number;
  airportCode: string;
  airportName: string;
  airportCity: string;
  maxDistanceKm: number | null;
}

export default function SupplierRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [serviceZones, setServiceZones] = useState<ServiceZone[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    airportId: '',
    zoneId: '',
    destinationName: '',
    destinationAddress: '',
    distanceKm: '',
    durationMin: '',
    direction: 'BOTH',
  });
  const [useCustomDestination, setUseCustomDestination] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesRes, zonesRes, serviceZonesRes] = await Promise.all([
        fetch('/api/supplier/routes'),
        fetch('/api/zones'),
        fetch('/api/supplier/zones'),
      ]);

      if (routesRes.ok) {
        const data = await routesRes.json();
        setRoutes(data);
      }

      if (zonesRes.ok) {
        const data = await zonesRes.json();
        setZones(data);
      }

      if (serviceZonesRes.ok) {
        const data = await serviceZonesRes.json();
        setServiceZones(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      airportId: '',
      zoneId: '',
      destinationName: '',
      destinationAddress: '',
      distanceKm: '',
      durationMin: '',
      direction: 'BOTH',
    });
    setUseCustomDestination(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/supplier/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airportId: parseInt(formData.airportId),
          zoneId: useCustomDestination ? null : (formData.zoneId ? parseInt(formData.zoneId) : null),
          destinationName: useCustomDestination ? formData.destinationName : null,
          destinationAddress: formData.destinationAddress || null,
          distanceKm: formData.distanceKm ? parseFloat(formData.distanceKm) : null,
          durationMin: formData.durationMin ? parseInt(formData.durationMin) : null,
          direction: formData.direction,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create route');
      }
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to create route');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (routeId: number) => {
    if (!confirm('Are you sure you want to delete this route? All associated tariffs will also be removed.')) return;

    setDeleting(routeId);
    try {
      const res = await fetch(`/api/supplier/routes/${routeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete route');
      }
    } catch (error) {
      console.error('Error deleting route:', error);
    } finally {
      setDeleting(null);
    }
  };

  // Get zones for selected airport
  const selectedAirportId = formData.airportId ? parseInt(formData.airportId) : null;
  const filteredZones = selectedAirportId
    ? zones.filter((z) => {
        const serviceZone = serviceZones.find((sz) => sz.airportId === selectedAirportId);
        if (!serviceZone) return false;
        // Show zones in the same city as the airport
        return z.city === serviceZone.airportCity;
      })
    : [];

  // Group routes by airport
  const groupedRoutes = routes.reduce((acc, route) => {
    const key = route.airportCode;
    if (!acc[key]) {
      acc[key] = {
        airportCode: route.airportCode,
        airportName: route.airportName,
        airportCity: route.airportCity,
        routes: [],
      };
    }
    acc[key].routes.push(route);
    return acc;
  }, {} as Record<string, { airportCode: string; airportName: string; airportCity: string; routes: Route[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Routes</h1>
          <p className="text-gray-600">Define the routes you service</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={serviceZones.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPlus /> Add Route
        </button>
      </div>

      {/* Service zones reminder */}
      {serviceZones.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800">
            <strong>No service zones configured.</strong> Please add your service zones first before creating routes.{' '}
            <a href="/supplier/zones" className="text-yellow-900 underline hover:no-underline">
              Go to Service Zones
            </a>
          </p>
        </div>
      )}

      {/* Routes List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading routes...</p>
        </div>
      ) : Object.keys(groupedRoutes).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaRoute className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No routes configured yet</p>
          {serviceZones.length > 0 && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
            >
              <FaPlus /> Add Your First Route
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedRoutes).map((group) => (
            <div
              key={group.airportCode}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FaPlane className="text-sky-500" />
                  <span className="font-semibold text-gray-900">
                    {group.airportCode} - {group.airportName}
                  </span>
                  <span className="text-gray-500">({group.airportCity})</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {group.routes.map((route) => (
                  <div
                    key={route.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <FaMapMarkerAlt className="text-sky-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {route.zoneName || route.destinationName}
                        </p>
                        {route.destinationAddress && (
                          <p className="text-sm text-gray-500">{route.destinationAddress}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          {route.distanceKm && (
                            <span>{route.distanceKm} km</span>
                          )}
                          {route.durationMin && (
                            <span>{route.durationMin} min</span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {route.direction === 'BOTH'
                              ? 'Both ways'
                              : route.direction === 'FROM_AIRPORT'
                              ? 'From airport'
                              : 'To airport'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(route.id)}
                      disabled={deleting === route.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === route.id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Route</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Airport Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Airport *
                </label>
                <select
                  value={formData.airportId}
                  onChange={(e) => {
                    setFormData({ ...formData, airportId: e.target.value, zoneId: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                >
                  <option value="">Select an airport</option>
                  {serviceZones.map((sz) => (
                    <option key={sz.id} value={sz.airportId}>
                      {sz.airportCode} - {sz.airportName} ({sz.airportCity})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Only airports from your service zones are available
                </p>
              </div>

              {/* Destination Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomDestination(false)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      !useCustomDestination
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Select from zones
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomDestination(true)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      useCustomDestination
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Custom destination
                  </button>
                </div>
              </div>

              {/* Zone Selection or Custom Destination */}
              {!useCustomDestination ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zone *
                  </label>
                  <select
                    value={formData.zoneId}
                    onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required={!useCustomDestination}
                    disabled={!formData.airportId}
                  >
                    <option value="">Select a zone</option>
                    {filteredZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({zone.city})
                      </option>
                    ))}
                  </select>
                  {formData.airportId && filteredZones.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No zones found for this airport's city. Use custom destination instead.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Name *
                    </label>
                    <input
                      type="text"
                      value={formData.destinationName}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g., Downtown, City Center, Hotel District"
                      required={useCustomDestination}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.destinationAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, destinationAddress: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Specific address or area"
                    />
                  </div>
                </div>
              )}

              {/* Distance and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    value={formData.distanceKm}
                    onChange={(e) =>
                      setFormData({ ...formData, distanceKm: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    step="0.1"
                    min="0"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMin}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMin: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    min="0"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction
                </label>
                <select
                  value={formData.direction}
                  onChange={(e) =>
                    setFormData({ ...formData, direction: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="BOTH">Both ways (arrival & departure)</option>
                  <option value="FROM_AIRPORT">From airport only</option>
                  <option value="TO_AIRPORT">To airport only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Add Route'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
