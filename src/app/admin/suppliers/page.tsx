'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: number;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  city: string;
  taxNumber: string;
  legalName: string;
  isVerified: boolean;
  isActive: boolean;
  commissionRate: number;
  vehicleCount: number;
  driverCount: number;
  ratingAvg: number;
  totalBookings: number;
  createdAt: string;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [impersonating, setImpersonating] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, [filter]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter === 'verified') params.set('verified', 'true');
      if (filter === 'pending') params.set('verified', 'false');
      if (filter === 'inactive') params.set('active', 'false');

      const res = await fetch(`/api/admin/suppliers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Load suppliers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (supplierId: number) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/suppliers/${supplierId}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        loadSuppliers();
        setShowModal(false);
        setSelectedSupplier(null);
      }
    } catch (error) {
      console.error('Verify error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (supplierId: number, isActive: boolean) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        loadSuppliers();
      }
    } catch (error) {
      console.error('Toggle active error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async (supplierId: number) => {
    try {
      setImpersonating(true);
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || '/supplier');
      } else {
        alert(data.error || 'Failed to impersonate');
      }
    } catch (error) {
      console.error('Impersonate error:', error);
      alert('Failed to impersonate supplier');
    } finally {
      setImpersonating(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <Link
          href="/admin/suppliers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Supplier
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'pending', 'inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Suppliers</p>
          <p className="text-2xl font-bold">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Verified</p>
          <p className="text-2xl font-bold text-green-600">
            {suppliers.filter(s => s.isVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {suppliers.filter(s => !s.isVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600">
            {suppliers.filter(s => !s.isActive).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No suppliers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fleet</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-sm text-gray-500">{supplier.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{supplier.city}</p>
                      <p className="text-sm text-gray-500">{supplier.country}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{supplier.vehicleCount || 0} vehicles</p>
                      <p className="text-sm text-gray-500">{supplier.driverCount || 0} drivers</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-900">
                          {Number(supplier.ratingAvg || 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{supplier.totalBookings || 0} bookings</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {supplier.commissionRate || 15}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        {supplier.isVerified ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                            Pending
                          </span>
                        )}
                        {!supplier.isActive && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleImpersonate(supplier.id)}
                          disabled={impersonating}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                          title="Login as this supplier"
                        >
                          👤
                        </button>
                        {!supplier.isVerified && (
                          <button
                            onClick={() => handleVerify(supplier.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleActive(supplier.id, supplier.isActive)}
                          disabled={actionLoading}
                          className={`px-3 py-1 text-sm rounded ${
                            supplier.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } disabled:opacity-50`}
                        >
                          {supplier.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Supplier Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSupplier(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Name</label>
                  <p className="text-gray-900">{selectedSupplier.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Legal Name</label>
                  <p className="text-gray-900">{selectedSupplier.legalName || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact Name</label>
                  <p className="text-gray-900">{selectedSupplier.contactName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tax Number</label>
                  <p className="text-gray-900">{selectedSupplier.taxNumber || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedSupplier.contactEmail}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedSupplier.contactPhone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{selectedSupplier.city}, {selectedSupplier.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Commission Rate</label>
                  <p className="text-gray-900">{selectedSupplier.commissionRate}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Joined</label>
                  <p className="text-gray-900">
                    {new Date(selectedSupplier.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <div className="flex gap-2 mt-1">
                    {selectedSupplier.isVerified ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
                    )}
                    {selectedSupplier.isActive ? (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Active</span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactive</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedSupplier.vehicleCount || 0}</p>
                  <p className="text-sm text-gray-500">Vehicles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedSupplier.driverCount || 0}</p>
                  <p className="text-sm text-gray-500">Drivers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedSupplier.totalBookings || 0}</p>
                  <p className="text-sm text-gray-500">Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Number(selectedSupplier.ratingAvg || 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleImpersonate(selectedSupplier.id)}
                  disabled={impersonating}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  👤 Login as Supplier
                </button>
                {!selectedSupplier.isVerified && (
                  <button
                    onClick={() => handleVerify(selectedSupplier.id)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Verify Supplier
                  </button>
                )}
                <button
                  onClick={() => handleToggleActive(selectedSupplier.id, selectedSupplier.isActive)}
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    selectedSupplier.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {selectedSupplier.isActive ? 'Suspend Supplier' : 'Activate Supplier'}
                </button>
                <Link
                  href={`/admin/suppliers/${selectedSupplier.id}/documents`}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center"
                >
                  View Documents
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
