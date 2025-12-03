'use client';

import { useState, useEffect } from 'react';
import {
  FaCar,
  FaUser,
  FaMapMarkerAlt,
  FaClock,
  FaFilter,
  FaSearch,
  FaSync,
} from 'react-icons/fa';

interface DriverLocation {
  id: number;
  driverId: number;
  driverName: string;
  supplierName: string;
  status: string;
  latitude: number;
  longitude: number;
  heading: number;
  currentRideId: number | null;
  currentBookingCode: string | null;
  eta: number | null;
}

interface RideMarker {
  id: number;
  bookingCode: string;
  type: 'pickup' | 'dropoff';
  latitude: number;
  longitude: number;
  time: string;
  status: string;
}

const statusColors: Record<string, string> = {
  ONLINE: 'bg-green-500',
  ON_TRIP: 'bg-blue-500',
  OFFLINE: 'bg-gray-500',
  BREAK: 'bg-yellow-500',
};

export default function LiveMapPage() {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [rides, setRides] = useState<RideMarker[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverLocation | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/dispatch/locations');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || []);
        setRides(data.rides || []);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = drivers.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        d.driverName.toLowerCase().includes(query) ||
        d.supplierName.toLowerCase().includes(query) ||
        d.currentBookingCode?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const driverCounts = {
    all: drivers.length,
    ONLINE: drivers.filter((d) => d.status === 'ONLINE').length,
    ON_TRIP: drivers.filter((d) => d.status === 'ON_TRIP').length,
    OFFLINE: drivers.filter((d) => d.status === 'OFFLINE').length,
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Map Area */}
      <div className="flex-1 bg-gray-900 relative">
        {/* Map Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <FaMapMarkerAlt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Live Map View</p>
            <p className="text-gray-500 text-sm mt-2">
              Google Maps integration required
            </p>
            <p className="text-gray-600 text-xs mt-4">
              Showing {filteredDrivers.length} drivers, {rides.length} active pickups
            </p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <button
            onClick={fetchLocations}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800 rounded-lg p-4 shadow-lg">
          <h3 className="text-sm font-medium text-white mb-2">Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-300">Online Driver</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm text-gray-300">On Trip</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
              <span className="text-sm text-gray-300">Pickup Point</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-sm text-gray-300">Dropoff Point</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver or booking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            {(['all', 'ONLINE', 'ON_TRIP', 'OFFLINE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === status
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')} (
                {driverCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Driver List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDrivers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <FaCar className="w-8 h-8 mx-auto mb-2" />
              No drivers found
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedDriver?.id === driver.id
                      ? 'bg-cyan-900/30 border-l-2 border-cyan-500'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            statusColors[driver.status]
                          }`}
                        ></span>
                        <span className="text-white font-medium">
                          {driver.driverName}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {driver.supplierName}
                      </div>
                    </div>
                    {driver.currentBookingCode && (
                      <span className="text-xs font-mono text-cyan-400">
                        {driver.currentBookingCode}
                      </span>
                    )}
                  </div>

                  {driver.status === 'ON_TRIP' && driver.eta && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <FaClock className="text-gray-500" />
                      <span className="text-gray-300">ETA: {driver.eta}m</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Driver Details */}
        {selectedDriver && (
          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <h3 className="text-white font-medium mb-2">{selectedDriver.driverName}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Supplier</span>
                <span className="text-white">{selectedDriver.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    statusColors[selectedDriver.status]
                  } text-white`}
                >
                  {selectedDriver.status.replace('_', ' ')}
                </span>
              </div>
              {selectedDriver.currentBookingCode && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Booking</span>
                  <span className="text-cyan-400 font-mono">
                    {selectedDriver.currentBookingCode}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
                Contact
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">
                View Ride
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
