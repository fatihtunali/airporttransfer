'use client';

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';

interface Driver {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string | null;
  photoUrl: string | null;
  languages: string[];
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  documentsCount: number;
  expiringDocs: number;
}

export default function SupplierDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseExpiry: '',
    languages: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/supplier/drivers');
      if (res.ok) {
        const data = await res.json();
        // Handle both array and paginated response formats
        setDrivers(Array.isArray(data) ? data : (data.items || []));
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      licenseNumber: '',
      licenseExpiry: '',
      languages: '',
    });
    setShowModal(true);
  };

  const openEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      fullName: driver.fullName,
      phone: driver.phone || '',
      email: driver.email || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry || '',
      languages: driver.languages?.join(', ') || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingDriver
        ? `/api/supplier/drivers/${editingDriver.id}`
        : '/api/supplier/drivers';
      const method = editingDriver ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        languages: formData.languages
          ? formData.languages.split(',').map((l) => l.trim())
          : [],
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error saving driver:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (driverId: number) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const res = await fetch(`/api/supplier/drivers/${driverId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const isLicenseExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const daysUntil = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 30;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-gray-600">Manage your driver team</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FaPlus /> Add Driver
        </button>
      </div>

      {/* Drivers Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading drivers...</p>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaUser className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No drivers added yet</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaPlus /> Add Your First Driver
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {driver.photoUrl ? (
                      <img
                        src={driver.photoUrl}
                        alt={driver.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {driver.fullName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          driver.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {driver.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {driver.ratingCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <FaStar className="text-yellow-400" />
                        {driver.ratingAvg.toFixed(1)} ({driver.ratingCount} reviews)
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  {driver.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaPhone className="w-4 h-4" />
                      {driver.phone}
                    </div>
                  )}
                  {driver.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaEnvelope className="w-4 h-4" />
                      {driver.email}
                    </div>
                  )}
                  {driver.licenseNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaFileAlt className="w-4 h-4" />
                      License: {driver.licenseNumber}
                    </div>
                  )}
                  {driver.languages && driver.languages.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {driver.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {(isLicenseExpiringSoon(driver.licenseExpiry) ||
                  driver.expiringDocs > 0) && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                    <FaExclamationTriangle />
                    <span>
                      {isLicenseExpiringSoon(driver.licenseExpiry)
                        ? 'License expiring soon'
                        : `${driver.expiringDocs} document(s) expiring`}
                    </span>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(driver)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-sky-600"
                >
                  <FaEdit /> Edit
                </button>
                <a
                  href={`/supplier/drivers/${driver.id}/documents`}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-sky-600"
                >
                  <FaFileAlt /> Documents ({driver.documentsCount || 0})
                </a>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDriver ? 'Edit Driver' : 'Add Driver'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, licenseNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiry}
                    onChange={(e) =>
                      setFormData({ ...formData, licenseExpiry: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) =>
                    setFormData({ ...formData, languages: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="English, Turkish, German"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Driver'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
