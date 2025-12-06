'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaCar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaSignOutAlt,
  FaHistory,
  FaTicketAlt,
  FaStar,
  FaPlane,
} from 'react-icons/fa';

interface Booking {
  id: number;
  publicCode: string;
  pickupDatetime: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType: string;
  totalPrice: number;
  currency: string;
  status: string;
}

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  totalBookings: number;
  loyaltyPoints: number;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch customer profile
      const profileRes = await fetch('/api/customer/me');
      if (!profileRes.ok) {
        router.push('/customer/login');
        return;
      }
      const profileData = await profileRes.json();
      setCustomer(profileData.customer);

      // Fetch bookings
      const bookingsRes = await fetch('/api/customer/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setUpcomingBookings(bookingsData.upcoming || []);
        setPastBookings(bookingsData.past || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      router.push('/customer/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/auth', { method: 'DELETE' });
      router.push('/customer/login');
    } catch {
      router.push('/customer/login');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FaCar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Airport Transfer</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Book New Transfer
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <FaUser className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {customer?.firstName || 'Guest'}!
                </h1>
                <p className="text-gray-600">{customer?.email}</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-teal-600">
                  <FaTicketAlt />
                  <span className="text-2xl font-bold">{customer?.totalBookings || 0}</span>
                </div>
                <p className="text-sm text-gray-500">Total Bookings</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-yellow-500">
                  <FaStar />
                  <span className="text-2xl font-bold">{customer?.loyaltyPoints || 0}</span>
                </div>
                <p className="text-sm text-gray-500">Loyalty Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" />
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'past'
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaHistory className="inline mr-2" />
              Past ({pastBookings.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'upcoming' && (
              <>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                    <p className="text-gray-500 mb-6">Book your next airport transfer now!</p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                    >
                      <FaCar />
                      Book a Transfer
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} formatDate={formatDate} formatTime={formatTime} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'past' && (
              <>
                {pastBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <FaHistory className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No past bookings</h3>
                    <p className="text-gray-500">Your completed transfers will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} formatDate={formatDate} formatTime={formatTime} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingCard({
  booking,
  formatDate,
  formatTime,
  getStatusColor,
}: {
  booking: Booking;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  getStatusColor: (status: string) => string;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg font-bold text-teal-600">{booking.publicCode}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCalendarAlt className="text-teal-500" />
              <span>{formatDate(booking.pickupDatetime)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-teal-500" />
              <span>{formatTime(booking.pickupDatetime)}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
              <FaPlane className="text-teal-500 mt-0.5" />
              <span className="line-clamp-1">{booking.pickupAddress || 'Airport'}</span>
            </div>
            <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
              <FaMapMarkerAlt className="text-cyan-500 mt-0.5" />
              <span className="line-clamp-1">{booking.dropoffAddress || 'Destination'}</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">
              {booking.currency} {booking.totalPrice?.toFixed(2)}
            </p>
          </div>
          <Link
            href={`/manage-booking?ref=${booking.publicCode}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
