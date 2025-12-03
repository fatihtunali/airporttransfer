'use client';

import { useState, useEffect } from 'react';
import {
  FaPlane,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaSearch,
  FaSync,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';

interface Flight {
  id: number;
  bookingId: number;
  bookingCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  scheduledArrival: string;
  estimatedArrival: string | null;
  actualArrival: string | null;
  status: string;
  delayMinutes: number;
  terminal: string | null;
  gate: string | null;
  baggageClaim: string | null;
  customerName: string;
  pickupTime: string;
  pickupAdjusted: boolean;
}

const flightStatusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-500',
  DEPARTED: 'bg-blue-500',
  EN_ROUTE: 'bg-cyan-500',
  LANDED: 'bg-green-500',
  ARRIVED_GATE: 'bg-emerald-500',
  DELAYED: 'bg-orange-500',
  CANCELLED: 'bg-red-500',
  DIVERTED: 'bg-red-500',
  UNKNOWN: 'bg-gray-500',
};

const flightStatusLabels: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  DEPARTED: 'Departed',
  EN_ROUTE: 'En Route',
  LANDED: 'Landed',
  ARRIVED_GATE: 'At Gate',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled',
  DIVERTED: 'Diverted',
  UNKNOWN: 'Unknown',
};

export default function FlightTrackingPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dispatch/flights?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setFlights(data.flights || []);
      }
    } catch (error) {
      console.error('Failed to fetch flights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    const interval = setInterval(fetchFlights, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [filter]);

  const filteredFlights = flights.filter((flight) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        flight.flightNumber.toLowerCase().includes(query) ||
        flight.bookingCode.toLowerCase().includes(query) ||
        flight.customerName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getDelayClass = (delay: number) => {
    if (delay === 0) return 'text-green-400';
    if (delay < 30) return 'text-yellow-400';
    if (delay < 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Flight Tracking</h1>
          <p className="text-gray-400">Monitor flight status and auto-adjust pickups</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search flight or booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none w-64"
            />
          </div>

          <button
            onClick={fetchFlights}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaPlane className="text-cyan-400 text-xl" />
            <span className="text-2xl font-bold text-white">{flights.length}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Total Flights</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaCheckCircle className="text-green-400 text-xl" />
            <span className="text-2xl font-bold text-white">
              {flights.filter((f) => f.delayMinutes === 0).length}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-2">On Time</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaExclamationTriangle className="text-orange-400 text-xl" />
            <span className="text-2xl font-bold text-white">
              {flights.filter((f) => f.delayMinutes > 0).length}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Delayed</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaClock className="text-yellow-400 text-xl" />
            <span className="text-2xl font-bold text-white">
              {flights.filter((f) => f.status === 'EN_ROUTE').length}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-2">In Air</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All Flights' },
          { key: 'delayed', label: 'Delayed' },
          { key: 'arriving', label: 'Arriving Soon' },
          { key: 'landed', label: 'Landed' },
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

      {/* Flights Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFlights.length === 0 ? (
          <div className="col-span-full bg-gray-800 rounded-xl p-8 text-center">
            <FaPlane className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No flights to track</p>
          </div>
        ) : (
          filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className={`bg-gray-800 rounded-xl overflow-hidden border-l-4 ${
                flight.delayMinutes > 30
                  ? 'border-orange-500'
                  : flight.delayMinutes > 0
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="p-4">
                {/* Flight Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaPlane className="text-cyan-400" />
                    <span className="text-lg font-bold text-white">{flight.flightNumber}</span>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs text-white rounded ${
                      flightStatusColors[flight.status]
                    }`}
                  >
                    {flightStatusLabels[flight.status]}
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center">
                    <FaPlaneDeparture className="text-gray-500 mx-auto mb-1" />
                    <span className="text-sm font-mono text-gray-300">
                      {flight.departureAirport}
                    </span>
                  </div>
                  <div className="flex-1 border-t border-dashed border-gray-600"></div>
                  <div className="text-center">
                    <FaPlaneArrival className="text-cyan-400 mx-auto mb-1" />
                    <span className="text-sm font-mono text-white">
                      {flight.arrivalAirport}
                    </span>
                  </div>
                </div>

                {/* Times */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Scheduled</span>
                    <span className="text-white">{formatTime(flight.scheduledArrival)}</span>
                  </div>
                  {flight.estimatedArrival && flight.estimatedArrival !== flight.scheduledArrival && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated</span>
                      <span className={getDelayClass(flight.delayMinutes)}>
                        {formatTime(flight.estimatedArrival)}
                        {flight.delayMinutes > 0 && ` (+${flight.delayMinutes}m)`}
                      </span>
                    </div>
                  )}
                  {flight.actualArrival && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Actual</span>
                      <span className="text-green-400">{formatTime(flight.actualArrival)}</span>
                    </div>
                  )}
                </div>

                {/* Terminal Info */}
                {(flight.terminal || flight.gate || flight.baggageClaim) && (
                  <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-2 text-center">
                    {flight.terminal && (
                      <div>
                        <div className="text-xs text-gray-400">Terminal</div>
                        <div className="text-white font-medium">{flight.terminal}</div>
                      </div>
                    )}
                    {flight.gate && (
                      <div>
                        <div className="text-xs text-gray-400">Gate</div>
                        <div className="text-white font-medium">{flight.gate}</div>
                      </div>
                    )}
                    {flight.baggageClaim && (
                      <div>
                        <div className="text-xs text-gray-400">Baggage</div>
                        <div className="text-white font-medium">{flight.baggageClaim}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Booking Info */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-cyan-400">{flight.bookingCode}</span>
                      <div className="text-xs text-gray-400">{flight.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Pickup</div>
                      <div className="text-white">{formatTime(flight.pickupTime)}</div>
                      {flight.pickupAdjusted && (
                        <div className="text-xs text-orange-400">Adjusted</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {flight.delayMinutes > 15 && !flight.pickupAdjusted && (
                <div className="px-4 py-3 bg-orange-500/20 border-t border-orange-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-300">Pickup may need adjustment</span>
                    <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                      Adjust
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
