'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaMapMarkerAlt,
  FaCar,
  FaExclamationTriangle,
  FaComments,
  FaPlane,
  FaBars,
  FaTimes,
  FaHeadset,
  FaClock,
  FaBell,
} from 'react-icons/fa';

const navigation = [
  { name: 'Dashboard', href: '/dispatch', icon: FaHome },
  { name: 'Live Map', href: '/dispatch/map', icon: FaMapMarkerAlt },
  { name: 'Active Rides', href: '/dispatch/rides', icon: FaCar },
  { name: 'Flight Tracking', href: '/dispatch/flights', icon: FaPlane },
  { name: 'Issues', href: '/dispatch/issues', icon: FaExclamationTriangle },
  { name: 'Messages', href: '/dispatch/messages', icon: FaComments },
];

export default function DispatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-950 to-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <Link href="/dispatch" className="flex items-center gap-2">
            <FaHeadset className="w-8 h-8 text-teal-400" />
            <span className="text-xl font-bold text-white">Dispatch Center</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Shift Status */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Shift Status</span>
            <span className="flex items-center gap-1 text-sm text-green-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              On Duty
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === 'Issues' && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-2xl font-bold text-teal-400">24</div>
              <div className="text-xs text-gray-400">Active Rides</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="text-2xl font-bold text-green-400">18</div>
              <div className="text-xs text-gray-400">Drivers Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <FaBars className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              {/* Current Time */}
              <div className="flex items-center gap-2 text-gray-400">
                <FaClock className="w-4 h-4" />
                <span className="text-sm font-mono">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">D</span>
                </div>
                <span className="text-sm text-white hidden sm:block">Dispatcher</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
