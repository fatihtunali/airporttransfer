'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaCar,
  FaCheck,
  FaTimes,
  FaSpinner,
} from 'react-icons/fa';

interface Booking {
  id: number;
  publicCode: string;
  customerName: string;
  customerPhone: string;
  pickupDatetime: string;
  direction: string;
  airportName: string;
  zoneName: string;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleType: string;
  paxAdults: number;
  luggageCount: number;
  status: string;
  totalPrice: number;
  currency: string;
  flightNumber: string | null;
  driverName: string | null;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function SupplierBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('period', dateFilter);

      const res = await fetch(`/api/supplier/rides?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.rides || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.publicCode.toLowerCase().includes(query) ||
      booking.customerName.toLowerCase().includes(query) ||
      booking.customerPhone?.includes(query)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAccept = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/supplier/rides/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
    }
  };

  const handleDecline = async (bookingId: number) => {
    const reason = prompt('Please provide a reason for declining:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/supplier/rides/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', reason }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error declining booking:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Manage your transfer bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All Time</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        #{booking.publicCode}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                      {booking.flightNumber && (
                        <span className="text-xs text-gray-500">
                          ✈️ {booking.flightNumber}
                        </span>
                      )}
                    </div>

                    {/* Route */}
                    <div className="flex items-start gap-2 mb-3">
                      <FaMapMarkerAlt className="w-4 h-4 text-sky-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.direction === 'FROM_AIRPORT'
                            ? `${booking.airportName} → ${booking.zoneName}`
                            : `${booking.zoneName} → ${booking.airportName}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.pickupAddress || booking.dropoffAddress}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="w-4 h-4" />
                        {formatDate(booking.pickupDatetime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="w-4 h-4" />
                        {formatTime(booking.pickupDatetime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUser className="w-4 h-4" />
                        {booking.paxAdults} pax
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCar className="w-4 h-4" />
                        {booking.vehicleType}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Price */}
                  <div className="lg:text-right">
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {booking.currency} {booking.totalPrice.toFixed(2)}
                    </p>
                    {booking.driverName && (
                      <p className="text-sm text-purple-600 mt-1">
                        Driver: {booking.driverName}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAccept(booking.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaCheck /> Accept
                        </button>
                        <button
                          onClick={() => handleDecline(booking.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FaTimes /> Decline
                        </button>
                      </>
                    )}
                    <Link
                      href={`/supplier/bookings/${booking.publicCode}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
