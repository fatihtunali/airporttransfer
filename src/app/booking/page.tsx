'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import {
  FaCar,
  FaUser,
  FaSuitcase,
  FaArrowLeft,
  FaCheck,
  FaShuttleVan,
  FaBus,
  FaCrown,
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaShieldAlt,
  FaLock,
  FaCreditCard,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
  FaUniversity,
  FaMoneyBillWave,
} from 'react-icons/fa';
import PostBookingAccountPrompt from '@/components/PostBookingAccountPrompt';

const vehicleIcons: Record<string, React.ReactNode> = {
  SEDAN: <FaCar className="w-8 h-8" />,
  VAN: <FaShuttleVan className="w-8 h-8" />,
  MINIBUS: <FaBus className="w-8 h-8" />,
  BUS: <FaBus className="w-10 h-10" />,
  VIP: <FaCrown className="w-8 h-8" />,
};

const vehicleCapacity: Record<string, { passengers: number; luggage: number }> = {
  SEDAN: { passengers: 3, luggage: 3 },
  VAN: { passengers: 7, luggage: 7 },
  MINIBUS: { passengers: 16, luggage: 16 },
  BUS: { passengers: 50, luggage: 50 },
  VIP: { passengers: 3, luggage: 3 },
};

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Passenger Details, 2: Payment, 3: Confirmation

  // Get booking parameters from URL
  const optionCode = searchParams.get('optionCode');
  const airportId = searchParams.get('airportId');
  const zoneId = searchParams.get('zoneId');
  const pickupTime = searchParams.get('pickupTime');
  const paxAdults = searchParams.get('paxAdults') || '2';
  const vehicleType = searchParams.get('vehicleType') || 'SEDAN';
  const totalPrice = searchParams.get('totalPrice') || '0';
  const currency = searchParams.get('currency') || 'EUR';
  const supplierName = searchParams.get('supplierName') || 'Transfer Provider';

  // Form state
  const [formData, setFormData] = useState({
    leadPassenger: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      countryCode: '+1',
    },
    flightNumber: '',
    pickupAddress: '',
    dropoffAddress: '',
    specialRequests: '',
    agreeTerms: false,
  });

  const [bookingResult, setBookingResult] = useState<{
    bookingId: string;
    publicCode: string;
    status: string;
  } | null>(null);

  // Account prompt state
  const [accountPromptDismissed, setAccountPromptDismissed] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'pay_later' | 'card' | 'bank_transfer'>('pay_later');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bankDetails, setBankDetails] = useState<{
    bankName: string;
    accountName: string;
    iban: string;
    swift: string;
    reference: string;
    amount: number;
    currency: string;
    dueDate: string;
  } | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('leadPassenger.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        leadPassenger: {
          ...prev.leadPassenger,
          [field]: value,
        },
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone } = formData.leadPassenger;
    if (!firstName || !lastName || !email || !phone) {
      setError('Please fill in all required passenger details');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  };

  const handleContinue = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmitBooking = async () => {
    if (!formData.agreeTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create booking
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionCode,
          airportId: parseInt(airportId!),
          zoneId: parseInt(zoneId!),
          direction: 'FROM_AIRPORT',
          pickupTime,
          paxAdults: parseInt(paxAdults),
          vehicleType,
          currency,
          leadPassenger: {
            ...formData.leadPassenger,
            phone: `${formData.leadPassenger.countryCode}${formData.leadPassenger.phone}`,
          },
          flightNumber: formData.flightNumber,
          pickupAddress: formData.pickupAddress,
          dropoffAddress: formData.dropoffAddress,
          specialRequests: formData.specialRequests,
          paymentMethod: paymentMethod.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      const result = await response.json();
      setBookingResult(result);

      // Step 2: Handle payment based on selected method
      if (paymentMethod === 'card') {
        // Redirect to external payment gateway
        setPaymentProcessing(true);
        const paymentRes = await fetch('/api/public/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingCode: result.publicCode,
            paymentMethod: 'card',
            currency
          }),
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          // Redirect to external payment gateway
          if (paymentData.redirectUrl) {
            window.location.href = paymentData.redirectUrl;
            return;
          }
        }
        setPaymentProcessing(false);
      } else if (paymentMethod === 'bank_transfer') {
        // Get bank transfer details
        const paymentRes = await fetch('/api/public/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingCode: result.publicCode,
            paymentMethod: 'bank_transfer',
            currency
          }),
        });

        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          setBankDetails(paymentData.bankDetails);
        }
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!optionCode || !airportId || !zoneId || !pickupTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Booking Request</h2>
          <p className="text-gray-600 mb-6">Some required booking information is missing.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <FaArrowLeft />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step > 1 && step < 3 ? setStep(step - 1) : router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <FaArrowLeft />
              <span className="font-medium">{step === 1 ? 'Back to Results' : 'Back'}</span>
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FaCar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Airport Transfer Portal</span>
            </Link>
            <div className="flex items-center gap-2">
              <FaLock className="text-green-500" />
              <span className="text-sm text-gray-600 hidden sm:block">Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {['Passenger Details', 'Review & Pay', 'Confirmation'].map((label, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                  step > idx + 1 ? 'bg-green-500 text-white' :
                  step === idx + 1 ? 'bg-teal-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > idx + 1 ? <FaCheck /> : idx + 1}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  step === idx + 1 ? 'text-teal-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {idx < 2 && (
                  <div className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                    step > idx + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Passenger Details</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="leadPassenger.firstName"
                        value={formData.leadPassenger.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="leadPassenger.lastName"
                        value={formData.leadPassenger.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2 text-teal-600" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="leadPassenger.email"
                      value={formData.leadPassenger.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      placeholder="john.doe@email.com"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Booking confirmation will be sent here</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPhone className="inline mr-2 text-teal-600" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="leadPassenger.countryCode"
                        value={formData.leadPassenger.countryCode}
                        onChange={handleInputChange}
                        className="w-24 px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+49">+49</option>
                        <option value="+33">+33</option>
                        <option value="+90">+90</option>
                        <option value="+31">+31</option>
                        <option value="+34">+34</option>
                        <option value="+39">+39</option>
                      </select>
                      <input
                        type="tel"
                        name="leadPassenger.phone"
                        value={formData.leadPassenger.phone}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                        placeholder="555 123 4567"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Driver will contact you via this number</p>
                  </div>

                  <hr className="my-6" />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPlane className="inline mr-2 text-teal-600" />
                      Flight Number
                    </label>
                    <input
                      type="text"
                      name="flightNumber"
                      value={formData.flightNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      placeholder="e.g. TK1234"
                    />
                    <p className="text-sm text-gray-500 mt-1">We will track your flight for delays</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-cyan-600" />
                      Drop-off Address (Hotel/Address)
                    </label>
                    <input
                      type="text"
                      name="dropoffAddress"
                      value={formData.dropoffAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                      placeholder="Hotel name or full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all resize-none"
                      placeholder="Child seat, extra luggage, wheelchair access, etc."
                    />
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <FaArrowLeft className="rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Complete Booking</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    {error}
                  </div>
                )}

                {/* Passenger Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Passenger Details</h3>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {formData.leadPassenger.firstName} {formData.leadPassenger.lastName}</p>
                    <p><span className="text-gray-500">Email:</span> {formData.leadPassenger.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {formData.leadPassenger.countryCode} {formData.leadPassenger.phone}</p>
                    {formData.flightNumber && <p><span className="text-gray-500">Flight:</span> {formData.flightNumber}</p>}
                  </div>
                  {formData.dropoffAddress && (
                    <p className="text-sm mt-2"><span className="text-gray-500">Drop-off:</span> {formData.dropoffAddress}</p>
                  )}
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    {/* Pay Later Option */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'pay_later'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_later"
                        checked={paymentMethod === 'pay_later'}
                        onChange={() => setPaymentMethod('pay_later')}
                        className="mt-1 w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FaMoneyBillWave className="text-green-500" />
                          <span className="font-semibold text-gray-900">Pay Later</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Popular</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          No payment required now. Pay the driver directly in cash or card upon arrival.
                        </p>
                      </div>
                    </label>

                    {/* Credit Card Option */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="mt-1 w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FaCreditCard className="text-blue-500" />
                          <span className="font-semibold text-gray-900">Credit / Debit Card</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Secure</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay securely with Visa, Mastercard, or American Express. Instant confirmation.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <img src="/images/visa.svg" alt="Visa" className="h-6" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          <img src="/images/mastercard.svg" alt="Mastercard" className="h-6" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          <img src="/images/amex.svg" alt="Amex" className="h-6" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-1 w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FaUniversity className="text-purple-500" />
                          <span className="font-semibold text-gray-900">Bank Transfer</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay via bank transfer. We will send you bank details after booking confirmation.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Terms */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-teal-600 hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
                      I understand that I will receive booking confirmation via email.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleSubmitBooking}
                  disabled={loading || paymentProcessing}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || paymentProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {paymentProcessing ? 'Redirecting to payment...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'card' ? <FaCreditCard /> : <FaCheck />}
                      {paymentMethod === 'card' ? 'Proceed to Payment' : 'Confirm Booking'}
                    </>
                  )}
                </button>
              </div>
            )}

            {step === 3 && bookingResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Your transfer has been successfully booked. A confirmation email has been sent to {formData.leadPassenger.email}.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Booking Reference</p>
                      <p className="text-xl font-bold text-teal-600">{bookingResult.publicCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-xl font-bold text-green-600 capitalize">{bookingResult.status}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                {bankDetails && paymentMethod === 'bank_transfer' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-4">
                      <FaUniversity className="text-purple-600" />
                      <h3 className="font-bold text-purple-900">Bank Transfer Details</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Name:</span>
                        <span className="font-semibold text-gray-900">{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name:</span>
                        <span className="font-semibold text-gray-900">{bankDetails.accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IBAN:</span>
                        <span className="font-mono font-semibold text-gray-900">{bankDetails.iban}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SWIFT/BIC:</span>
                        <span className="font-mono font-semibold text-gray-900">{bankDetails.swift}</span>
                      </div>
                      <hr className="border-purple-200" />
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-mono font-bold text-purple-700">{bankDetails.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-purple-700">{bankDetails.currency} {bankDetails.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-semibold text-orange-600">{bankDetails.dueDate}</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-4">
                      * Please use the reference number exactly as shown when making the transfer.
                    </p>
                  </div>
                )}

                {/* Pay Later Info */}
                {paymentMethod === 'pay_later' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMoneyBillWave className="text-green-600" />
                      <h3 className="font-bold text-green-900">Pay Later Selected</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      You can pay the driver directly upon arrival. We accept cash and card payments.
                      The total amount is <strong>{currency} {parseFloat(totalPrice).toFixed(2)}</strong>.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    <strong>Save your booking reference:</strong> {bookingResult.publicCode}<br />
                    You will need this to manage your booking.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href={`/manage-booking?ref=${bookingResult.publicCode}`}
                    className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all"
                  >
                    View Booking
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Book Another Transfer
                  </Link>
                </div>

                {/* Post-Booking Account Prompt */}
                {!accountPromptDismissed && (
                  <div className="mt-8">
                    <PostBookingAccountPrompt
                      bookingCode={bookingResult.publicCode}
                      customerEmail={formData.leadPassenger.email}
                      customerName={`${formData.leadPassenger.firstName} ${formData.leadPassenger.lastName}`}
                      onAccountCreated={(customerId) => {
                        console.log('Account created:', customerId);
                        setAccountPromptDismissed(true);
                      }}
                      onSkip={() => setAccountPromptDismissed(true)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>

              {/* Vehicle Card */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                    {vehicleIcons[vehicleType] || <FaCar className="w-8 h-8" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{vehicleType}</h4>
                    <p className="text-sm text-gray-600">{supplierName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FaUser className="text-teal-600" />
                    {vehicleCapacity[vehicleType]?.passengers || 4}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaSuitcase className="text-teal-600" />
                    {vehicleCapacity[vehicleType]?.luggage || 4}
                  </span>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <FaCalendarAlt className="text-teal-600" />
                  <span className="text-gray-700">{pickupTime && formatDate(pickupTime)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FaClock className="text-teal-600" />
                  <span className="text-gray-700">{pickupTime && formatTime(pickupTime)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FaUsers className="text-teal-600" />
                  <span className="text-gray-700">{paxAdults} passengers</span>
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-4 mb-4">
                <div className="space-y-2 text-sm">
                  {['Meet & Greet', 'Flight Tracking', '60 min free waiting', 'Free Cancellation'].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-600">
                      <FaCheck className="text-green-500 text-xs" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{currency} {parseFloat(totalPrice).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                    {currency} {parseFloat(totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <FaShieldAlt className="text-green-500" />
                <span>Secure booking</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-teal-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
            <FaCar className="absolute inset-0 m-auto w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Booking</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
