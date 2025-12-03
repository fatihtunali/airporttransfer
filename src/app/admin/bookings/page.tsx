'use client';

import { useState, useEffect } from 'react';

interface Booking {
  id: number;
  publicCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  airportCode: string;
  airportName: string;
  zoneName: string;
  direction: string;
  flightNumber: string;
  pickupDatetime: string;
  paxAdults: number;
  paxChildren: number;
  vehicleType: string;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  supplierName: string;
  driverName: string;
  channel: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBookings();
  }, [filter, page, dateFrom, dateTo]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '20');
      if (filter !== 'all') params.set('status', filter.toUpperCase());
      if (dateFrom) params.set('fromDate', dateFrom);
      if (dateTo) params.set('toDate', dateTo);

      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      AWAITING_PAYMENT: 'bg-orange-100 text-orange-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      ASSIGNED: 'bg-indigo-100 text-indigo-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      UNPAID: 'bg-red-100 text-red-800',
      PARTIALLY_PAID: 'bg-orange-100 text-orange-800',
      PAID: 'bg-green-100 text-green-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(b =>
    b.publicCode.toLowerCase().includes(search.toLowerCase()) ||
    b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    b.customerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        loadBookings();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <button
          onClick={loadBookings}
          className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Code, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'All', value: 'all', count: total },
          { label: 'Pending', value: 'pending', color: 'text-yellow-600' },
          { label: 'Confirmed', value: 'confirmed', color: 'text-blue-600' },
          { label: 'Assigned', value: 'assigned', color: 'text-indigo-600' },
          { label: 'Completed', value: 'completed', color: 'text-green-600' },
          { label: 'Cancelled', value: 'cancelled', color: 'text-red-600' },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
              filter === s.value ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color || 'text-gray-900'}`}>
              {s.count !== undefined ? s.count : '-'}
            </p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{booking.publicCode}</p>
                      <p className="text-xs text-gray-500">{booking.channel}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{booking.customerName}</p>
                      <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {booking.direction === 'FROM_AIRPORT'
                          ? `${booking.airportCode} → ${booking.zoneName}`
                          : `${booking.zoneName} → ${booking.airportCode}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.paxAdults + (booking.paxChildren || 0)} pax • {booking.vehicleType}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(booking.pickupDatetime).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.pickupDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.currency} {booking.totalPrice?.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Booking {selectedBooking.publicCode}</h2>
                <p className="text-sm text-gray-500">Created {new Date(selectedBooking.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status badges */}
              <div className="flex gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                  {selectedBooking.paymentStatus}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedBooking.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedBooking.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Trip Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Trip Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Route</label>
                    <p className="text-gray-900">
                      {selectedBooking.direction === 'FROM_AIRPORT'
                        ? `${selectedBooking.airportName} → ${selectedBooking.zoneName}`
                        : `${selectedBooking.zoneName} → ${selectedBooking.airportName}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Pickup Time</label>
                    <p className="text-gray-900">
                      {new Date(selectedBooking.pickupDatetime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Passengers</label>
                    <p className="text-gray-900">
                      {selectedBooking.paxAdults} adults, {selectedBooking.paxChildren || 0} children
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Vehicle Type</label>
                    <p className="text-gray-900">{selectedBooking.vehicleType}</p>
                  </div>
                  {selectedBooking.flightNumber && (
                    <div>
                      <label className="text-sm text-gray-500">Flight Number</label>
                      <p className="text-gray-900">{selectedBooking.flightNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Supplier Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Assignment</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Supplier</label>
                    <p className="text-gray-900">{selectedBooking.supplierName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Driver</label>
                    <p className="text-gray-900">{selectedBooking.driverName || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">Total Price</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {selectedBooking.currency} {selectedBooking.totalPrice?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  onClick={() => window.open(`/api/admin/bookings/${selectedBooking.id}/invoice`, '_blank')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
