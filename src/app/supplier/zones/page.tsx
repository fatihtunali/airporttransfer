'use client';

import { useState, useEffect } from 'react';
import {
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaPlane,
  FaSearch,
  FaCheck,
  FaGlobe,
} from 'react-icons/fa';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface ServiceZone {
  id: number;
  airportId: number;
  airportCode: string;
  airportName: string;
  airportCity: string;
  airportCountry: string;
  maxDistanceKm: number;
  isActive: boolean;
}

export default function SupplierZones() {
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAirports, setSelectedAirports] = useState<number[]>([]);
  const [maxDistance, setMaxDistance] = useState(100);

  useEffect(() => {
    fetchZones();
    fetchAirports();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/supplier/zones');
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirports = async () => {
    try {
      const res = await fetch('/api/public/airports?limit=1000');
      if (res.ok) {
        const data = await res.json();
        setAirports(data.airports || data);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const openAddModal = () => {
    setSelectedAirports([]);
    setMaxDistance(100);
    setSearchTerm('');
    setShowModal(true);
  };

  const toggleAirport = (airportId: number) => {
    setSelectedAirports((prev) =>
      prev.includes(airportId)
        ? prev.filter((id) => id !== airportId)
        : [...prev, airportId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAirports.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/supplier/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airportIds: selectedAirports,
          maxDistanceKm: maxDistance,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        fetchZones();
      }
    } catch (error) {
      console.error('Error saving zones:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (zoneId: number) => {
    if (!confirm('Are you sure you want to remove this service zone?')) return;

    try {
      const res = await fetch(`/api/supplier/zones/${zoneId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchZones();
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
    }
  };

  const handleToggleActive = async (zone: ServiceZone) => {
    try {
      const res = await fetch(`/api/supplier/zones/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !zone.isActive }),
      });
      if (res.ok) {
        fetchZones();
      }
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  const handleUpdateDistance = async (zone: ServiceZone, newDistance: number) => {
    try {
      const res = await fetch(`/api/supplier/zones/${zone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDistanceKm: newDistance }),
      });
      if (res.ok) {
        fetchZones();
      }
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  // Filter airports by search term and exclude already added ones
  const existingAirportIds = zones.map((z) => z.airportId);
  const filteredAirports = airports.filter(
    (airport) =>
      !existingAirportIds.includes(airport.id) &&
      (airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group zones by country
  const groupedZones = zones.reduce((acc, zone) => {
    const country = zone.airportCountry || 'Other';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(zone);
    return acc;
  }, {} as Record<string, ServiceZone[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Zones</h1>
          <p className="text-gray-600">
            Define the airports and regions you serve
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FaPlus /> Add Airports
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FaGlobe className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">How Service Zones Work</p>
            <p className="text-blue-700 text-sm mt-1">
              Select the airports you can service and set your maximum coverage
              distance. You will receive booking requests for transfers
              within your service zones.
            </p>
          </div>
        </div>
      </div>

      {/* Zones List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading service zones...</p>
        </div>
      ) : zones.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaMapMarkerAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No service zones configured</p>
          <p className="text-gray-500 text-sm mb-6">
            Add airports you can service to start receiving bookings
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaPlus /> Add Your First Airport
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedZones).map(([country, countryZones]) => (
            <div
              key={country}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{country}</h3>
              </div>

              <div className="divide-y divide-gray-100">
                {countryZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-sky-100 rounded-lg">
                        <FaPlane className="text-sky-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-600">
                            {zone.airportCode}
                          </span>
                          <span className="font-medium text-gray-900">
                            {zone.airportName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {zone.airportCity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Distance Control */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Coverage:</span>
                        <select
                          value={zone.maxDistanceKm}
                          onChange={(e) =>
                            handleUpdateDistance(zone, parseInt(e.target.value))
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value={25}>25 km</option>
                          <option value={50}>50 km</option>
                          <option value={75}>75 km</option>
                          <option value={100}>100 km</option>
                          <option value={150}>150 km</option>
                          <option value={200}>200 km</option>
                          <option value={300}>300 km</option>
                          <option value={500}>500 km</option>
                        </select>
                      </div>

                      {/* Active Toggle */}
                      <button
                        onClick={() => handleToggleActive(zone)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          zone.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Airports Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Add Service Airports
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search airports by name, code, city or country..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Airport List */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredAirports.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {searchTerm
                      ? 'No airports found matching your search'
                      : 'All available airports have been added'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredAirports.map((airport) => (
                      <div
                        key={airport.id}
                        onClick={() => toggleAirport(airport.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAirports.includes(airport.id)
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center ${
                                selectedAirports.includes(airport.id)
                                  ? 'bg-sky-500 border-sky-500'
                                  : 'border-gray-300'
                              }`}
                            >
                              {selectedAirports.includes(airport.id) && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sky-600">
                                  {airport.code}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {airport.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {airport.city}, {airport.country}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Default Coverage:
                    </label>
                    <select
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={75}>75 km</option>
                      <option value={100}>100 km</option>
                      <option value={150}>150 km</option>
                      <option value={200}>200 km</option>
                      <option value={300}>300 km</option>
                      <option value={500}>500 km</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedAirports.length} airport
                      {selectedAirports.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || selectedAirports.length === 0}
                      className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <FaPlus /> Add Airports
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
