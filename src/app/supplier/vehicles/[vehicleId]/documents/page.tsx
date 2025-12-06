'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaFileAlt,
  FaPlus,
  FaUpload,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaArrowLeft,
  FaClipboardList,
  FaShieldAlt,
  FaSearchPlus,
} from 'react-icons/fa';

interface Document {
  id: number;
  vehicle_id: number;
  doc_type: string;
  doc_name: string;
  file_url: string;
  expiry_date: string | null;
  is_verified: boolean;
  created_at: string;
}

interface Vehicle {
  id: number;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  vehicleType: string;
}

// Vehicle document types
const vehicleDocTypes = [
  { value: 'REGISTRATION', label: 'Vehicle Registration', required: true, description: 'Official vehicle registration certificate', icon: FaClipboardList },
  { value: 'INSURANCE', label: 'Vehicle Insurance', required: true, description: 'Valid commercial vehicle insurance policy', icon: FaShieldAlt },
  { value: 'INSPECTION', label: 'Technical Inspection', required: true, description: 'MOT / Technical inspection certificate', icon: FaSearchPlus },
  { value: 'OTHER', label: 'Other Document', required: false, description: 'Any other relevant vehicle document', icon: FaFileAlt },
];

export default function VehicleDocuments() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    docType: 'REGISTRATION',
    docName: '',
    fileUrl: '',
    expiryDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle();
      fetchDocuments();
    }
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const res = await fetch(`/api/supplier/vehicles/${vehicleId}`);
      if (res.ok) {
        const data = await res.json();
        setVehicle(data);
      } else if (res.status === 404) {
        router.push('/supplier/vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/supplier/vehicles/${vehicleId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/supplier/vehicles/${vehicleId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ docType: 'REGISTRATION', docName: '', fileUrl: '', expiryDate: '' });
        fetchDocuments();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document');
    } finally {
      setSaving(false);
    }
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const daysUntil = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 0) return { status: 'expired', label: 'Expired', color: 'text-red-600 bg-red-50' };
    if (daysUntil <= 7) return { status: 'critical', label: 'Expiring Soon', color: 'text-orange-600 bg-orange-50' };
    if (daysUntil <= 30) return { status: 'warning', label: 'Expiring', color: 'text-yellow-600 bg-yellow-50' };
    return null;
  };

  const getDocTypeInfo = (docType: string) => {
    return vehicleDocTypes.find(d => d.value === docType) || { label: docType, icon: FaFileAlt };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin w-8 h-8 text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/supplier/vehicles"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vehicle Documents
            </h1>
            {vehicle && (
              <p className="text-gray-600">
                {vehicle.plateNumber} • {vehicle.brand} {vehicle.model} • {vehicle.vehicleType}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FaPlus /> Upload Document
        </button>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Required Documents Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicleDocTypes.filter(d => d.required).map((docType) => {
            const uploaded = documents.find(d => d.doc_type === docType.value);
            const IconComponent = docType.icon;
            return (
              <div key={docType.value} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  uploaded?.is_verified
                    ? 'bg-green-500 text-white'
                    : uploaded
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {uploaded?.is_verified ? (
                    <FaCheck className="w-3 h-3" />
                  ) : uploaded ? (
                    <FaClock className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">!</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium flex items-center gap-2 ${uploaded ? 'text-gray-900' : 'text-gray-600'}`}>
                    <IconComponent className="w-4 h-4" />
                    {docType.label}
                  </p>
                  <p className="text-sm text-gray-500">{docType.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Upload the required documents for this vehicle
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaUpload /> Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const expiryStatus = getExpiryStatus(doc.expiry_date);
            const docTypeInfo = getDocTypeInfo(doc.doc_type);
            const IconComponent = docTypeInfo.icon || FaFileAlt;
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.is_verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <FaCheck /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          <FaClock /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">
                    {docTypeInfo.label}
                  </h3>
                  {doc.doc_name && (
                    <p className="text-sm text-gray-600 mb-2">{doc.doc_name}</p>
                  )}

                  {doc.expiry_date && (
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                    </p>
                  )}

                  {expiryStatus && (
                    <div
                      className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${expiryStatus.color}`}
                    >
                      <FaExclamationTriangle />
                      <span>{expiryStatus.label}</span>
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sky-600 hover:text-sky-700"
                  >
                    View Document
                  </a>
                  <span className="text-xs text-gray-400">
                    Uploaded {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Vehicle Document
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Type *
                </label>
                <select
                  value={formData.docType}
                  onChange={(e) =>
                    setFormData({ ...formData, docType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {vehicleDocTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} {type.required ? '*' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={formData.docName}
                  onChange={(e) =>
                    setFormData({ ...formData, docName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="e.g., Insurance Policy 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File URL *
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload the document to a cloud service and paste the URL here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
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
                      <FaSpinner className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    'Upload Document'
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
