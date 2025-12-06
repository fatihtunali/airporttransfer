'use client';

import { useState, useEffect, useRef } from 'react';
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
  FaIdCard,
  FaCarAlt,
  FaCamera,
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaCloudUploadAlt,
  FaFile,
} from 'react-icons/fa';

interface Document {
  id: number;
  driverId: number;
  docType: string;
  docName: string;
  fileUrl: string;
  expiryDate: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface Driver {
  id: number;
  fullName: string;
  phone: string | null;
  email: string | null;
}

// Driver document types
const driverDocTypes = [
  { value: 'ID_CARD', label: 'National ID / Passport', required: true, description: 'Government-issued identification document', icon: FaIdCard },
  { value: 'LICENSE', label: 'Driving License', required: true, description: 'Valid driving license for commercial passenger transport', icon: FaCarAlt },
  { value: 'PHOTO', label: 'Professional Photo', required: true, description: 'Clear headshot photo for customer identification', icon: FaCamera },
  { value: 'OTHER', label: 'Other Document', required: false, description: 'Any other relevant document', icon: FaFileAlt },
];

export default function DriverDocuments() {
  const params = useParams();
  const router = useRouter();
  const driverId = params.driverId as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    docType: 'ID_CARD',
    docName: '',
    fileUrl: '',
    expiryDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (driverId) {
      fetchDriver();
      fetchDocuments();
    }
  }, [driverId]);

  const fetchDriver = async () => {
    try {
      const res = await fetch(`/api/supplier/drivers/${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setDriver(data);
      } else if (res.status === 404) {
        router.push('/supplier/drivers');
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/supplier/drivers/${driverId}/documents`);
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
    setFormData({ docType: 'ID_CARD', docName: '', fileUrl: '', expiryDate: '' });
    setSelectedFile(null);
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
    setSelectedFile(null);
    setError(null);
    setShowModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, JPEG, PNG, WebP, or GIF.');
        return;
      }
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum size is 10MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
      // Auto-fill document name if empty
      if (!formData.docName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, docName: nameWithoutExt }));
      }
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return formData.fileUrl || null;

    setUploading(true);
    setUploadProgress(10);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('folder', 'driver-docs');

      setUploadProgress(30);

      const res = await fetch('/api/supplier/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      setUploadProgress(80);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadProgress(100);
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Upload file first if selected
      let fileUrl = formData.fileUrl;
      if (selectedFile) {
        const uploadedUrl = await uploadFile();
        if (!uploadedUrl) {
          setError('Failed to upload file');
          setSaving(false);
          return;
        }
        fileUrl = uploadedUrl;
      }

      if (!fileUrl) {
        setError('Please select a file to upload');
        setSaving(false);
        return;
      }

      if (editingDoc) {
        // Update existing document
        const res = await fetch(`/api/supplier/drivers/${driverId}/documents`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingDoc.id, ...formData, fileUrl }),
        });

        if (res.ok) {
          setShowModal(false);
          setEditingDoc(null);
          setSelectedFile(null);
          fetchDocuments();
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to update document');
        }
      } else {
        // Create new document
        const res = await fetch(`/api/supplier/drivers/${driverId}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, fileUrl }),
        });

        if (res.ok) {
          setShowModal(false);
          setFormData({ docType: 'ID_CARD', docName: '', fileUrl: '', expiryDate: '' });
          setSelectedFile(null);
          fetchDocuments();
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to upload document');
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setError(error instanceof Error ? error.message : 'Failed to save document');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDeleting(docId);
    try {
      const res = await fetch(`/api/supplier/drivers/${driverId}/documents?id=${docId}`, {
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

  const getDocTypeInfo = (docType: string) => {
    return driverDocTypes.find(d => d.value === docType) || { label: docType, icon: FaFileAlt };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
            href="/supplier/drivers"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Driver Documents
            </h1>
            {driver && (
              <p className="text-gray-600">
                {driver.fullName} {driver.phone && `• ${driver.phone}`}
              </p>
            )}
          </div>
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
          {driverDocTypes.filter(d => d.required).map((docType) => {
            const uploaded = documents.find(d => d.docType === docType.value);
            const IconComponent = docType.icon;
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
            Upload the required documents for this driver
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <FaUpload /> Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const expiryStatus = getExpiryStatus(doc.expiryDate);
            const docTypeInfo = getDocTypeInfo(doc.docType);
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
                    {docTypeInfo.label}
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
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDoc ? 'Edit Document' : 'Upload Driver Document'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingDoc(null); setSelectedFile(null); }}
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
                  {driverDocTypes.map((type) => (
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
                  placeholder="e.g., Driving License - Class B"
                />
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="border-2 border-sky-200 bg-sky-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                        <FaFile className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    {uploading && (
                      <div className="mt-3">
                        <div className="h-2 bg-sky-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-600 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-sky-600 mt-1">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                ) : editingDoc?.fileUrl ? (
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaFileAlt className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Current document</p>
                        <a
                          href={editingDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sky-600 hover:underline"
                        >
                          View current file
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-sky-400 hover:text-sky-600 transition-colors"
                    >
                      <FaCloudUploadAlt className="inline w-4 h-4 mr-2" />
                      Replace with new file
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-all"
                  >
                    <FaCloudUploadAlt className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Click to select file</p>
                    <p className="text-xs mt-1">PDF, JPEG, PNG, WebP, GIF (max 10MB)</p>
                  </button>
                )}
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
                  onClick={() => { setShowModal(false); setEditingDoc(null); setSelectedFile(null); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading || (!selectedFile && !editingDoc?.fileUrl)}
                  className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving || uploading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {uploading ? 'Uploading...' : 'Saving...'}
                    </>
                  ) : editingDoc ? (
                    'Update Document'
                  ) : (
                    <>
                      <FaUpload /> Upload Document
                    </>
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
