'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FaHome,
  FaCalendarAlt,
  FaCar,
  FaUsers,
  FaMoneyBillWave,
  FaTags,
  FaFileAlt,
  FaStar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChevronDown,
  FaPlane,
  FaHeadset,
  FaMapMarkerAlt,
} from 'react-icons/fa';

interface SupplierInfo {
  id: number;
  name: string;
  isVerified: boolean;
}

interface ExpiryAlert {
  level: 'none' | 'warning' | 'critical' | 'expired';
  message: string;
}

const navItems = [
  { href: '/supplier', label: 'Dashboard', icon: FaHome },
  { href: '/supplier/bookings', label: 'Bookings', icon: FaCalendarAlt },
  { href: '/supplier/zones', label: 'Service Zones', icon: FaMapMarkerAlt },
  { href: '/supplier/vehicles', label: 'Vehicles', icon: FaCar },
  { href: '/supplier/drivers', label: 'Drivers', icon: FaUsers },
  { href: '/supplier/pricing', label: 'Pricing', icon: FaTags },
  { href: '/supplier/documents', label: 'Documents', icon: FaFileAlt },
  { href: '/supplier/reviews', label: 'Reviews', icon: FaStar },
  { href: '/supplier/payouts', label: 'Payouts', icon: FaMoneyBillWave },
  { href: '/supplier/settings', label: 'Settings', icon: FaCog },
];

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [expiryAlert, setExpiryAlert] = useState<ExpiryAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Skip layout for login and register pages
  const isAuthPage = pathname === '/supplier/login' || pathname === '/supplier/register';

  useEffect(() => {
    // Don't fetch supplier info for auth pages
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    const fetchSupplierInfo = async () => {
      try {
        const res = await fetch('/api/supplier/me');
        if (res.ok) {
          const data = await res.json();
          setSupplier(data);

          // Fetch expiry alerts only if authenticated
          const alertRes = await fetch('/api/supplier/expiring-documents');
          if (alertRes.ok) {
            const alertData = await alertRes.json();
            setExpiryAlert(alertData.alert);
          }
        } else {
          // Any non-OK response (401, 403, etc.) - redirect to login
          router.push('/supplier/login');
          return;
        }
      } catch (error) {
        console.error('Error fetching supplier info:', error);
        // On error, redirect to login as well
        router.push('/supplier/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierInfo();
  }, [router, isAuthPage]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/supplier/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // For login/register pages, just render children without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <FaCar className="absolute inset-0 m-auto w-6 h-6 text-primary" />
          </div>
          <p className="text-gray-500">Loading supplier portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-gray-900 via-teal-900 to-gray-950 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/supplier" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaPlane className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">ATP</span>
                  <p className="text-xs text-white/60">Supplier Portal</p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Supplier Info */}
          {supplier && (
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {supplier.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{supplier.name}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs mt-1 px-2 py-0.5 rounded-full ${
                      supplier.isVerified
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {supplier.isVerified ? (
                      <>
                        <FaCheckCircle className="w-3 h-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="w-3 h-3" />
                        Pending
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Support Link */}
          <div className="p-4 border-t border-white/10">
            <a
              href="mailto:support@airporttransferportal.com"
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <FaHeadset className="w-4 h-4" />
              </div>
              <span className="font-medium">Support</span>
            </a>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <FaSignOutAlt className="w-4 h-4" />
              </div>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FaBars className="w-5 h-5" />
              </button>

              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-gray-800">
                  {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">Manage your transfer business</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold">
                    {supplier?.name.charAt(0) || 'S'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-800">{supplier?.name}</p>
                    <p className="text-xs text-gray-500">Supplier</p>
                  </div>
                  <FaChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <Link
                        href="/supplier/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaCog className="w-4 h-4 text-gray-400" />
                        <span>Settings</span>
                      </Link>
                      <Link
                        href="/supplier/documents"
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <FaFileAlt className="w-4 h-4 text-gray-400" />
                        <span>Documents</span>
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Document Expiry Alert */}
          {expiryAlert && expiryAlert.level !== 'none' && (
            <div
              className={`px-4 lg:px-6 py-3 flex items-center gap-3 text-sm border-t ${
                expiryAlert.level === 'expired'
                  ? 'bg-red-50 text-red-700 border-red-100'
                  : expiryAlert.level === 'critical'
                  ? 'bg-orange-50 text-orange-700 border-orange-100'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-100'
              }`}
            >
              <FaExclamationTriangle className="flex-shrink-0" />
              <span className="flex-1">{expiryAlert.message}</span>
              <Link
                href="/supplier/documents"
                className="font-semibold hover:underline whitespace-nowrap"
              >
                View Documents →
              </Link>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>

        {/* Footer */}
        <footer className="p-4 lg:p-6 border-t border-gray-100 bg-white/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a>
              <a href="mailto:support@airporttransferportal.com" className="hover:text-teal-600 transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
