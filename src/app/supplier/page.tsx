'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaStar,
  FaCar,
  FaUsers,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight,
} from 'react-icons/fa';

interface DashboardData {
  supplier: {
    id: number;
    name: string;
    isVerified: boolean;
    rating: number;
    ratingCount: number;
  };
  stats: {
    todayBookings: number;
    upcomingBookings: number;
    completedThisMonth: number;
    pendingPayout: number;
    currency: string;
  };
  recentBookings: Array<{
    id: number;
    publicCode: string;
    customerName: string;
    pickupDatetime: string;
    status: string;
    vehicleType: string;
    totalPrice: number;
    currency: string;
  }>;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function SupplierDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/supplier/dashboard');
        if (res.ok) {
          const dashboardData = await res.json();
          setData(dashboardData);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-600">Unable to load dashboard data.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {data.supplier.name}!
        </h1>
        <div className="flex items-center gap-4 text-sky-100">
          {data.supplier.isVerified ? (
            <span className="flex items-center gap-1">
              <FaCheckCircle className="text-green-300" />
              Verified Supplier
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FaExclamationCircle className="text-yellow-300" />
              Pending Verification
            </span>
          )}
          {data.supplier.rating > 0 && (
            <span className="flex items-center gap-1">
              <FaStar className="text-yellow-300" />
              {data.supplier.rating.toFixed(1)} ({data.supplier.ratingCount} reviews)
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.stats.todayBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-6 h-6 text-sky-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.stats.upcomingBookings}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.stats.completedThisMonth}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Payout</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {data.stats.currency} {data.stats.pendingPayout.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FaMoneyBillWave className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/supplier/bookings"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <FaCalendarAlt className="w-5 h-5 text-sky-600" />
          <span className="font-medium text-gray-700">Manage Bookings</span>
        </Link>
        <Link
          href="/supplier/vehicles"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <FaCar className="w-5 h-5 text-green-600" />
          <span className="font-medium text-gray-700">Add Vehicle</span>
        </Link>
        <Link
          href="/supplier/drivers"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <FaUsers className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-gray-700">Add Driver</span>
        </Link>
        <Link
          href="/supplier/pricing"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3"
        >
          <FaMoneyBillWave className="w-5 h-5 text-orange-600" />
          <span className="font-medium text-gray-700">Update Pricing</span>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link
            href="/supplier/bookings"
            className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1"
          >
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No recent bookings
            </div>
          ) : (
            data.recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-500">
                        #{booking.publicCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mt-1">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.pickupDatetime)} • {booking.vehicleType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {booking.currency} {booking.totalPrice.toFixed(2)}
                    </p>
                    <Link
                      href={`/supplier/bookings/${booking.publicCode}`}
                      className="text-sky-600 hover:text-sky-700 text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
