'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaEnvelope,
  FaLock,
  FaSpinner,
  FaShieldAlt,
  FaServer,
  FaChartLine,
  FaUsers,
  FaCheck,
} from 'react-icons/fa';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      // Check if user is admin
      if (data.user?.role !== 'ADMIN') {
        setError('Access denied. Admin role required.');
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <FaShieldAlt className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-3xl">ATP Admin</span>
              <p className="text-slate-400">Control Panel</p>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            Manage Your<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Transfer Platform
            </span>
          </h1>
          <p className="text-slate-400 text-xl mb-16 max-w-lg">
            Access comprehensive tools to manage bookings, suppliers, routes, and more from a single dashboard.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <FaChartLine className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Real-time Analytics</h3>
              <p className="text-slate-500 text-sm">Monitor performance metrics</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <FaUsers className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">User Management</h3>
              <p className="text-slate-500 text-sm">Control access levels</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <FaServer className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">System Health</h3>
              <p className="text-slate-500 text-sm">Monitor infrastructure</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <FaShieldAlt className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Security First</h3>
              <p className="text-slate-500 text-sm">Enterprise-grade protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaShieldAlt className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-2xl text-white">ATP Admin</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-400 mt-2">Sign in to access the admin panel</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FaCheck className="text-green-500" />
                  Secure Login
                </span>
                <span className="flex items-center gap-1.5">
                  <FaShieldAlt className="text-green-500" />
                  SSL Protected
                </span>
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
              <FaLock className="text-slate-600" />
              This is a secure area. Unauthorized access is prohibited.
            </p>
          </div>

          {/* Back link */}
          <p className="text-center mt-6 text-slate-500 text-sm">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Back to main site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
