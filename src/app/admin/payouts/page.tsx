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
}

interface PayoutStats {
  totalPending: number;
  totalScheduled: number;
  totalPaid: number;
  countPending: number;
  countScheduled: number;
  countPaid: number;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

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

  const filteredPayouts = payouts.filter(p =>
    p.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
    p.bookingCode?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by supplier
  const groupedBySupplier = filteredPayouts.reduce((acc, payout) => {
    const key = payout.supplierName || 'Unknown';
    if (!acc[key]) {
      acc[key] = { payouts: [], total: 0, currency: payout.currency };
    }
    acc[key].payouts.push(payout);
    if (payout.status !== 'PAID' && payout.status !== 'CANCELLED') {
      acc[key].total += Number(payout.amount) || 0;
    }
    return acc;
  }, {} as Record<string, { payouts: Payout[]; total: number; currency: string }>);

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
            ↻ Refresh
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
              <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">🏢 {supplierName}</h3>
                  <p className="text-sm text-gray-500">{data.payouts.length} payouts</p>
                </div>
                {data.total > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Outstanding</p>
                    <p className="text-xl font-bold text-blue-600">
                      {data.currency} {data.total.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
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
