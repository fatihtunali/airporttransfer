'use client';

import { useState, useEffect } from 'react';
import {
  FaFileInvoiceDollar,
  FaDownload,
  FaEye,
  FaSpinner,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa';

interface Invoice {
  id: number;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  bookingCount: number;
  subtotal: number;
  commissionRate: number;
  commissionAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  pdfUrl: string | null;
}

interface InvoiceStats {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  currency: string;
}

const statusConfig: Record<string, { color: string; icon: typeof FaCheck; label: string }> = {
  DRAFT: { color: 'bg-gray-100 text-gray-800', icon: FaClock, label: 'Draft' },
  SENT: { color: 'bg-blue-100 text-blue-800', icon: FaClock, label: 'Sent' },
  PAID: { color: 'bg-green-100 text-green-800', icon: FaCheck, label: 'Paid' },
  OVERDUE: { color: 'bg-red-100 text-red-800', icon: FaExclamationTriangle, label: 'Overdue' },
  CANCELLED: { color: 'bg-gray-100 text-gray-500', icon: FaClock, label: 'Cancelled' },
};

export default function AgencyInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/agency/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">View your billing history and commission statements</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.currency} {stats.totalPaid.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.currency} {stats.totalPending.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats.currency} {stats.totalOverdue.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Invoices</option>
          <option value="SENT">Pending Payment</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin w-8 h-8 text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaFileInvoiceDollar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No invoices found</p>
          <p className="text-sm text-gray-500 mt-2">
            Invoices are generated automatically at the end of each billing period
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((invoice) => {
                const config = statusConfig[invoice.status] || statusConfig.DRAFT;
                const StatusIcon = config.icon;
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatPeriod(invoice.periodStart, invoice.periodEnd)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.bookingCount}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          +{invoice.currency} {invoice.commissionAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {invoice.commissionRate}% of {invoice.currency} {invoice.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        {invoice.currency} {invoice.totalAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.paidAt ? (
                        <span className="text-green-600">
                          Paid {formatDate(invoice.paidAt)}
                        </span>
                      ) : (
                        formatDate(invoice.dueDate)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-emerald-600 hover:text-emerald-700"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800"
                            title="Download PDF"
                          >
                            <FaDownload />
                          </a>
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
    </div>
  );
}
