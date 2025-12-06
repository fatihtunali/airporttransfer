'use client';

import { useState, useEffect } from 'react';

interface Payout {
  id: number;
  supplierId: number;
  supplierName: string;
  bookingId: number;
  bookingCode: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string;
  createdAt: string;
  // Bank details
  bankName: string | null;
  bankAccountName: string | null;
  bankIban: string | null;
  bankSwift: string | null;
  bankCountry: string | null;
  paymentEmail: string | null;
  preferredPaymentMethod: string | null;
}

interface PayoutStats {
  totalPending: number;
  totalScheduled: number;
  totalPaid: number;
  countPending: number;
  countScheduled: number;
  countPaid: number;
}

interface SupplierGroup {
  payouts: Payout[];
  total: number;
  currency: string;
  bankInfo: {
    bankName: string | null;
    bankAccountName: string | null;
    bankIban: string | null;
    bankSwift: string | null;
    bankCountry: string | null;
    paymentEmail: string | null;
    preferredPaymentMethod: string | null;
  };
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  useEffect(() => {
    loadPayouts();
  }, [filter]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter.toUpperCase());

      const res = await fetch(`/api/admin/payouts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Load payouts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (payoutId: number) => {
    try {
      setProcessing(payoutId);
      const res = await fetch(`/api/admin/payouts/${payoutId}/mark-paid`, {
        method: 'POST',
      });
      if (res.ok) {
        loadPayouts();
      }
    } catch (error) {
      console.error('Mark paid error:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkMarkPaid = async () => {
    const pendingPayouts = payouts.filter(p => p.status === 'PENDING' || p.status === 'SCHEDULED');
    if (pendingPayouts.length === 0) return;
    if (!confirm(`Mark ${pendingPayouts.length} payouts as paid?`)) return;

    for (const payout of pendingPayouts) {
      await handleMarkPaid(payout.id);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method: string | null) => {
    switch (method) {
      case 'BANK_TRANSFER': return '🏦';
      case 'PAYPAL': return '💳';
      case 'WISE': return '💱';
      default: return '💰';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredPayouts = payouts.filter(p =>
    p.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
    p.bookingCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by supplier with bank info
  const groupedBySupplier = filteredPayouts.reduce((acc, payout) => {
    const key = payout.supplierName || 'Unknown';
    if (!acc[key]) {
      acc[key] = {
        payouts: [],
        total: 0,
        currency: payout.currency,
        bankInfo: {
          bankName: payout.bankName,
          bankAccountName: payout.bankAccountName,
          bankIban: payout.bankIban,
          bankSwift: payout.bankSwift,
          bankCountry: payout.bankCountry,
          paymentEmail: payout.paymentEmail,
          preferredPaymentMethod: payout.preferredPaymentMethod,
        },
      };
    }
    acc[key].payouts.push(payout);
    if (payout.status !== 'PAID' && payout.status !== 'CANCELLED') {
      acc[key].total += Number(payout.amount) || 0;
    }
    return acc;
  }, {} as Record<string, SupplierGroup>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Payouts</h1>
        <div className="flex gap-2">
          <button
            onClick={handleBulkMarkPaid}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Process All Pending
          </button>
          <button
            onClick={loadPayouts}
            className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Pending Payouts</p>
          <p className="text-3xl font-bold text-yellow-600">
            {stats?.countPending || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            EUR {stats?.totalPending?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.countScheduled || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            EUR {stats?.totalScheduled?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Paid This Month</p>
          <p className="text-3xl font-bold text-green-600">
            {stats?.countPaid || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            EUR {stats?.totalPaid?.toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-3xl font-bold text-purple-600">
            EUR {((stats?.totalPending || 0) + (stats?.totalScheduled || 0)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by supplier or booking code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'scheduled', 'paid'].map((f) => (
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

      {/* Grouped by Supplier */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : Object.keys(groupedBySupplier).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          No payouts found
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySupplier).map(([supplierName, data]) => (
            <div key={supplierName} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Supplier Header */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPaymentMethodIcon(data.bankInfo.preferredPaymentMethod)}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{supplierName}</h3>
                      <p className="text-sm text-gray-500">{data.payouts.length} payouts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {data.total > 0 && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Outstanding</p>
                        <p className="text-xl font-bold text-blue-600">
                          {data.currency} {data.total.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => setExpandedSupplier(expandedSupplier === supplierName ? null : supplierName)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {expandedSupplier === supplierName ? 'Hide Bank Info' : 'Show Bank Info'}
                    </button>
                  </div>
                </div>

                {/* Bank Details Panel */}
                {expandedSupplier === supplierName && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Payment Details</h4>
                    {data.bankInfo.bankIban || data.bankInfo.paymentEmail ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.bankInfo.preferredPaymentMethod === 'BANK_TRANSFER' || data.bankInfo.bankIban ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-800">Bank Transfer</p>
                            {data.bankInfo.bankName && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Bank:</span>
                                <span className="text-sm font-mono">{data.bankInfo.bankName}</span>
                              </div>
                            )}
                            {data.bankInfo.bankAccountName && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Account Name:</span>
                                <span className="text-sm font-mono">{data.bankInfo.bankAccountName}</span>
                              </div>
                            )}
                            {data.bankInfo.bankIban && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-gray-600">IBAN:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                                    {data.bankInfo.bankIban}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(data.bankInfo.bankIban || '')}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            )}
                            {data.bankInfo.bankSwift && (
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm text-gray-600">SWIFT/BIC:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                                    {data.bankInfo.bankSwift}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(data.bankInfo.bankSwift || '')}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            )}
                            {data.bankInfo.bankCountry && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Country:</span>
                                <span className="text-sm">{data.bankInfo.bankCountry}</span>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {data.bankInfo.paymentEmail && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-800">PayPal / Wise</p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-gray-600">Email:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono bg-white px-2 py-1 rounded">
                                  {data.bankInfo.paymentEmail}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(data.bankInfo.paymentEmail || '')}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No payment details provided. Please ask the supplier to update their bank information in Settings.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Payouts Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-blue-600">{payout.bookingCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">
                            {payout.currency} {Number(payout.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {payout.dueDate ? new Date(payout.dueDate).toLocaleDateString() : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(payout.status === 'PENDING' || payout.status === 'SCHEDULED') && (
                            <button
                              onClick={() => handleMarkPaid(payout.id)}
                              disabled={processing === payout.id}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {processing === payout.id ? '...' : 'Mark Paid'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
