'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCar,
  FaPlane,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaUserAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaPhoneAlt,
  FaSync,
} from 'react-icons/fa';

interface ActiveRide {
  id: number;
  publicCode: string;
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  pickupAddress: string;
  dropoffAddress: string;
  flightNumber: string | null;
  status: string;
  driverName: string | null;
  driverPhone: string | null;
  driverEta: number | null;
  flightStatus: string | null;
  flightDelay: number | null;
}

interface Issue {
  id: number;
  type: string;
  severity: string;
  title: string;
  bookingCode: string | null;
  createdAt: string;
}

interface DashboardStats {
  activeRides: number;
  upcomingRides: number;
  driversOnline: number;
  openIssues: number;
  completedToday: number;
  avgResponseTime: number;
}

const statusColors: Record<string, string> = {
  PENDING_ASSIGN: 'bg-yellow-500',
  DRIVER_ASSIGNED: 'bg-blue-500',
  DRIVER_EN_ROUTE: 'bg-cyan-500',
  DRIVER_ARRIVED: 'bg-green-500',
  IN_PROGRESS: 'bg-purple-500',
  COMPLETED: 'bg-gray-500',
  CANCELLED: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  PENDING_ASSIGN: 'Pending Assignment',
  DRIVER_ASSIGNED: 'Driver Assigned',
  DRIVER_EN_ROUTE: 'Driver En Route',
  DRIVER_ARRIVED: 'Driver Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const severityColors: Record<string, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export default function DispatchDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeRides: 0,
    upcomingRides: 0,
    driversOnline: 0,
    openIssues: 0,
    completedToday: 0,
    avgResponseTime: 0,
  });
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dispatch/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActiveRides(data.activeRides || []);
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch dispatch data:', error);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getTimeUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispatch Dashboard</h1>
          <p className="text-gray-400">Real-time operations monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaCar className="text-cyan-400 text-xl" />
            <span className="text-3xl font-bold text-white">{stats.activeRides}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Active Rides</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaClock className="text-blue-400 text-xl" />
            <span className="text-3xl font-bold text-white">{stats.upcomingRides}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Next 4 Hours</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaUserAlt className="text-green-400 text-xl" />
            <span className="text-3xl font-bold text-white">{stats.driversOnline}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Drivers Online</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaExclamationTriangle className="text-red-400 text-xl" />
            <span className="text-3xl font-bold text-white">{stats.openIssues}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Open Issues</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaCheckCircle className="text-emerald-400 text-xl" />
            <span className="text-3xl font-bold text-white">{stats.completedToday}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Completed Today</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaClock className="text-yellow-400 text-xl" />
            <span className="text-3xl font-bold text-white">{stats.avgResponseTime}m</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">Avg Response</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Rides */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Active Rides</h2>
            <Link
              href="/dispatch/rides"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-700">
            {activeRides.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No active rides at the moment
              </div>
            ) : (
              activeRides.slice(0, 5).map((ride) => (
                <div key={ride.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-400">{ride.publicCode}</span>
                        <span
                          className={`px-2 py-0.5 text-xs text-white rounded ${
                            statusColors[ride.status] || 'bg-gray-500'
                          }`}
                        >
                          {statusLabels[ride.status] || ride.status}
                        </span>
                        {ride.flightDelay && ride.flightDelay > 0 && (
                          <span className="flex items-center gap-1 text-xs text-orange-400">
                            <FaPlane className="w-3 h-3" />
                            +{ride.flightDelay}m delay
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <FaUserAlt className="w-3 h-3 text-gray-500" />
                          {ride.customerName}
                          {ride.customerPhone && (
                            <a
                              href={`tel:${ride.customerPhone}`}
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <FaPhoneAlt className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FaMapMarkerAlt className="w-3 h-3 text-gray-500" />
                          <span className="truncate max-w-xs">{ride.pickupAddress}</span>
                          <FaArrowRight className="w-3 h-3 text-gray-500" />
                          <span className="truncate max-w-xs">{ride.dropoffAddress}</span>
                        </div>
                      </div>

                      {ride.driverName && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-400">Driver: </span>
                          <span className="text-white">{ride.driverName}</span>
                          {ride.driverEta && (
                            <span className="text-cyan-400 ml-2">ETA: {ride.driverEta}m</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-mono text-white">
                        {formatTime(ride.pickupTime)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getTimeUntil(ride.pickupTime)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Issues & Alerts */}
        <div className="bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Open Issues</h2>
            <Link
              href="/dispatch/issues"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-700">
            {issues.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FaCheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                No open issues
              </div>
            ) : (
              issues.slice(0, 5).map((issue) => (
                <Link
                  key={issue.id}
                  href={`/dispatch/issues/${issue.id}`}
                  className="block p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 w-2 h-2 rounded-full ${
                        severityColors[issue.severity]
                      }`}
                    ></span>
                    <div className="flex-1">
                      <div className="text-sm text-white">{issue.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{issue.type.replace('_', ' ')}</span>
                        {issue.bookingCode && (
                          <>
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            <span className="font-mono">{issue.bookingCode}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(issue.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Flight Alerts */}
      <div className="bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FaPlane className="text-cyan-400" />
            Flight Alerts
          </h2>
          <Link
            href="/dispatch/flights"
            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
          >
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example flight alerts - would be dynamic */}
            <div className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <span className="font-mono text-white">TK1234</span>
                <span className="text-sm text-orange-400">+45m delay</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">IST → AYT</div>
              <div className="text-xs text-gray-500 mt-2">Booking: LT8A7B2C</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <span className="font-mono text-white">PC456</span>
                <span className="text-sm text-yellow-400">+20m delay</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">SAW → AYT</div>
              <div className="text-xs text-gray-500 mt-2">Booking: LT3F9K1M</div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <span className="font-mono text-white">SU789</span>
                <span className="text-sm text-green-400">On time</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">SVO → AYT</div>
              <div className="text-xs text-gray-500 mt-2">Landing in 30m</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
