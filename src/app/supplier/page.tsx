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
  FaTags,
  FaFileAlt,
  FaPlus,
  FaArrowUp,
  FaEye,
  FaCheck,
  FaTimes,
  FaSpinner,
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

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING_ASSIGN: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  ASSIGNED: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  ON_WAY: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  AT_PICKUP: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  IN_RIDE: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  IN_PROGRESS: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
  FINISHED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  NO_SHOW: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function SupplierDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAccept = async (publicCode: string) => {
    setActionLoading(`accept-${publicCode}`);
    try {
      const res = await fetch(`/api/supplier/rides/${publicCode}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ASSIGNED' }),
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (publicCode: string) => {
    const reason = prompt('Please provide a reason for declining:');
    if (!reason) return;

    setActionLoading(`decline-${publicCode}`);
    try {
      const res = await fetch(`/api/supplier/rides/${publicCode}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', reason }),
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error declining booking:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to Load Dashboard</h3>
        <p className="text-gray-500">Please try refreshing the page.</p>
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
      <div className="bg-gradient-to-r from-primary via-primary-dark to-secondary rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold mb-3">
            Welcome back, {data.supplier.name}!
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            {data.supplier.isVerified ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-100 rounded-full text-sm">
                <FaCheckCircle />
                Verified Supplier
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-100 rounded-full text-sm">
                <FaExclamationCircle />
                Pending Verification
              </span>
            )}
            {data.supplier.rating > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white rounded-full text-sm">
                <FaStar className="text-yellow-300" />
                {data.supplier.rating.toFixed(1)} ({data.supplier.ratingCount} reviews)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.stats.todayBookings}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <FaArrowUp className="w-3 h-3" />
                Active today
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaCalendarAlt className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.stats.upcomingBookings}
              </p>
              <p className="text-sm text-purple-600 mt-1 flex items-center gap-1">
                <FaClock className="w-3 h-3" />
                Scheduled
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaClock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Completed This Month</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.stats.completedThisMonth}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <FaCheckCircle className="w-3 h-3" />
                Transfers done
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaChartLine className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Payout</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.stats.currency} {data.stats.pendingPayout.toFixed(2)}
              </p>
              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                <FaMoneyBillWave className="w-3 h-3" />
                To be paid
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaMoneyBillWave className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Link
            href="/supplier/bookings"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCalendarAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Manage Bookings</p>
              <p className="text-xs text-gray-500">View all transfers</p>
            </div>
          </Link>

          <Link
            href="/supplier/vehicles"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaCar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Add Vehicle</p>
              <p className="text-xs text-gray-500">Expand your fleet</p>
            </div>
          </Link>

          <Link
            href="/supplier/drivers"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Add Driver</p>
              <p className="text-xs text-gray-500">Grow your team</p>
            </div>
          </Link>

          <Link
            href="/supplier/pricing"
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaTags className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Update Pricing</p>
              <p className="text-xs text-gray-500">Set your rates</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest transfer requests</p>
          </div>
          <Link
            href="/supplier/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
          >
            View All
            <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {data.recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Recent Bookings</h3>
            <p className="text-gray-500 mb-6">You don't have any bookings yet. Set up your pricing to start receiving transfers.</p>
            <Link
              href="/supplier/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              Set Up Pricing
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recentBookings.map((booking) => {
              const statusStyle = statusColors[booking.status] || { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' };
              return (
                <div
                  key={booking.id}
                  className="p-4 lg:p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          #{booking.publicCode}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {booking.customerName}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(booking.pickupDatetime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaCar className="w-3.5 h-3.5 text-gray-400" />
                          {booking.vehicleType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {booking.currency} {booking.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                      {booking.status === 'PENDING_ASSIGN' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAccept(booking.publicCode)}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === `accept-${booking.publicCode}` ? (
                              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FaCheck className="w-3.5 h-3.5" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(booking.publicCode)}
                            disabled={actionLoading !== null}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === `decline-${booking.publicCode}` ? (
                              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FaTimes className="w-3.5 h-3.5" />
                            )}
                            Decline
                          </button>
                        </div>
                      )}
                      <Link
                        href={`/supplier/bookings/${booking.publicCode}`}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Additional Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Link
          href="/supplier/documents"
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FaFileAlt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Documents</h3>
              <p className="text-sm text-gray-500">Upload and manage your business documents</p>
            </div>
            <FaArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/supplier/reviews"
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FaStar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reviews</h3>
              <p className="text-sm text-gray-500">See what customers say about your service</p>
            </div>
            <FaArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
