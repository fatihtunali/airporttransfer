'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaHome,
  FaCalendarAlt,
  FaUsers,
  FaFileInvoiceDollar,
  FaPalette,
  FaCode,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaKey,
  FaCreditCard,
} from 'react-icons/fa';

interface AgencyInfo {
  id: number;
  name: string;
  creditBalance: number;
  currency: string;
}

const menuItems = [
  { href: '/agency', icon: FaHome, label: 'Dashboard' },
  { href: '/agency/bookings', icon: FaCalendarAlt, label: 'Bookings' },
  { href: '/agency/team', icon: FaUsers, label: 'Team' },
  { href: '/agency/invoices', icon: FaFileInvoiceDollar, label: 'Invoices' },
  { href: '/agency/credits', icon: FaCreditCard, label: 'Credits' },
  { href: '/agency/whitelabel', icon: FaPalette, label: 'White Label' },
  { href: '/agency/api', icon: FaCode, label: 'API & Widget' },
  { href: '/agency/settings', icon: FaCog, label: 'Settings' },
];

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agency, setAgency] = useState<AgencyInfo | null>(null);

  useEffect(() => {
    fetchAgencyInfo();
  }, []);

  const fetchAgencyInfo = async () => {
    try {
      const res = await fetch('/api/agency/me');
      if (res.ok) {
        const data = await res.json();
        setAgency(data);
      } else if (res.status === 401) {
        router.push('/agency/login');
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/agency/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't show layout for login/register pages
  if (pathname === '/agency/login' || pathname === '/agency/register') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <Link href="/agency" className="flex items-center gap-2">
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={140}
                height={40}
                className="h-8 w-auto rounded"
              />
            </Link>
            <p className="text-xs text-emerald-600 font-medium mt-1">Agency Portal</p>
          </div>

          {/* Agency Info */}
          {agency && (
            <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
              <p className="text-sm font-medium text-gray-900 truncate">{agency.name}</p>
              <p className="text-xs text-gray-600 mt-1">
                Credit: {agency.currency} {agency.creditBalance.toFixed(2)}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 w-full transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <FaBars className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <Link
                href="/agency/api"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
              >
                <FaKey className="w-4 h-4" />
                <span className="hidden sm:inline">API Keys</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
