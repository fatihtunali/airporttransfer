'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaCar,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaArrowLeft,
  FaPlane,
  FaCheck,
  FaSpinner,
} from 'react-icons/fa';

interface TrackingData {
  type: string;
  timestamp: string;
  booking: {
    code: string;
    status: string;
  };
  driver: {
    id: number;
    name: string;
    phone: string;
    photo: string | null;
    vehicle: {
      plate: string;
      model: string;
      color: string;
    };
    location: {
      lat: number;
      lng: number;
      heading: number;
      speed: number;
      status: string;
    } | null;
    eta: number | null;
  } | null;
  route: {
    pickup: {
      address: string;
      lat: number | null;
      lng: number | null;
    };
    dropoff: {
      address: string;
      lat: number | null;
      lng: number | null;
    };
  };
  lastEvent: {
    type: string;
    time: string;
  } | null;
}

const statusMessages: Record<string, { text: string; color: string }> = {
  PENDING_ASSIGN: { text: 'Finding your driver...', color: 'text-yellow-600' },
  ASSIGNED: { text: 'Driver assigned', color: 'text-blue-600' },
  ON_WAY: { text: 'Driver is on the way', color: 'text-teal-600' },
  AT_PICKUP: { text: 'Driver has arrived!', color: 'text-green-600' },
  IN_RIDE: { text: 'On the way to destination', color: 'text-purple-600' },
  COMPLETED: { text: 'Ride completed', color: 'text-green-700' },
  CANCELLED: { text: 'Ride cancelled', color: 'text-red-600' },
};

export default function TrackingPage() {
  const params = useParams();
  const bookingCode = params.bookingCode as string;

  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!bookingCode) return;

    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/tracking/${bookingCode}`);

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'error') {
            setError(data.message);
          } else {
            setTracking(data);
          }
        } catch {
          console.error('Failed to parse tracking data');
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        // Reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, [bookingCode]);

  const status = tracking?.booking.status || 'PENDING_ASSIGN';
  const statusInfo = statusMessages[status] || { text: 'Unknown status', color: 'text-gray-600' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/manage-booking?ref=${bookingCode}`}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <FaArrowLeft />
              <span className="font-medium">Back to Booking</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm text-gray-600">{connected ? 'Live' : 'Reconnecting...'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {error ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCar className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Tracking Not Available</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href={`/manage-booking?ref=${bookingCode}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all"
            >
              View Booking Details
            </Link>
          </div>
        ) : (
          <>
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Booking: {bookingCode}</span>
                <span className={`text-sm font-semibold ${statusInfo.color}`}>
                  {status}
                </span>
              </div>

              <div className="text-center py-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  status === 'COMPLETED' ? 'bg-green-100' :
                  status === 'CANCELLED' ? 'bg-red-100' :
                  status === 'AT_PICKUP' ? 'bg-green-100' :
                  'bg-teal-100'
                }`}>
                  {status === 'PENDING_ASSIGN' ? (
                    <FaSpinner className="w-10 h-10 text-teal-500 animate-spin" />
                  ) : status === 'COMPLETED' ? (
                    <FaCheck className="w-10 h-10 text-green-500" />
                  ) : (
                    <FaCar className={`w-10 h-10 ${
                      status === 'CANCELLED' ? 'text-red-500' :
                      status === 'AT_PICKUP' ? 'text-green-500' :
                      'text-teal-500'
                    }`} />
                  )}
                </div>
                <h2 className={`text-2xl font-bold ${statusInfo.color}`}>
                  {statusInfo.text}
                </h2>
                {tracking?.driver?.eta && status !== 'AT_PICKUP' && status !== 'COMPLETED' && (
                  <p className="text-gray-600 mt-2">
                    <FaClock className="inline mr-2" />
                    ETA: <span className="font-semibold">{tracking.driver.eta} minutes</span>
                  </p>
                )}
              </div>
            </div>

            {/* Driver Info */}
            {tracking?.driver && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Driver</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {tracking.driver.photo ? (
                      <img
                        src={tracking.driver.photo}
                        alt={tracking.driver.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FaUser className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{tracking.driver.name}</h4>
                    <p className="text-sm text-gray-600">
                      {tracking.driver.vehicle.color} {tracking.driver.vehicle.model}
                    </p>
                    <p className="text-sm font-mono text-teal-600">
                      {tracking.driver.vehicle.plate}
                    </p>
                  </div>
                  <a
                    href={`tel:${tracking.driver.phone}`}
                    className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  >
                    <FaPhone />
                  </a>
                </div>

                {/* Driver Location Status */}
                {tracking.driver.location && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${
                        tracking.driver.location.status === 'ONLINE' ? 'bg-green-500' :
                        tracking.driver.location.status === 'ON_TRIP' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <span>
                        {tracking.driver.location.status === 'ONLINE' ? 'Online' :
                         tracking.driver.location.status === 'ON_TRIP' ? 'On Trip' :
                         'Offline'}
                      </span>
                      {tracking.driver.location.speed && tracking.driver.location.speed > 0 && (
                        <span className="ml-2">
                          • Moving at {Math.round(tracking.driver.location.speed)} km/h
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Route Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Trip Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPlane className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pick-up</p>
                    <p className="font-medium text-gray-900">
                      {tracking?.route.pickup.address || 'Loading...'}
                    </p>
                  </div>
                </div>
                <div className="ml-4 border-l-2 border-dashed border-gray-200 h-8" />
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Drop-off</p>
                    <p className="font-medium text-gray-900">
                      {tracking?.route.dropoff.address || 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="h-64 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="w-12 h-12 text-teal-400 mx-auto mb-2" />
                  <p className="text-gray-500">Live map view</p>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
            </div>

            {/* Last Event */}
            {tracking?.lastEvent && (
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                <p>
                  Last update: {tracking.lastEvent.type.replace(/_/g, ' ').toLowerCase()}
                  {' '}at{' '}
                  {new Date(tracking.lastEvent.time).toLocaleTimeString()}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
