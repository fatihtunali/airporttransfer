'use client';

import { useState } from 'react';
import { FaUser, FaGoogle, FaLock, FaCheck, FaGift, FaClock, FaHistory } from 'react-icons/fa';

interface PostBookingAccountPromptProps {
  bookingCode: string;
  customerEmail: string;
  customerName: string;
  onAccountCreated?: (customerId: number) => void;
  onSkip?: () => void;
}

type Step = 'prompt' | 'password' | 'success' | 'already-exists';

export default function PostBookingAccountPrompt({
  bookingCode,
  customerEmail,
  customerName,
  onAccountCreated,
  onSkip,
}: PostBookingAccountPromptProps) {
  const [step, setStep] = useState<Step>('prompt');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateWithPassword = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/convert-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode,
          email: customerEmail,
          password,
          name: customerName,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep('success');
        if (data.customerId && onAccountCreated) {
          onAccountCreated(data.customerId);
        }
      } else if (data.accountExists) {
        setStep('already-exists');
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as unknown as { google?: unknown }).google) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
      document.head.appendChild(script);
    });
  };

  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      setError('Google Sign-In is not configured.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Load Google script if not already loaded
      await loadGoogleScript();

      const google = (window as unknown as { google: { accounts: { id: { initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean }) => void; prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason: () => string }) => void) => void } } } }).google;

      if (!google?.accounts?.id) {
        setError('Google Sign-In failed to load. Please use password instead.');
        setLoading(false);
        return;
      }

      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential: string }) => {
          try {
            const res = await fetch('/api/customer/convert-guest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingCode,
                email: customerEmail,
                googleCredential: response.credential,
                name: customerName,
              }),
            });

            const data = await res.json();
            if (data.success) {
              setStep('success');
              if (data.customerId && onAccountCreated) {
                onAccountCreated(data.customerId);
              }
            } else {
              setError(data.error || 'Failed to link Google account');
            }
          } catch {
            setError('Something went wrong. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      });

      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setError(`Google Sign-In unavailable: ${notification.getNotDisplayedReason?.() || 'popup blocked or dismissed'}. Please use password instead.`);
          setLoading(false);
        }
      });
    } catch {
      setError('Failed to load Google Sign-In. Please use password instead.');
      setLoading(false);
    }
  };

  const handleLoginExisting = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/customer/convert-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode,
          email: customerEmail,
          password,
          linkToExisting: true,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep('success');
        if (data.customerId && onAccountCreated) {
          onAccountCreated(data.customerId);
        }
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prompt step - initial offer
  if (step === 'prompt') {
    return (
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Save Your Details for Next Time?
          </h3>
          <p className="text-gray-600">
            Create an account to manage your bookings easily
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <FaHistory className="w-4 h-4 text-teal-600" />
            </div>
            <span>Track all your bookings in one place</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <FaClock className="w-4 h-4 text-teal-600" />
            </div>
            <span>Faster checkout next time</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
              <FaGift className="w-4 h-4 text-teal-600" />
            </div>
            <span>Earn loyalty points on every booking</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setStep('password')}
            className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaLock className="w-4 h-4" />
            Create Account with Password
          </button>

          {googleClientId && (
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaGoogle className="w-4 h-4 text-red-500" />
              Continue with Google
            </button>
          )}

          <button
            onClick={onSkip}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            No thanks, continue as guest
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Your email: <span className="font-medium">{customerEmail}</span>
        </p>
      </div>
    );
  }

  // Password step - create account with password
  if (step === 'password') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Set Your Password
          </h3>
          <p className="text-gray-600 text-sm">
            Your email: <span className="font-medium">{customerEmail}</span>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCreateWithPassword}
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <button
            onClick={() => setStep('prompt')}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Already exists step - login to link booking
  if (step === 'already-exists') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h3>
          <p className="text-gray-600">
            An account with <span className="font-medium">{customerEmail}</span> already exists.
            <br />
            Log in to link this booking to your account.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleLoginExisting}
            disabled={loading}
            className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Linking...' : 'Log In & Link Booking'}
          </button>

          {googleClientId && (
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaGoogle className="w-4 h-4 text-red-500" />
              Log in with Google
            </button>
          )}

          <button
            onClick={onSkip}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // Success step
  if (step === 'success') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Account Created!
          </h3>
          <p className="text-gray-600 mb-4">
            Your booking has been linked to your account.
            <br />
            You can now track all your bookings in one place.
          </p>

          <a
            href="/customer/dashboard"
            className="inline-block py-3 px-6 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            Go to My Bookings
          </a>
        </div>
      </div>
    );
  }

  return null;
}
