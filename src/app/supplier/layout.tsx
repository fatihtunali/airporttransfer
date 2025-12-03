'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  useEffect(() => {
    const fetchSupplierInfo = async () => {
      try {
        const res = await fetch('/api/supplier/me');
        if (res.ok) {
          const data = await res.json();
          setSupplier(data);
        } else if (res.status === 401) {
          router.push('/supplier/login');
          return;
        }

        // Fetch expiry alerts
        const alertRes = await fetch('/api/supplier/expiring-documents');
        if (alertRes.ok) {
          const alertData = await alertRes.json();
          setExpiryAlert(alertData.alert);
        }
      } catch (error) {
        console.error('Error fetching supplier info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierInfo();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/supplier/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <Link href="/supplier" className="flex items-center gap-3">
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={140}
                height={42}
                className="h-9 w-auto bg-white rounded p-1"
              />
            </Link>
            <p className="text-xs text-gray-500 mt-2">Supplier Portal</p>
          </div>

          {/* Supplier Info */}
          {supplier && (
            <div className="p-4 border-b border-gray-800">
              <p className="text-white font-medium truncate">{supplier.name}</p>
              <span
                className={`inline-flex items-center gap-1 text-xs mt-1 ${
                  supplier.isVerified ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                {supplier.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
              </span>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FaBars className="w-5 h-5" />
            </button>

            <div className="flex-1 lg:ml-0 ml-4">
              {/* Breadcrumb or page title can go here */}
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Document Expiry Alert */}
          {expiryAlert && expiryAlert.level !== 'none' && (
            <div
              className={`px-4 py-2 flex items-center gap-2 text-sm ${
                expiryAlert.level === 'expired'
                  ? 'bg-red-100 text-red-800'
                  : expiryAlert.level === 'critical'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <FaExclamationTriangle />
              <span>{expiryAlert.message}</span>
              <Link
                href="/supplier/documents"
                className="ml-auto underline font-medium"
              >
                View Documents
              </Link>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
