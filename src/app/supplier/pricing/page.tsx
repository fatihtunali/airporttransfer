'use client';

import { useState, useEffect } from 'react';
import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaMapMarkerAlt,
  FaCar,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';

interface Tariff {
  id: number;
  routeId: number;
  airportCode: string;
  airportName: string;
  zoneName: string;
  vehicleType: string;
  currency: string;
  basePrice: number;
  pricePerPax: number | null;
  minPax: number;
  maxPax: number | null;
  isActive: boolean;
}

interface Route {
  id: number;
  airportCode: string;
  airportName: string;
  zoneName: string;
}

const vehicleTypes = ['SEDAN', 'VAN', 'MINIBUS', 'BUS', 'VIP'];

export default function SupplierPricing() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [formData, setFormData] = useState({
    routeId: '',
    vehicleType: 'SEDAN',
    currency: 'EUR',
    basePrice: 0,
    pricePerPax: 0,
    minPax: 1,
    maxPax: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('');

  useEffect(() => {
    fetchTariffs();
    fetchRoutes();
  }, []);

  const fetchTariffs = async () => {
    try {
      // Fetch with higher page size to get all tariffs
      const res = await fetch('/api/supplier/tariffs?pageSize=500');
      if (res.ok) {
        const data = await res.json();
        // Handle both array and paginated response formats
        setTariffs(Array.isArray(data) ? data : (data.items || []));
      }
    } catch (error) {
      console.error('Error fetching tariffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      // Fetch system routes available for pricing (based on supplier's service zones)
      const res = await fetch('/api/supplier/routes/for-pricing');
      if (res.ok) {
        const data = await res.json();
        // Handle both array and paginated response formats
        const routesArray = Array.isArray(data) ? data : (data.items || []);
        setRoutes(routesArray.map((r: { id: number; airportCode: string; airportName: string; zoneName: string }) => ({
          id: r.id,
          airportCode: r.airportCode,
          airportName: r.airportName,
          zoneName: r.zoneName,
        })));
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const openAddModal = () => {
    setEditingTariff(null);
    setFormData({
      routeId: '',
      vehicleType: 'SEDAN',
      currency: 'EUR',
      basePrice: 0,
      pricePerPax: 0,
      minPax: 1,
      maxPax: '',
    });
    setShowModal(true);
  };

  const openEditModal = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setFormData({
      routeId: tariff.routeId.toString(),
      vehicleType: tariff.vehicleType,
      currency: tariff.currency,
      basePrice: tariff.basePrice,
      pricePerPax: tariff.pricePerPax || 0,
      minPax: tariff.minPax,
      maxPax: tariff.maxPax?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingTariff
        ? `/api/supplier/tariffs/${editingTariff.id}`
        : '/api/supplier/tariffs';
      const method = editingTariff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          routeId: parseInt(formData.routeId),
          maxPax: formData.maxPax ? parseInt(formData.maxPax) : null,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setError(null);
        fetchTariffs();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save tariff');
      }
    } catch (err) {
      console.error('Error saving tariff:', err);
      setError('Failed to save tariff. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tariffId: number) => {
    if (!confirm('Are you sure you want to delete this tariff?')) return;

    try {
      const res = await fetch(`/api/supplier/tariffs/${tariffId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchTariffs();
      }
    } catch (error) {
      console.error('Error deleting tariff:', error);
    }
  };

  // Filter tariffs based on search and vehicle filter
  const filteredTariffs = tariffs.filter(tariff => {
    const matchesSearch = searchTerm === '' ||
      tariff.airportCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.airportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.zoneName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVehicle = vehicleFilter === '' || tariff.vehicleType === vehicleFilter;

    return matchesSearch && matchesVehicle;
  });

  const groupedTariffs = filteredTariffs.reduce((acc, tariff) => {
    const key = `${tariff.airportCode}-${tariff.zoneName}`;
    if (!acc[key]) {
      acc[key] = {
        airportCode: tariff.airportCode,
        airportName: tariff.airportName,
        zoneName: tariff.zoneName,
        tariffs: [],
      };
    }
    acc[key].tariffs.push(tariff);
    return acc;
  }, {} as Record<string, { airportCode: string; airportName: string; zoneName: string; tariffs: Tariff[] }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
          <p className="text-gray-600">
            Manage your route pricing
            {!loading && (
              <span className="ml-2 px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                {tariffs.length} tariffs total
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FaPlus /> Add Tariff
        </button>
      </div>

      {/* Search and Filter */}
      {!loading && tariffs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by airport code, name or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="">All Vehicle Types</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          {(searchTerm || vehicleFilter) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {filteredTariffs.length} of {tariffs.length} tariffs
              </span>
              <button
                onClick={() => { setSearchTerm(''); setVehicleFilter(''); }}
                className="text-sky-600 hover:text-sky-700 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tariffs by Route */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      ) : Object.keys(groupedTariffs).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaTags className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No pricing configured yet</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaPlus /> Add Your First Tariff
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedTariffs).map((group) => (
            <div
              key={`${group.airportCode}-${group.zoneName}`}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-sky-500" />
                  <span className="font-semibold text-gray-900">
                    {group.airportCode} - {group.airportName}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700">{group.zoneName}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vehicle Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Base Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Per Pax
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Capacity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.tariffs.map((tariff) => (
                      <tr key={tariff.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaCar className="text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {tariff.vehicleType}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900">
                            {tariff.currency} {tariff.basePrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {tariff.pricePerPax
                            ? `+${tariff.currency} ${tariff.pricePerPax.toFixed(2)}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {tariff.minPax}
                          {tariff.maxPax ? ` - ${tariff.maxPax}` : '+'} pax
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              tariff.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {tariff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditModal(tariff)}
                            className="text-gray-400 hover:text-sky-600 mr-3"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(tariff.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTariff ? 'Edit Tariff' : 'Add Tariff'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setError(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route *
                </label>
                {routes.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                    No routes available. Please contact the administrator to add routes to the system.
                  </div>
                ) : null}
                <select
                  value={formData.routeId}
                  onChange={(e) =>
                    setFormData({ ...formData, routeId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                  disabled={!!editingTariff}
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.airportCode} - {route.airportName} → {route.zoneName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={!!editingTariff}
                  >
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price *
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basePrice: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Per Extra Pax
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerPax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerPax: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Passengers
                  </label>
                  <input
                    type="number"
                    value={formData.minPax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPax: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Passengers
                  </label>
                  <input
                    type="number"
                    value={formData.maxPax}
                    onChange={(e) =>
                      setFormData({ ...formData, maxPax: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(null); }}
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
                    'Save Tariff'
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
