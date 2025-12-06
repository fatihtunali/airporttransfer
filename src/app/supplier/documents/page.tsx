'use client';

import { useState, useEffect } from 'react';
import {
  FaFileAlt,
  FaPlus,
  FaUpload,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaEdit,
  FaExternalLinkAlt,
} from 'react-icons/fa';

interface Document {
  id: number;
  docType: string;
  docName: string;
  fileUrl: string;
  expiryDate: string | null;
  isVerified: boolean;
  createdAt: string;
}

// Company document types
const companyDocTypes = [
  { value: 'BUSINESS_LICENSE', label: 'Business Registration / License', required: true, description: 'Official business registration certificate' },
  { value: 'TRANSPORT_LICENSE', label: 'Transport Operating License', required: true, description: 'License to operate passenger transport services' },
  { value: 'LIABILITY_INSURANCE', label: 'Public Liability Insurance', required: true, description: 'Insurance covering passenger injuries and damages' },
  { value: 'FLEET_INSURANCE', label: 'Fleet/Vehicle Insurance', required: true, description: 'Commercial vehicle insurance for your fleet' },
  { value: 'TAX_CERT', label: 'Tax Registration Certificate', required: true, description: 'VAT/Tax registration document' },
  { value: 'COMPANY_ID', label: 'Company ID / Registration Number', required: false, description: 'Official company identification' },
  { value: 'OTHER_COMPANY', label: 'Other Company Document', required: false, description: 'Any other relevant company document' },
];

// All doc types for the dropdown
const docTypes = [
  ...companyDocTypes,
];

export default function SupplierDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    docType: 'BUSINESS_LICENSE',
    docName: '',
    fileUrl: '',
    expiryDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/supplier/documents');
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

  const openAddModal = () => {
    setEditingDoc(null);
    setFormData({ docType: 'BUSINESS_LICENSE', docName: '', fileUrl: '', expiryDate: '' });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      docType: doc.docType,
      docName: doc.docName || '',
      fileUrl: doc.fileUrl,
      expiryDate: doc.expiryDate ? doc.expiryDate.split('T')[0] : '',
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingDoc) {
        // Update existing document
        const res = await fetch('/api/supplier/documents', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingDoc.id, ...formData }),
        });

        if (res.ok) {
          setShowModal(false);
          setEditingDoc(null);
          fetchDocuments();
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to update document');
        }
      } else {
        // Create new document
        const res = await fetch('/api/supplier/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          setShowModal(false);
          setFormData({ docType: 'BUSINESS_LICENSE', docName: '', fileUrl: '', expiryDate: '' });
          fetchDocuments();
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to upload document');
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDeleting(docId);
    try {
      const res = await fetch(`/api/supplier/documents?id=${docId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Documents</h1>
          <p className="text-gray-600">Upload required documents for verification</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <FaPlus /> Upload Document
        </button>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Required Documents Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyDocTypes.filter(d => d.required).map((docType) => {
            const uploaded = documents.find(d => d.docType === docType.value);
            return (
              <div key={docType.value} className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  uploaded?.isVerified
                    ? 'bg-green-500 text-white'
                    : uploaded
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {uploaded?.isVerified ? (
                    <FaCheck className="w-3 h-3" />
                  ) : uploaded ? (
                    <FaClock className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">!</span>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${uploaded ? 'text-gray-900' : 'text-gray-600'}`}>
                    {docType.label}
                  </p>
                  <p className="text-sm text-gray-500">{docType.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-blue-700 mt-4">
          <strong>Note:</strong> Driver documents (license, ID, photo) should be uploaded in each driver&apos;s profile under Drivers → Documents.
        </p>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Upload your business documents for verification
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaUpload /> Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const expiryStatus = getExpiryStatus(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FaFileAlt className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.isVerified ? (
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
                    {docTypes.find((t) => t.value === doc.docType)?.label || doc.docType}
                  </h3>
                  {doc.docName && (
                    <p className="text-sm text-gray-600 mb-2">{doc.docName}</p>
                  )}

                  {doc.expiryDate && (
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
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
                  <div className="flex items-center gap-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700"
                    >
                      <FaExternalLinkAlt className="w-3 h-3" /> View
                    </a>
                    <button
                      onClick={() => openEditModal(doc)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      <FaEdit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === doc.id ? (
                        <FaSpinner className="w-3 h-3 animate-spin" />
                      ) : (
                        <FaTrash className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDoc ? 'Edit Document' : 'Upload Document'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingDoc(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
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
                  {docTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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
                  placeholder="e.g., Business License 2025"
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
                  Upload your document to a cloud service and paste the URL here
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
                  onClick={() => { setShowModal(false); setEditingDoc(null); }}
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
                  ) : editingDoc ? (
                    'Update Document'
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
