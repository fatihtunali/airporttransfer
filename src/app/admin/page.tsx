'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalBookingsToday: number;
  totalRevenueToday: number;
  activeSuppliers: number;
  pendingPayouts: number;
  totalBookingsMonth: number;
  totalRevenueMonth: number;
  pendingVerifications: number;
  activeDrivers: number;
}

interface RecentBooking {
  id: number;
  publicCode: string;
  customerName: string;
  airport: string;
  zone: string;
  pickupTime: string;
  totalPrice: number;
  currency: string;
  status: string;
}

interface PendingSupplier {
  id: number;
  name: string;
  city: string;
  country: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [pendingSuppliers, setPendingSuppliers] = useState<PendingSupplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, bookingsRes, suppliersRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/bookings?limit=5'),
        fetch('/api/admin/suppliers?verified=false&limit=5'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setRecentBookings(data.bookings || []);
      }

      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setPendingSuppliers(data.suppliers?.filter((s: PendingSupplier & { isVerified: boolean }) => !s.isVerified) || []);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalBookingsToday || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              📋
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This month: {stats?.totalBookingsMonth || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today&apos;s Revenue</p>
              <p className="text-3xl font-bold text-gray-900">€{Number(stats?.totalRevenueToday || 0).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              💰
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            This month: €{Number(stats?.totalRevenueMonth || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Suppliers</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeSuppliers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
              🏢
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Pending verification: {stats?.pendingVerifications || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payouts</p>
              <p className="text-3xl font-bold text-gray-900">€{Number(stats?.pendingPayouts || 0).toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
              ⏳
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Active drivers: {stats?.activeDrivers || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/bookings" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <span className="font-medium text-gray-900">All Bookings</span>
        </Link>
        <Link href="/admin/suppliers" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <span className="font-medium text-gray-900">Manage Suppliers</span>
        </Link>
        <Link href="/admin/payouts" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <span className="text-2xl">💳</span>
          <span className="font-medium text-gray-900">Process Payouts</span>
        </Link>
        <Link href="/admin/airports" className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <span className="text-2xl">✈️</span>
          <span className="font-medium text-gray-900">Manage Locations</span>
        </Link>
      </div>

      {/* Recent Bookings & Pending Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No recent bookings</div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{booking.publicCode}</p>
                      <p className="text-sm text-gray-500">{booking.customerName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{booking.airport} → {booking.zone}</span>
                    <span className="font-medium">{booking.currency} {booking.totalPrice}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Suppliers */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
            <Link href="/admin/suppliers?filter=pending" className="text-sm text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="divide-y">
            {pendingSuppliers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No pending verifications</div>
            ) : (
              pendingSuppliers.map((supplier) => (
                <div key={supplier.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">{supplier.city}, {supplier.country}</p>
                    </div>
                    <Link
                      href={`/admin/suppliers/${supplier.id}`}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Review
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Applied: {new Date(supplier.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">API Server</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Database</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Payment Gateway</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Email Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
