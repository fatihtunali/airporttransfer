'use client';

import { useState, useEffect } from 'react';
import {
  FaCar,
  FaPlane,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaFilter,
  FaSearch,
  FaSync,
  FaPhoneAlt,
  FaCheck,
  FaTimes,
  FaExchangeAlt,
} from 'react-icons/fa';

interface Ride {
  id: number;
  bookingId: number;
  publicCode: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  pickupAddress: string;
  dropoffAddress: string;
  airportName: string;
  zoneName: string;
  flightNumber: string | null;
  flightStatus: string | null;
  flightDelay: number | null;
  status: string;
  supplierName: string;
  driverName: string | null;
  driverPhone: string | null;
  driverEta: number | null;
  vehicleType: string;
  paxCount: number;
}

const statusColors: Record<string, string> = {
  PENDING_ASSIGN: 'bg-yellow-500',
  DRIVER_ASSIGNED: 'bg-blue-500',
  DRIVER_EN_ROUTE: 'bg-cyan-500',
  DRIVER_ARRIVED: 'bg-green-500',
  PASSENGER_PICKED_UP: 'bg-purple-500',
  IN_TRANSIT: 'bg-indigo-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  PENDING_ASSIGN: 'Pending Assignment',
  DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_EN_ROUTE: 'Driver En Route',
  DRIVER_ARRIVED: 'Driver Arrived',
  PASSENGER_PICKED_UP: 'Passenger Picked Up',
  IN_TRANSIT: 'In Transit',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function ActiveRidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dispatch/rides?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const filteredRides = rides.filter((ride) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ride.publicCode.toLowerCase().includes(query) ||
        ride.customerName.toLowerCase().includes(query) ||
        ride.driverName?.toLowerCase().includes(query) ||
        ride.flightNumber?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < -60) return 'Overdue';
    if (minutes < 0) return `${Math.abs(minutes)}m ago`;
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `in ${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Rides</h1>
          <p className="text-gray-400">Manage and monitor all rides</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search booking, customer, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none w-64"
            />
          </div>

          <button
            onClick={fetchRides}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'active', label: 'Active Rides' },
          { key: 'upcoming', label: 'Next 4 Hours' },
          { key: 'pending', label: 'Pending Assignment' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'delayed', label: 'Delayed Flights' },
          { key: 'all', label: 'All Today' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f.key
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rides List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Booking</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Time</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Customer</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Route</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Flight</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Driver</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No rides found
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                    className="hover:bg-gray-700/50 cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-cyan-400">{ride.publicCode}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        {ride.vehicleType} &bull; {ride.paxCount} pax
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white font-mono">{formatTime(ride.pickupTime)}</div>
                      <div className="text-xs text-gray-400">{formatDate(ride.pickupTime)}</div>
                      <div className="text-xs text-cyan-400">{getTimeUntil(ride.pickupTime)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-white">{ride.customerName}</div>
                      {ride.customerPhone && (
                        <a
                          href={`tel:${ride.customerPhone}`}
                          className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaPhoneAlt className="w-3 h-3" />
                          {ride.customerPhone}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{ride.airportName}</div>
                      <div className="text-xs text-gray-400">{ride.zoneName}</div>
                    </td>
                    <td className="px-4 py-4">
                      {ride.flightNumber ? (
                        <div>
                          <div className="flex items-center gap-1 text-white">
                            <FaPlane className="w-3 h-3 text-gray-500" />
                            {ride.flightNumber}
                          </div>
                          {ride.flightDelay && ride.flightDelay > 0 && (
                            <div className="text-xs text-orange-400">+{ride.flightDelay}m</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {ride.driverName ? (
                        <div>
                          <div className="text-white">{ride.driverName}</div>
                          {ride.driverEta && (
                            <div className="text-xs text-cyan-400">ETA: {ride.driverEta}m</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-yellow-400 text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 text-xs text-white rounded ${
                          statusColors[ride.status] || 'bg-gray-500'
                        }`}
                      >
                        {statusLabels[ride.status] || ride.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {ride.status === 'PENDING_ASSIGN' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle assign driver
                            }}
                            className="p-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                            title="Assign Driver"
                          >
                            <FaUser className="w-4 h-4" />
                          </button>
                        )}
                        {ride.driverName && ride.status !== 'COMPLETED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle reassign
                            }}
                            className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                            title="Reassign Driver"
                          >
                            <FaExchangeAlt className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Ride Details</h2>
                <span className="font-mono text-cyan-400">{selectedRide.publicCode}</span>
              </div>
              <button
                onClick={() => setSelectedRide(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={`px-3 py-1 text-white rounded ${
                    statusColors[selectedRide.status]
                  }`}
                >
                  {statusLabels[selectedRide.status]}
                </span>
              </div>

              {/* Pickup Info */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Pickup Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">
                      {formatTime(selectedRide.pickupTime)} - {formatDate(selectedRide.pickupTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">From</span>
                    <span className="text-white">{selectedRide.airportName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">To</span>
                    <span className="text-white">{selectedRide.zoneName}</span>
                  </div>
                  {selectedRide.flightNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Flight</span>
                      <span className="text-white">{selectedRide.flightNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Customer</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span className="text-white">{selectedRide.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone</span>
                    <a href={`tel:${selectedRide.customerPhone}`} className="text-cyan-400">
                      {selectedRide.customerPhone}
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Passengers</span>
                    <span className="text-white">{selectedRide.paxCount}</span>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Driver & Supplier</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Supplier</span>
                    <span className="text-white">{selectedRide.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Driver</span>
                    <span className="text-white">
                      {selectedRide.driverName || 'Not assigned'}
                    </span>
                  </div>
                  {selectedRide.driverPhone && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Driver Phone</span>
                      <a href={`tel:${selectedRide.driverPhone}`} className="text-cyan-400">
                        {selectedRide.driverPhone}
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vehicle</span>
                    <span className="text-white">{selectedRide.vehicleType}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                  Contact Customer
                </button>
                {selectedRide.driverName && (
                  <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    Contact Driver
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
