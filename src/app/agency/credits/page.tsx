'use client';

import { useState, useEffect } from 'react';
import {
  FaCreditCard,
  FaPlus,
  FaHistory,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaUndo,
  FaWrench,
} from 'react-icons/fa';

interface CreditTransaction {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  currency: string;
  reference: string | null;
  bookingCode: string | null;
  notes: string | null;
  createdAt: string;
}

interface CreditStats {
  balance: number;
  creditLimit: number;
  availableCredit: number;
  currency: string;
}

const typeConfig: Record<string, { icon: typeof FaArrowUp; color: string; label: string }> = {
  CREDIT_ADD: { icon: FaArrowUp, color: 'text-green-600', label: 'Credit Added' },
  CREDIT_USE: { icon: FaArrowDown, color: 'text-red-600', label: 'Credit Used' },
  REFUND: { icon: FaUndo, color: 'text-blue-600', label: 'Refund' },
  ADJUSTMENT: { icon: FaWrench, color: 'text-orange-600', label: 'Adjustment' },
};

export default function AgencyCredits() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/agency/credits');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
          <p className="text-gray-600">Manage your credit balance and view transaction history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <FaPlus /> Add Credits
        </button>
      </div>

      {/* Credit Balance Card */}
      {stats && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-emerald-100 text-sm">Current Balance</p>
              <p className="text-4xl font-bold mt-1">
                {stats.currency} {stats.balance.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Credit Limit</p>
              <p className="text-2xl font-semibold mt-1">
                {stats.currency} {stats.creditLimit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Available Credit</p>
              <p className="text-2xl font-semibold mt-1">
                {stats.currency} {stats.availableCredit.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Credit usage bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-emerald-100">Credit Usage</span>
              <span className="text-white font-medium">
                {stats.creditLimit > 0
                  ? Math.round(((stats.creditLimit - stats.availableCredit) / stats.creditLimit) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="h-2 bg-emerald-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{
                  width: `${
                    stats.creditLimit > 0
                      ? ((stats.creditLimit - stats.availableCredit) / stats.creditLimit) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">How Credits Work</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Credits are deducted when you make a booking</li>
          <li>• Refunds are credited back to your account automatically</li>
          <li>• You can add credits via bank transfer or credit card</li>
          <li>• Credit limit determines your maximum spending capacity</li>
        </ul>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaHistory className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <FaSpinner className="animate-spin w-8 h-8 text-emerald-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <FaCreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const config = typeConfig[tx.type] || typeConfig.ADJUSTMENT;
              const TypeIcon = config.icon;
              const isPositive = tx.type === 'CREDIT_ADD' || tx.type === 'REFUND';

              return (
                <div key={tx.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isPositive ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        <TypeIcon className={config.color} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{config.label}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatDate(tx.createdAt)}</span>
                          {tx.reference && (
                            <>
                              <span>•</span>
                              <span>Ref: {tx.reference}</span>
                            </>
                          )}
                          {tx.bookingCode && (
                            <>
                              <span>•</span>
                              <span>Booking: #{tx.bookingCode}</span>
                            </>
                          )}
                        </div>
                        {tx.notes && (
                          <p className="text-sm text-gray-500 mt-1">{tx.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {tx.currency} {Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance: {tx.currency} {tx.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
