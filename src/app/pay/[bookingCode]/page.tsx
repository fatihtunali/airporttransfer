'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  FaCar,
  FaCreditCard,
  FaLock,
  FaCheck,
  FaArrowLeft,
  FaShieldAlt,
} from 'react-icons/fa';

function PaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingCode = params.bookingCode as string;
  const clientSecret = searchParams.get('secret');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [bookingDetails, setBookingDetails] = useState<{
    amount: number;
    currency: string;
  } | null>(null);

  // Card input state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    // Fetch booking payment details
    const fetchPaymentDetails = async () => {
      try {
        const res = await fetch(`/api/public/payments?bookingCode=${bookingCode}`);
        if (res.ok) {
          const data = await res.json();
          setBookingDetails({
            amount: data.amount,
            currency: data.currency
          });

          if (data.isPaid) {
            setPaymentStatus('success');
          }
        } else {
          setError('Could not load payment details');
        }
      } catch {
        setError('Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [bookingCode]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError('Please fill in all card details');
      return;
    }

    setPaymentStatus('processing');
    setError(null);

    // Note: In production, this would use Stripe.js/Elements
    // For now, simulate payment processing
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, you would use:
      // const stripe = await loadStripe(publishableKey);
      // const result = await stripe.confirmCardPayment(clientSecret, {...});

      // For demo, assume success
      setPaymentStatus('success');

      // Redirect to confirmation after delay
      setTimeout(() => {
        router.push(`/manage-booking?ref=${bookingCode}&payment=success`);
      }, 3000);
    } catch {
      setPaymentStatus('failed');
      setError('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <FaCreditCard className="absolute inset-0 m-auto w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Payment</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You will receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Booking Reference</p>
            <p className="text-xl font-bold text-teal-600">{bookingCode}</p>
          </div>
          <Link
            href={`/manage-booking?ref=${bookingCode}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            View Booking Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FaArrowLeft />
              <span className="font-medium">Back</span>
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FaCar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">Airport Transfer Portal</span>
            </Link>
            <div className="flex items-center gap-2">
              <FaLock className="text-green-500" />
              <span className="text-sm text-gray-600 hidden sm:block">Secure Payment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
            <p className="text-gray-600 mt-1">Booking: {bookingCode}</p>
          </div>

          {bookingDetails && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-500">Amount to Pay</p>
              <p className="text-3xl font-bold text-gray-900">
                {bookingDetails.currency} {bookingDetails.amount.toFixed(2)}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={paymentStatus === 'processing'}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {paymentStatus === 'processing' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <FaLock />
                  Pay {bookingDetails ? `${bookingDetails.currency} ${bookingDetails.amount.toFixed(2)}` : ''}
                </>
              )}
            </button>
          </form>

          {/* Security Badges */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FaShieldAlt className="text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1">
                <FaLock className="text-blue-500" />
                <span>PCI Compliant</span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-4">
              Your payment information is encrypted and secure. We never store your full card details.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            <FaCreditCard className="absolute inset-0 m-auto w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Payment</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
