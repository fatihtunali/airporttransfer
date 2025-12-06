'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaPlane,
  FaCar,
  FaUserTie,
  FaCheck,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

interface RideDetails {
  id: number;
  status: string;
  driverId: number | null;
  vehicleId: number | null;
  booking: {
    publicCode: string;
    pickupDatetime: string;
    paxAdults: number;
    paxChildren: number;
    airportCode: string;
    zoneName: string;
    direction: string;
    flightNumber: string | null;
    pickupAddress: string | null;
    dropoffAddress: string | null;
    customerNotes: string | null;
  };
  passenger: {
    name: string | null;
    phone: string | null;
    email: string | null;
  };
  driver: {
    id: number;
    name: string;
    phone: string;
  } | null;
  vehicle: {
    id: number;
    plateNumber: string;
    vehicleType: string;
    brand: string;
    model: string;
  } | null;
}

interface Driver {
  id: number;
  fullName: string;
  phone: string;
  isActive: boolean;
}

interface Vehicle {
  id: number;
  plateNumber: string;
  vehicleType: string;
  brand: string;
  model: string;
  isActive: boolean;
}

const statusColors: Record<string, string> = {
  PENDING_ASSIGN: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  ON_WAY: 'bg-purple-100 text-purple-800',
  AT_PICKUP: 'bg-indigo-100 text-indigo-800',
  IN_RIDE: 'bg-sky-100 text-sky-800',
  FINISHED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  PENDING_ASSIGN: 'Pending Assignment',
  ASSIGNED: 'Driver Assigned',
  ON_WAY: 'Driver On Way',
  AT_PICKUP: 'At Pickup Location',
  IN_RIDE: 'In Progress',
  FINISHED: 'Completed',
  NO_SHOW: 'No Show',
  CANCELLED: 'Cancelled',
};

export default function SupplierBookingDetail({ params }: { params: Promise<{ rideId: string }> }) {
  const { rideId } = use(params);
  const [ride, setRide] = useState<RideDetails | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchRideDetails();
    fetchDrivers();
    fetchVehicles();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const res = await fetch(`/api/supplier/rides/${rideId}`);
      if (res.ok) {
        const data = await res.json();
        setRide(data);
        setSelectedDriver(data.driverId);
        setSelectedVehicle(data.vehicleId);
      } else {
        setError('Failed to load booking details');
      }
    } catch (err) {
      console.error('Error fetching ride:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/supplier/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers((data.items || []).filter((d: Driver) => d.isActive));
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/supplier/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles((data.items || []).filter((v: Vehicle) => v.isActive));
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      setError('Please select a driver');
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/supplier/rides/${rideId}/assign-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: selectedDriver,
          vehicleId: selectedVehicle || undefined,
        }),
      });

      if (res.ok) {
        setSuccess('Driver assigned successfully!');
        fetchRideDetails();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to assign driver');
      }
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError('Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/supplier/rides/${rideId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSuccess(`Status updated to ${statusLabels[newStatus] || newStatus}`);
        fetchRideDetails();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const transitions: Record<string, string> = {
      ASSIGNED: 'ON_WAY',
      ON_WAY: 'AT_PICKUP',
      AT_PICKUP: 'IN_RIDE',
      IN_RIDE: 'FINISHED',
    };
    return transitions[currentStatus] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin w-8 h-8 text-sky-500" />
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Booking not found</p>
        <Link href="/supplier/bookings" className="text-sky-600 hover:underline mt-4 inline-block">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const nextStatus = getNextStatus(ride.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/supplier/bookings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Booking #{ride.booking.publicCode}
          </h1>
          <p className="text-gray-600">
            {formatDate(ride.booking.pickupDatetime)} at {formatTime(ride.booking.pickupDatetime)}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[ride.status] || 'bg-gray-100 text-gray-800'}`}>
          {statusLabels[ride.status] || ride.status}
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <FaTimes className="text-red-500" />
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <FaCheck className="text-green-500" />
          <p className="text-green-700">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Trip Details</h2>

            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                <div className="w-0.5 h-16 bg-gray-300"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Pickup</p>
                  <p className="font-medium text-gray-900">
                    {ride.booking.direction === 'FROM_AIRPORT'
                      ? ride.booking.airportCode
                      : ride.booking.pickupAddress || ride.booking.zoneName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dropoff</p>
                  <p className="font-medium text-gray-900">
                    {ride.booking.direction === 'FROM_AIRPORT'
                      ? ride.booking.dropoffAddress || ride.booking.zoneName
                      : ride.booking.airportCode}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaClock className="w-3 h-3" /> Time
                </p>
                <p className="font-medium text-gray-900">{formatTime(ride.booking.pickupDatetime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FaUser className="w-3 h-3" /> Passengers
                </p>
                <p className="font-medium text-gray-900">
                  {ride.booking.paxAdults} adults
                  {ride.booking.paxChildren > 0 && `, ${ride.booking.paxChildren} children`}
                </p>
              </div>
              {ride.booking.flightNumber && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaPlane className="w-3 h-3" /> Flight
                  </p>
                  <p className="font-medium text-gray-900">{ride.booking.flightNumber}</p>
                </div>
              )}
            </div>

            {ride.booking.customerNotes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500">Special Requests</p>
                <p className="text-gray-700 mt-1">{ride.booking.customerNotes}</p>
              </div>
            )}
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaUser className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{ride.passenger.name || 'Unknown'}</span>
              </div>
              {ride.passenger.phone && (
                <div className="flex items-center gap-3">
                  <FaPhone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${ride.passenger.phone}`} className="text-sky-600 hover:underline">
                    {ride.passenger.phone}
                  </a>
                </div>
              )}
              {ride.passenger.email && (
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${ride.passenger.email}`} className="text-sky-600 hover:underline">
                    {ride.passenger.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Panel */}
        <div className="space-y-6">
          {/* Driver Assignment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUserTie className="text-sky-500" />
              Driver Assignment
            </h2>

            {ride.driver ? (
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-600 font-medium">Assigned Driver</p>
                <p className="text-lg font-semibold text-gray-900">{ride.driver.name}</p>
                <p className="text-sm text-gray-600">{ride.driver.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-yellow-600 bg-yellow-50 rounded-lg p-3 mb-4">
                No driver assigned yet
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Driver *
                </label>
                <select
                  value={selectedDriver || ''}
                  onChange={(e) => setSelectedDriver(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Choose a driver...</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName} - {driver.phone}
                    </option>
                  ))}
                </select>
                {drivers.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    No active drivers. <Link href="/supplier/drivers" className="text-sky-600">Add drivers</Link>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vehicle (optional)
                </label>
                <select
                  value={selectedVehicle || ''}
                  onChange={(e) => setSelectedVehicle(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignDriver}
                disabled={assigning || !selectedDriver}
                className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <>
                    <FaSpinner className="animate-spin" /> Assigning...
                  </>
                ) : (
                  <>
                    <FaCheck /> {ride.driver ? 'Reassign Driver' : 'Assign Driver'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Vehicle Info */}
          {ride.vehicle && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCar className="text-sky-500" />
                Assigned Vehicle
              </h2>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">{ride.vehicle.plateNumber}</p>
                <p className="text-gray-600">{ride.vehicle.brand} {ride.vehicle.model}</p>
                <p className="text-sm text-gray-500">{ride.vehicle.vehicleType}</p>
              </div>
            </div>
          )}

          {/* Status Update */}
          {ride.driver && nextStatus && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
              <button
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updatingStatus}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingStatus ? (
                  <>
                    <FaSpinner className="animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <FaCheck /> Mark as {statusLabels[nextStatus]}
                  </>
                )}
              </button>

              {ride.status !== 'CANCELLED' && ride.status !== 'FINISHED' && (
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  disabled={updatingStatus}
                  className="w-full mt-2 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
