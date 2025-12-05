'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaFileAlt,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';

interface Document {
  id: number;
  docType: string;
  docName: string;
  fileUrl: string;
  expiryDate: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}

interface Supplier {
  id: number;
  name: string;
  contactEmail: string;
  isVerified: boolean;
}

const docTypeLabels: Record<string, string> = {
  LICENSE: 'Business License',
  INSURANCE: 'Insurance Certificate',
  TAX_CERT: 'Tax Registration',
  ID_CARD: 'ID / Passport',
  OTHER: 'Other Document',
};

export default function SupplierDocumentsPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = use(params);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [supplierId]);

  const fetchData = async () => {
    try {
      // Fetch supplier info
      const supRes = await fetch(`/api/admin/suppliers/${supplierId}`);
      if (supRes.ok) {
        const supData = await supRes.json();
        setSupplier(supData);
      }

      // Fetch documents
      const docRes = await fetch(`/api/admin/documents?entityType=supplier&supplierId=${supplierId}`);
      if (docRes.ok) {
        const docData = await docRes.json();
        // Filter for this supplier's documents
        const supplierDocs = docData.documents.filter(
          (d: { entity_id: number; entity_type: string }) =>
            d.entity_type === 'supplier' && d.entity_id === parseInt(supplierId)
        );
        setDocuments(supplierDocs.map((d: {
          id: number;
          doc_type: string;
          doc_name: string;
          file_url: string;
          expiry_date: string | null;
          is_verified: boolean;
          verified_at: string | null;
          created_at: string;
        }) => ({
          id: d.id,
          docType: d.doc_type,
          docName: d.doc_name,
          fileUrl: d.file_url,
          expiryDate: d.expiry_date,
          isVerified: d.is_verified,
          verifiedAt: d.verified_at,
          createdAt: d.created_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId: number, approve: boolean) => {
    setVerifying(documentId);
    try {
      const res = await fetch(`/api/admin/documents/${documentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: approve }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error verifying document:', error);
    } finally {
      setVerifying(null);
    }
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const daysUntil = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    if (daysUntil <= 7) return { label: 'Expiring Soon', color: 'bg-orange-100 text-orange-700' };
    if (daysUntil <= 30) return { label: 'Expiring', color: 'bg-yellow-100 text-yellow-700' };
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <FaSpinner className="animate-spin w-8 h-8 mx-auto text-blue-600" />
        <p className="mt-4 text-gray-600">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/suppliers"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {supplier?.name || 'Supplier'} - Documents
          </h1>
          <p className="text-gray-600">{supplier?.contactEmail}</p>
        </div>
        {supplier && (
          <span
            className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              supplier.isVerified
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {supplier.isVerified ? 'Verified Supplier' : 'Pending Verification'}
          </span>
        )}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaFileAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No documents uploaded yet</p>
          <p className="text-gray-500 text-sm mt-2">
            The supplier has not uploaded any documents for verification
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => {
                const expiry = getExpiryStatus(doc.expiryDate);
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaFileAlt className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.docName}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">
                        {docTypeLabels[doc.docType] || doc.docType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.expiryDate ? (
                        <div>
                          <p className="text-gray-900">
                            {new Date(doc.expiryDate).toLocaleDateString()}
                          </p>
                          {expiry && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${expiry.color}`}
                            >
                              <FaExclamationTriangle className="w-3 h-3" />
                              {expiry.label}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {doc.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <FaCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          <FaClock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 inline-flex items-center gap-1"
                        >
                          <FaExternalLinkAlt className="w-3 h-3" />
                          View
                        </a>
                        {!doc.isVerified && (
                          <>
                            <button
                              onClick={() => handleVerify(doc.id, true)}
                              disabled={verifying === doc.id}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              {verifying === doc.id ? (
                                <FaSpinner className="animate-spin w-3 h-3" />
                              ) : (
                                <FaCheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(doc.id, false)}
                              disabled={verifying === doc.id}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <FaTimesCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Back to Suppliers */}
      <div className="flex justify-center">
        <Link
          href="/admin/suppliers"
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Back to Suppliers List
        </Link>
      </div>
    </div>
  );
}
