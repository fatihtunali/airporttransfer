'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight,
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaCalendarAlt,
  FaEdit,
  FaTimesCircle,
  FaCheckCircle,
  FaCar,
  FaMapMarkerAlt,
  FaPlane,
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaInfoCircle,
  FaSave,
  FaArrowLeft,
  FaCreditCard,
} from 'react-icons/fa';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface BookingData {
  ref: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  date: string;
  time: string;
  pickupTime: string;
  from: string;
  to: string;
  vehicle: string;
  passengers: number;
  price: string;
  currency: string;
  totalPrice: number;
  driver?: string;
  driverPhone?: string;
  flightNumber?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  specialRequests?: string;
  passengerName?: string;
  passengerPhone?: string;
  passengerEmail?: string;
}

interface CancellationInfo {
  canCancel: boolean;
  reason?: string;
  cancellation?: {
    policy: string;
    policyCode: string;
    description: string;
    hoursBeforePickup: number;
    refundPercent: number;
    refundAmount: number;
    isPaid: boolean;
  };
  allPolicies?: {
    name: string;
    description: string;
    hoursRequired: number;
    refundPercent: number;
  }[];
}

interface ModificationInfo {
  canModify: boolean;
  reason?: string;
  hoursUntilPickup: number;
  minHoursRequired: number;
}

function ManageBookingContent() {
  const searchParams = useSearchParams();
  const refFromUrl = searchParams?.get('ref');

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchForm, setSearchForm] = useState({
    bookingRef: refFromUrl || '',
    email: '',
  });
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cancelInfo, setCancelInfo] = useState<CancellationInfo | null>(null);
  const [modifyInfo, setModifyInfo] = useState<ModificationInfo | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<{ type: 'cancel' | 'modify' | 'payment'; message: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modification form
  const [modifyForm, setModifyForm] = useState({
    pickupTime: '',
    flightNumber: '',
    pickupAddress: '',
    dropoffAddress: '',
    specialRequests: '',
    passengerName: '',
    passengerPhone: '',
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if logged in and auto-load booking if ref is in URL
  useEffect(() => {
    const checkLoginAndLoad = async () => {
      try {
        const res = await fetch('/api/customer/me');
        if (res.ok) {
          const data = await res.json();
          const customerEmail = data.customer.email;
          setIsLoggedIn(true);
          setUserEmail(customerEmail);
          setSearchForm(prev => ({ ...prev, email: customerEmail }));

          // Auto-load booking if ref in URL
          if (refFromUrl) {
            setLoading(true);
            try {
              const bookingRes = await fetch(`/api/public/bookings/${encodeURIComponent(refFromUrl)}?email=${encodeURIComponent(customerEmail)}`);
              const bookingData = await bookingRes.json();

              if (bookingRes.ok) {
                const pickupDate = new Date(bookingData.pickupTime);
                const from = bookingData.direction === 'from_airport' || bookingData.direction === 'FROM_AIRPORT'
                  ? `${bookingData.airport?.name} (${bookingData.airport?.code})`
                  : bookingData.pickupAddress || bookingData.zone?.name;
                const to = bookingData.direction === 'from_airport' || bookingData.direction === 'FROM_AIRPORT'
                  ? bookingData.dropoffAddress || bookingData.zone?.name
                  : `${bookingData.airport?.name} (${bookingData.airport?.code})`;

                const leadPassenger = bookingData.passengers?.find((p: { isMain: boolean }) => p.isMain);

                setBooking({
                  ref: bookingData.publicCode,
                  status: bookingData.status,
                  paymentStatus: bookingData.paymentStatus,
                  paymentMethod: bookingData.paymentMethod,
                  date: pickupDate.toLocaleDateString('en-GB'),
                  time: pickupDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                  pickupTime: bookingData.pickupTime,
                  from: from || 'N/A',
                  to: to || 'N/A',
                  vehicle: bookingData.vehicleType,
                  passengers: bookingData.paxAdults + bookingData.paxChildren,
                  price: `${bookingData.currency} ${bookingData.totalPrice.toFixed(2)}`,
                  currency: bookingData.currency,
                  totalPrice: bookingData.totalPrice,
                  driver: bookingData.ride?.driver?.name,
                  driverPhone: bookingData.ride?.driver?.phone,
                  flightNumber: bookingData.flightNumber,
                  pickupAddress: bookingData.pickupAddress,
                  dropoffAddress: bookingData.dropoffAddress,
                  specialRequests: bookingData.customerNotes,
                  passengerName: leadPassenger?.fullName,
                  passengerPhone: leadPassenger?.phone,
                  passengerEmail: leadPassenger?.email,
                });

                setModifyForm({
                  pickupTime: bookingData.pickupTime?.slice(0, 16) || '',
                  flightNumber: bookingData.flightNumber || '',
                  pickupAddress: bookingData.pickupAddress || '',
                  dropoffAddress: bookingData.dropoffAddress || '',
                  specialRequests: bookingData.customerNotes || '',
                  passengerName: leadPassenger?.fullName || '',
                  passengerPhone: leadPassenger?.phone || '',
                });
              }
            } catch (err) {
              console.error('Failed to auto-load booking:', err);
            } finally {
              setLoading(false);
            }
          }
        }
      } catch {
        // Not logged in, that's fine
      }
    };
    checkLoginAndLoad();
  }, [refFromUrl]);

  const handleSearch = useCallback(async (ref?: string, email?: string) => {
    const bookingRef = ref || searchForm.bookingRef;
    const searchEmail = email || searchForm.email;

    if (!bookingRef || !searchEmail) return;

    setLoading(true);
    setError('');
    setUserEmail(searchEmail);

    try {
      const response = await fetch(`/api/public/bookings/${encodeURIComponent(bookingRef)}?email=${encodeURIComponent(searchEmail)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Booking not found. Please check your booking reference and email address.');
        setLoading(false);
        return;
      }

      // Format the booking data
      const pickupDate = new Date(data.pickupTime);
      const from = data.direction === 'from_airport' || data.direction === 'FROM_AIRPORT'
        ? `${data.airport?.name} (${data.airport?.code})`
        : data.pickupAddress || data.zone?.name;
      const to = data.direction === 'from_airport' || data.direction === 'FROM_AIRPORT'
        ? data.dropoffAddress || data.zone?.name
        : `${data.airport?.name} (${data.airport?.code})`;

      const leadPassenger = data.passengers?.find((p: { isMain: boolean }) => p.isMain);

      setBooking({
        ref: data.publicCode,
        status: data.status,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        date: pickupDate.toLocaleDateString('en-GB'),
        time: pickupDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        pickupTime: data.pickupTime,
        from: from || 'N/A',
        to: to || 'N/A',
        vehicle: data.vehicleType,
        passengers: data.paxAdults + data.paxChildren,
        price: `${data.currency} ${data.totalPrice.toFixed(2)}`,
        currency: data.currency,
        totalPrice: data.totalPrice,
        driver: data.ride?.driver?.name,
        driverPhone: data.ride?.driver?.phone,
        flightNumber: data.flightNumber,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        specialRequests: data.customerNotes,
        passengerName: leadPassenger?.fullName,
        passengerPhone: leadPassenger?.phone,
        passengerEmail: leadPassenger?.email,
      });

      // Initialize modify form with current values
      setModifyForm({
        pickupTime: data.pickupTime?.slice(0, 16) || '',
        flightNumber: data.flightNumber || '',
        pickupAddress: data.pickupAddress || '',
        dropoffAddress: data.dropoffAddress || '',
        specialRequests: data.customerNotes || '',
        passengerName: leadPassenger?.fullName || '',
        passengerPhone: leadPassenger?.phone || '',
      });
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchForm.bookingRef, searchForm.email]);

  // Load cancellation info
  const loadCancelInfo = async () => {
    if (!booking) return;

    try {
      const response = await fetch(
        `/api/public/bookings/${booking.ref}/cancel?email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();

      if (response.ok) {
        setCancelInfo(data);
      }
    } catch (err) {
      console.error('Failed to load cancellation info:', err);
    }
  };

  // Load modification info
  const loadModifyInfo = async () => {
    if (!booking) return;

    try {
      const response = await fetch(
        `/api/public/bookings/${booking.ref}/modify?email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();

      if (response.ok) {
        setModifyInfo(data);
      }
    } catch (err) {
      console.error('Failed to load modification info:', err);
    }
  };

  // Handle cancel button click
  const handleCancelClick = async () => {
    await loadCancelInfo();
    setShowCancelModal(true);
  };

  // Handle modify button click
  const handleModifyClick = async () => {
    await loadModifyInfo();
    setShowModifyModal(true);
  };

  // Submit cancellation
  const handleCancelSubmit = async () => {
    if (!booking) return;

    setCancelLoading(true);
    try {
      const response = await fetch(`/api/public/bookings/${booking.ref}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          reason: cancelReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCancelModal(false);
        setActionSuccess({
          type: 'cancel',
          message: cancelInfo?.cancellation?.refundPercent
            ? `Your booking has been cancelled. ${cancelInfo.cancellation.refundPercent}% refund (${booking.currency} ${cancelInfo.cancellation.refundAmount.toFixed(2)}) will be processed.`
            : 'Your booking has been cancelled successfully.',
        });
        // Refresh booking data
        handleSearch(booking.ref, userEmail);
      } else {
        setError(data.error || 'Failed to cancel booking');
      }
    } catch {
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Submit modification
  const handleModifySubmit = async () => {
    if (!booking) return;

    setModifyLoading(true);
    try {
      // Only send changed fields
      const modifications: Record<string, string> = { email: userEmail };

      if (modifyForm.pickupTime && modifyForm.pickupTime !== booking.pickupTime?.slice(0, 16)) {
        modifications.pickupTime = modifyForm.pickupTime;
      }
      if (modifyForm.flightNumber !== (booking.flightNumber || '')) {
        modifications.flightNumber = modifyForm.flightNumber;
      }
      if (modifyForm.dropoffAddress !== (booking.dropoffAddress || '')) {
        modifications.dropoffAddress = modifyForm.dropoffAddress;
      }
      if (modifyForm.specialRequests !== (booking.specialRequests || '')) {
        modifications.specialRequests = modifyForm.specialRequests;
      }
      if (modifyForm.passengerName !== (booking.passengerName || '')) {
        modifications.passengerName = modifyForm.passengerName;
      }
      if (modifyForm.passengerPhone !== (booking.passengerPhone || '')) {
        modifications.passengerPhone = modifyForm.passengerPhone;
      }

      const response = await fetch(`/api/public/bookings/${booking.ref}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifications),
      });

      const data = await response.json();

      if (response.ok) {
        setShowModifyModal(false);
        setActionSuccess({
          type: 'modify',
          message: 'Your booking has been updated successfully.',
        });
        // Refresh booking data
        handleSearch(booking.ref, userEmail);
      } else {
        setError(data.error || 'Failed to modify booking');
      }
    } catch {
      setError('Failed to modify booking. Please try again.');
    } finally {
      setModifyLoading(false);
    }
  };

  // Handle payment
  const handlePayment = async (method: 'card' | 'bank_transfer') => {
    if (!booking) return;

    setPaymentLoading(true);
    try {
      if (method === 'card') {
        // Redirect to payment page
        window.location.href = `/pay/${booking.ref}`;
      } else {
        // Show bank transfer details
        const res = await fetch('/api/public/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingCode: booking.ref,
            email: userEmail,
            paymentMethod: 'bank_transfer',
          }),
        });

        if (res.ok) {
          setShowPaymentModal(false);
          setActionSuccess({
            type: 'payment',
            message: 'Bank transfer details have been sent to your email. Please complete the transfer within 24 hours.',
          });
          handleSearch(booking.ref, userEmail);
        } else {
          setError('Failed to process payment request');
        }
      }
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'ASSIGNED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
      case 'AWAITING_PAYMENT':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const canCancelBooking = booking && !['CANCELLED', 'COMPLETED', 'IN_PROGRESS'].includes(booking.status.toUpperCase());
  const canModifyBooking = booking && !['CANCELLED', 'COMPLETED', 'IN_PROGRESS'].includes(booking.status.toUpperCase());
  // Only show "Payment Required" for bank transfer bookings that are unpaid
  // PAY_LATER = pay driver directly, no online payment needed
  // BANK_TRANSFER = requires bank transfer payment before service
  const needsPayment = booking &&
    !['CANCELLED', 'COMPLETED'].includes(booking.status.toUpperCase()) &&
    !['PAID', 'REFUNDED'].includes(booking.paymentStatus?.toUpperCase() || '') &&
    booking.paymentMethod?.toUpperCase() === 'BANK_TRANSFER';

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center group">
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={50} className="h-12 w-auto rounded-lg shadow-md" priority />
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Home</Link>
              <Link href="/help" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Help Center</Link>
              <Link href="/manage-booking" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Manage Booking</Link>
              <Link href="/" className="ml-4 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all">Book Now</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden p-2.5 rounded-xl ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaCalendarAlt className="text-teal-400" />
              <span className="text-teal-200">Your Booking</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Manage Your <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Booking</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              View, modify, or cancel your airport transfer booking in just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {actionSuccess && (
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            actionSuccess.type === 'cancel'
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            <FaCheckCircle className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{actionSuccess.type === 'cancel' ? 'Booking Cancelled' : 'Booking Updated'}</p>
              <p className="text-sm mt-1">{actionSuccess.message}</p>
            </div>
            <button onClick={() => setActionSuccess(null)} className="ml-auto">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!booking ? (
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Find Your Booking</h2>
              <p className="text-gray-600 mb-8 text-center">Enter your booking reference and email address</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                  <FaTimesCircle />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Reference *</label>
                  <input
                    type="text"
                    required
                    value={searchForm.bookingRef}
                    onChange={(e) => setSearchForm({ ...searchForm, bookingRef: e.target.value.toUpperCase() })}
                    placeholder="ATP-XXXXXX"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={searchForm.email}
                    onChange={(e) => setSearchForm({ ...searchForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Find Booking
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Tip: Your booking reference was sent to your email when you booked.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Booking Reference</span>
                    <h2 className="text-2xl font-bold text-gray-900">{booking.ref}</h2>
                  </div>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(booking.status)}`}>
                    <FaCheckCircle /> {booking.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaCalendarAlt className="text-teal-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Date & Time</span>
                        <p className="font-semibold text-gray-900">{booking.date} at {booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaPlane className="text-teal-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Pick-up</span>
                        <p className="font-semibold text-gray-900">{booking.from}</p>
                        {booking.flightNumber && (
                          <p className="text-sm text-gray-500">Flight: {booking.flightNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-cyan-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Drop-off</span>
                        <p className="font-semibold text-gray-900">{booking.to}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaCar className="text-gray-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Vehicle</span>
                        <p className="font-semibold text-gray-900">{booking.vehicle} ({booking.passengers} passengers)</p>
                      </div>
                    </div>
                    {booking.driver && (
                      <div className="p-4 bg-teal-50 rounded-xl">
                        <span className="text-sm text-teal-600 font-medium">Driver Assigned</span>
                        <p className="font-bold text-gray-900">{booking.driver}</p>
                        <p className="text-gray-600">{booking.driverPhone}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total Price</span>
                      <p className="text-3xl font-bold text-teal-600">{booking.price}</p>
                      <span className={`text-sm ${booking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger Info */}
                {booking.passengerName && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaUser className="text-teal-600" /> Passenger Details
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <p className="font-medium">{booking.passengerName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{booking.passengerPhone}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{booking.passengerEmail}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">Special Requests:</span>
                    <p className="text-gray-700">{booking.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Payment Button - Show prominently if payment needed */}
              {needsPayment && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FaCreditCard className="text-orange-500" />
                        Payment Required
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete your payment to confirm your booking
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <FaCreditCard /> Pay Now - {booking.price}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleModifyClick}
                  disabled={!canModifyBooking}
                  className={`flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 rounded-xl font-semibold transition-all ${
                    canModifyBooking
                      ? 'border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-600'
                      : 'border-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaEdit /> Modify Booking
                </button>
                <button
                  onClick={handleCancelClick}
                  disabled={!canCancelBooking}
                  className={`flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 rounded-xl font-semibold transition-all ${
                    canCancelBooking
                      ? 'border-gray-200 text-gray-700 hover:border-red-500 hover:text-red-600'
                      : 'border-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaTimesCircle /> Cancel Booking
                </button>
              </div>

              {/* Track Booking Link */}
              {booking.status !== 'CANCELLED' && (
                <div className="text-center">
                  <Link
                    href={`/track/${booking.ref}`}
                    className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <FaMapMarkerAlt /> Track Your Transfer Live
                  </Link>
                </div>
              )}

              <button
                onClick={() => { setBooking(null); setActionSuccess(null); }}
                className="w-full text-center text-gray-500 hover:text-teal-600 transition-colors"
              >
                Search for another booking
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Cancel Modal */}
      {showCancelModal && cancelInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Cancel Booking</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!cancelInfo.canCancel ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  <FaExclamationTriangle className="inline mr-2" />
                  {cancelInfo.reason || 'This booking cannot be cancelled.'}
                </div>
              ) : (
                <>
                  {/* Cancellation Policy Info */}
                  {cancelInfo.cancellation && (
                    <div className={`rounded-xl p-4 ${
                      cancelInfo.cancellation.refundPercent === 100
                        ? 'bg-green-50 border border-green-200'
                        : cancelInfo.cancellation.refundPercent > 0
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className={`flex-shrink-0 mt-0.5 ${
                          cancelInfo.cancellation.refundPercent === 100 ? 'text-green-600' :
                          cancelInfo.cancellation.refundPercent > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                        <div>
                          <p className="font-semibold">{cancelInfo.cancellation.policy}</p>
                          <p className="text-sm mt-1">{cancelInfo.cancellation.description}</p>
                          <div className="mt-3 pt-3 border-t border-current/10">
                            <p className="text-sm">
                              <FaClock className="inline mr-1" />
                              {cancelInfo.cancellation.hoursBeforePickup} hours before pickup
                            </p>
                            <p className="font-semibold mt-1">
                              Refund: {cancelInfo.cancellation.refundPercent}%
                              {cancelInfo.cancellation.isPaid && cancelInfo.cancellation.refundAmount > 0 && (
                                <span className="ml-1">
                                  ({booking?.currency} {cancelInfo.cancellation.refundAmount.toFixed(2)})
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for cancellation (optional)
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please tell us why you're cancelling..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Warning */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-700 text-sm">
                    <FaExclamationTriangle className="inline mr-2" />
                    This action cannot be undone. Are you sure you want to cancel this booking?
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                Keep Booking
              </button>
              {cancelInfo.canCancel && (
                <button
                  onClick={handleCancelSubmit}
                  disabled={cancelLoading}
                  className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <FaTimesCircle /> Confirm Cancellation
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && modifyInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Modify Booking</h3>
              <button onClick={() => setShowModifyModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!modifyInfo.canModify ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  <FaExclamationTriangle className="inline mr-2" />
                  {modifyInfo.reason || 'This booking cannot be modified.'}
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
                    <FaInfoCircle className="inline mr-2" />
                    Modifications must be made at least {modifyInfo.minHoursRequired} hours before pickup.
                    You have {modifyInfo.hoursUntilPickup} hours remaining.
                  </div>

                  {/* Pickup Date/Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaCalendarAlt className="inline mr-2 text-teal-600" />
                      Pickup Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={modifyForm.pickupTime}
                      onChange={(e) => setModifyForm({ ...modifyForm, pickupTime: e.target.value })}
                      min={new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Flight Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPlane className="inline mr-2 text-teal-600" />
                      Flight Number
                    </label>
                    <input
                      type="text"
                      value={modifyForm.flightNumber}
                      onChange={(e) => setModifyForm({ ...modifyForm, flightNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. TK1234"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Drop-off Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-cyan-600" />
                      Drop-off Address
                    </label>
                    <input
                      type="text"
                      value={modifyForm.dropoffAddress}
                      onChange={(e) => setModifyForm({ ...modifyForm, dropoffAddress: e.target.value })}
                      placeholder="Hotel name or full address"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Passenger Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2 text-gray-600" />
                      Passenger Name
                    </label>
                    <input
                      type="text"
                      value={modifyForm.passengerName}
                      onChange={(e) => setModifyForm({ ...modifyForm, passengerName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Passenger Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="inline mr-2 text-gray-600" />
                      Passenger Phone
                    </label>
                    <input
                      type="tel"
                      value={modifyForm.passengerPhone}
                      onChange={(e) => setModifyForm({ ...modifyForm, passengerPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      value={modifyForm.specialRequests}
                      onChange={(e) => setModifyForm({ ...modifyForm, specialRequests: e.target.value })}
                      placeholder="Child seat, extra luggage, etc."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowModifyModal(false)}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <FaArrowLeft /> Cancel
              </button>
              {modifyInfo.canModify && (
                <button
                  onClick={handleModifySubmit}
                  disabled={modifyLoading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modifyLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600">Amount to pay</p>
                <p className="text-4xl font-bold text-gray-900">{booking.price}</p>
              </div>

              <button
                onClick={() => handlePayment('card')}
                disabled={paymentLoading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <FaCreditCard className="text-xl" />
                Pay with Card
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={() => handlePayment('bank_transfer')}
                disabled={paymentLoading}
                className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Bank Transfer
              </button>

              {paymentLoading && (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-2">Processing...</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment is secured with SSL encryption
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8">
            If you can&apos;t find your booking or need assistance, our support team is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:shadow-lg transition-all">
              Contact Support <FaArrowRight />
            </Link>
            <Link href="/faq" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all">
              View FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={54} className="h-12 w-auto rounded-lg mb-6" />
              <p className="text-white/80 mb-6">Book reliable airport transfers worldwide from verified local suppliers.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-white/80 hover:text-white">Search Transfers</Link></li>
                <li><Link href="/popular-routes" className="text-white/80 hover:text-white">Popular Routes</Link></li>
                <li><Link href="/airport-guides" className="text-white/80 hover:text-white">Airport Guides</Link></li>
                <li><Link href="/travel-tips" className="text-white/80 hover:text-white">Travel Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-white/80 hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="text-white/80 hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="text-white/80 hover:text-white">FAQs</Link></li>
                <li><Link href="/manage-booking" className="text-white/80 hover:text-white">Manage Booking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white"><FaPhone className="text-teal-400" /><span>+90 216 557 52 52</span></li>
                <li className="flex items-center gap-3 text-white"><FaEnvelope className="text-teal-400" /><span>support@airporttransferportal.com</span></li>
              </ul>
              <Link href="/become-partner" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold mt-6">
                Become a Partner <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">&copy; {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-white/70 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/privacy" className="text-white/70 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/cookies" className="text-white/70 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-teal-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ManageBookingContent />
    </Suspense>
  );
}
