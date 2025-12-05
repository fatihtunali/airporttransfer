'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  country: string;
  language: string;
  source: string;
  status: string;
  emails: Array<{ templateNum: number; sentAt: string; messageId?: string; error?: string }>;
  createdAt: string;
  notes: string;
}

interface Stats {
  total: number;
  lastUpdated: string;
  byStatus: Record<string, number>;
  byCity: Record<string, number>;
  byCountry: Record<string, number>;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  replied: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function SupplierLeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterCountry]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/supplier-leads?action=stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch contacts with filters
      let url = '/api/supplier-leads?limit=500';
      if (filterStatus) url += `&status=${filterStatus}`;
      if (filterCountry) url += `&country=${filterCountry}`;

      const contactsRes = await fetch(url);
      const contactsData = await contactsRes.json();
      setContacts(contactsData.contacts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const updateContact = async (email: string) => {
    try {
      const res = await fetch('/api/supplier-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status: editStatus, notes: editNotes }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.companyName.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.city.toLowerCase().includes(query) ||
      contact.country.toLowerCase().includes(query)
    );
  });

  const countries = stats?.byCountry ? Object.keys(stats.byCountry).sort() : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supplier Leads</h1>
          <p className="text-gray-600 mt-1">Manage and track potential transfer company partners</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Leads</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus?.new || 0}</div>
              <div className="text-sm text-gray-500">New</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.byStatus?.contacted || 0}</div>
              <div className="text-sm text-gray-500">Contacted</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus?.replied || 0}</div>
              <div className="text-sm text-gray-500">Replied</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.byStatus?.converted || 0}</div>
              <div className="text-sm text-gray-500">Converted</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by company, email, city..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="replied">Replied</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No contacts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{contact.companyName}</div>
                        {contact.website && (
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {new URL(contact.website).hostname}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{contact.email}</div>
                        {contact.phone && (
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{contact.city}</div>
                        <div className="text-sm text-gray-500">{contact.country}</div>
                      </td>
                      <td className="px-4 py-4">
                        {editingId === contact.id ? (
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="replied">Replied</option>
                            <option value="converted">Converted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[contact.status] || 'bg-gray-100'}`}>
                            {contact.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500">{contact.source}</span>
                      </td>
                      <td className="px-4 py-4">
                        {editingId === contact.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateContact(contact.email)}
                              className="text-sm text-green-600 hover:text-green-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(contact.id);
                              setEditStatus(contact.status);
                              setEditNotes(contact.notes || '');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Countries breakdown */}
        {stats && stats.byCountry && Object.keys(stats.byCountry).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Leads by Country</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byCountry)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <span
                    key={country}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {country}: <strong>{count}</strong>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Last updated */}
        {stats?.lastUpdated && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
