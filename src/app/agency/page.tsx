'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaChartLine,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaArrowRight,
} from 'react-icons/fa';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  commission: number;
  creditBalance: number;
  currency: string;
  teamMembers: number;
}

interface RecentBooking {
  id: number;
  publicCode: string;
  customerName: string;
  route: string;
  pickupDate: string;
  status: string;
  totalPrice: number;
  currency: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function AgencyDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/agency/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin w-8 h-8 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your agency portal</p>
        </div>
        <Link
          href="/agency/bookings/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <FaPlus /> New Booking
        </Link>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-600">
                <FaClock className="w-4 h-4" />
                {stats.pendingBookings} pending
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <FaCheckCircle className="w-4 h-4" />
                {stats.completedBookings} completed
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.currency} {stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Commission earned: {stats.currency} {stats.commission.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Credit Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.currency} {stats.creditBalance.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaChartLine className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Link
              href="/agency/credits"
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Add credits <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Team Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.teamMembers}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <Link
              href="/agency/team"
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage team <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/agency/bookings/new"
          className="bg-emerald-600 text-white rounded-xl p-6 hover:bg-emerald-700 transition-colors"
        >
          <FaPlus className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Create Booking</h3>
          <p className="text-emerald-100 text-sm">
            Book a transfer for your customer
          </p>
        </Link>

        <Link
          href="/agency/api"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <FaChartLine className="w-8 h-8 mb-3 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">API & Widget</h3>
          <p className="text-gray-500 text-sm">
            Integrate booking into your website
          </p>
        </Link>

        <Link
          href="/agency/whitelabel"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <svg
            className="w-8 h-8 mb-3 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">White Label</h3>
          <p className="text-gray-500 text-sm">
            Customize branding and colors
          </p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          <Link
            href="/agency/bookings"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings yet</p>
            <Link
              href="/agency/bookings/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <FaPlus /> Create Your First Booking
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/agency/bookings/${booking.id}`}
                        className="font-mono text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        #{booking.publicCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {booking.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.route}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.pickupDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.currency} {booking.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
