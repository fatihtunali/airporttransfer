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
  FaExclamationTriangle,
  FaRedo,
} from 'react-icons/fa';

function PaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingCode = params.bookingCode as string;
  const status = searchParams.get('status');
  const errorMessage = searchParams.get('error');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | 'cancelled'>('pending');
  const [bookingDetails, setBookingDetails] = useState<{
    amount: number;
    currency: string;
  } | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Handle payment status from URL params (callback from payment gateway)
    if (status === 'cancelled') {
      setPaymentStatus('cancelled');
      setError('Payment was cancelled. You can try again or choose a different payment method.');
      setLoading(false);
      return;
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      setError(errorMessage || 'Payment failed. Please try again or contact support.');
      setLoading(false);
      return;
    }

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
  }, [bookingCode, status, errorMessage]);

  const handlePayWithCard = async () => {
    setRedirecting(true);
    setError(null);

    try {
      const res = await fetch('/api/public/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode,
          paymentMethod: 'card',
          currency: bookingDetails?.currency || 'EUR'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        } else {
          throw new Error('No payment URL received');
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      setRedirecting(false);
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
          {/* Status-based header */}
          {paymentStatus === 'cancelled' ? (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
              <p className="text-gray-600 mt-1">Booking: {bookingCode}</p>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
              <p className="text-gray-600 mt-1">Booking: {bookingCode}</p>
            </div>
          ) : (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600 mt-1">Booking: {bookingCode}</p>
            </div>
          )}

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

          {/* Payment Actions */}
          <div className="space-y-4">
            <button
              onClick={handlePayWithCard}
              disabled={redirecting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redirecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting to Payment...
                </>
              ) : (
                <>
                  {paymentStatus === 'failed' || paymentStatus === 'cancelled' ? (
                    <>
                      <FaRedo />
                      Try Again
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Pay with Card
                    </>
                  )}
                </>
              )}
            </button>

            <Link
              href={`/manage-booking?ref=${bookingCode}`}
              className="block w-full py-3 text-center bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              View Booking Details
            </Link>
          </div>

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
              Your payment is processed securely through our payment partner. We never store your card details.
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
