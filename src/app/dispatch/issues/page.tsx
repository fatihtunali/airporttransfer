'use client';

import { useState, useEffect } from 'react';
import {
  FaExclamationTriangle,
  FaExclamationCircle,
  FaSearch,
  FaSync,
  FaCheck,
  FaTimes,
  FaPlus,
} from 'react-icons/fa';

interface Issue {
  id: number;
  bookingId: number | null;
  bookingCode: string | null;
  rideId: number | null;
  type: string;
  severity: string;
  title: string;
  description: string | null;
  status: string;
  resolution: string | null;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  customerName: string | null;
  driverName: string | null;
  supplierName: string | null;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

const severityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const statusColors: Record<string, string> = {
  OPEN: 'bg-red-500',
  IN_PROGRESS: 'bg-yellow-500',
  RESOLVED: 'bg-green-500',
  ESCALATED: 'bg-purple-500',
  CLOSED: 'bg-gray-500',
};

const issueTypeLabels: Record<string, string> = {
  NO_SHOW_CUSTOMER: 'Customer No-Show',
  NO_SHOW_DRIVER: 'Driver No-Show',
  DRIVER_LATE: 'Driver Late',
  VEHICLE_BREAKDOWN: 'Vehicle Breakdown',
  ACCIDENT: 'Accident',
  CUSTOMER_COMPLAINT: 'Customer Complaint',
  DRIVER_COMPLAINT: 'Driver Complaint',
  PAYMENT_ISSUE: 'Payment Issue',
  FLIGHT_ISSUE: 'Flight Issue',
  ADDRESS_ISSUE: 'Address Issue',
  OTHER: 'Other',
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showNewIssue, setShowNewIssue] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dispatch/issues?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [filter]);

  const filteredIssues = issues.filter((issue) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(query) ||
        issue.bookingCode?.toLowerCase().includes(query) ||
        issue.customerName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const issueCounts = {
    open: issues.filter((i) => i.status === 'OPEN').length,
    in_progress: issues.filter((i) => i.status === 'IN_PROGRESS').length,
    critical: issues.filter((i) => i.severity === 'CRITICAL' && i.status !== 'CLOSED').length,
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Issue Management</h1>
          <p className="text-gray-400">Track and resolve dispatch issues</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none w-64"
            />
          </div>

          <button
            onClick={() => setShowNewIssue(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FaPlus />
            Report Issue
          </button>

          <button
            onClick={fetchIssues}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaExclamationCircle className="text-red-400 text-xl" />
            <span className="text-2xl font-bold text-white">{issueCounts.open}</span>
          </div>
          <p className="text-sm text-red-300 mt-2">Open Issues</p>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaExclamationTriangle className="text-yellow-400 text-xl" />
            <span className="text-2xl font-bold text-white">{issueCounts.in_progress}</span>
          </div>
          <p className="text-sm text-yellow-300 mt-2">In Progress</p>
        </div>

        <div className="bg-red-900/30 border border-red-600/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <FaExclamationCircle className="text-red-500 text-xl" />
            <span className="text-2xl font-bold text-white">{issueCounts.critical}</span>
          </div>
          <p className="text-sm text-red-400 mt-2">Critical</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'open', label: 'Open' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'critical', label: 'Critical Only' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'all', label: 'All Issues' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f.key
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <FaCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-400">No issues found</p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className={`bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 border-l-4 ${
                issue.severity === 'CRITICAL'
                  ? 'border-red-500'
                  : issue.severity === 'HIGH'
                  ? 'border-orange-500'
                  : issue.severity === 'MEDIUM'
                  ? 'border-yellow-500'
                  : 'border-gray-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs text-white rounded ${
                        severityColors[issue.severity]
                      }`}
                    >
                      {severityLabels[issue.severity]}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs text-white rounded ${
                        statusColors[issue.status]
                      }`}
                    >
                      {issue.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-400">
                      {issueTypeLabels[issue.type] || issue.type}
                    </span>
                  </div>

                  <h3 className="text-lg text-white font-medium">{issue.title}</h3>

                  {issue.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {issue.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    {issue.bookingCode && (
                      <span className="font-mono text-cyan-400">{issue.bookingCode}</span>
                    )}
                    {issue.customerName && <span>{issue.customerName}</span>}
                    {issue.driverName && (
                      <span>
                        Driver: <span className="text-white">{issue.driverName}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-sm text-gray-400">
                  <div>{formatTime(issue.createdAt)}</div>
                  <div className="mt-2">
                    <span className="text-xs">by {issue.reportedBy.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Issue Details</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 text-xs text-white rounded ${
                      severityColors[selectedIssue.severity]
                    }`}
                  >
                    {severityLabels[selectedIssue.severity]}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs text-white rounded ${
                      statusColors[selectedIssue.status]
                    }`}
                  >
                    {selectedIssue.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white">{selectedIssue.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {issueTypeLabels[selectedIssue.type] || selectedIssue.type}
                </p>
              </div>

              {selectedIssue.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                  <p className="text-white">{selectedIssue.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedIssue.bookingCode && (
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Booking</div>
                    <div className="font-mono text-cyan-400">{selectedIssue.bookingCode}</div>
                  </div>
                )}
                {selectedIssue.customerName && (
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Customer</div>
                    <div className="text-white">{selectedIssue.customerName}</div>
                  </div>
                )}
                {selectedIssue.driverName && (
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Driver</div>
                    <div className="text-white">{selectedIssue.driverName}</div>
                  </div>
                )}
                {selectedIssue.supplierName && (
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400">Supplier</div>
                    <div className="text-white">{selectedIssue.supplierName}</div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Resolution</h4>
                {selectedIssue.resolution ? (
                  <p className="text-white">{selectedIssue.resolution}</p>
                ) : (
                  <textarea
                    placeholder="Enter resolution notes..."
                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                    rows={3}
                  ></textarea>
                )}
              </div>

              {selectedIssue.status !== 'CLOSED' && (
                <div className="flex gap-3">
                  {selectedIssue.status === 'OPEN' && (
                    <button className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                      Take Ownership
                    </button>
                  )}
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Mark Resolved
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Escalate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
