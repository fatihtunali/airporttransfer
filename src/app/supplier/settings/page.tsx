'use client';

import { useState, useEffect } from 'react';
import {
  FaCog,
  FaUser,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaSpinner,
  FaCheck,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUniversity,
  FaCreditCard,
  FaMoneyBillWave,
} from 'react-icons/fa';

interface ProfileData {
  user: {
    id: number;
    email: string;
    fullName: string;
    phone: string | null;
  };
  supplier: {
    id: number;
    name: string;
    legalName: string | null;
    taxNumber: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    whatsapp: string | null;
    country: string | null;
    city: string | null;
    address: string | null;
    description: string | null;
    bankName: string | null;
    bankAccountName: string | null;
    bankIban: string | null;
    bankSwift: string | null;
    bankCountry: string | null;
    paymentEmail: string | null;
    preferredPaymentMethod: string | null;
  };
}

export default function SupplierSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'finance' | 'password'>('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
  });

  // Company form
  const [companyForm, setCompanyForm] = useState({
    name: '',
    legalName: '',
    taxNumber: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    whatsapp: '',
    country: '',
    city: '',
    address: '',
    description: '',
  });

  // Finance/Bank form
  const [financeForm, setFinanceForm] = useState({
    bankName: '',
    bankAccountName: '',
    bankIban: '',
    bankSwift: '',
    bankCountry: '',
    paymentEmail: '',
    preferredPaymentMethod: 'BANK_TRANSFER',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/supplier/me');
      if (res.ok) {
        const data: ProfileData = await res.json();
        setProfileForm({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
        });
        setCompanyForm({
          name: data.supplier.name || '',
          legalName: data.supplier.legalName || '',
          taxNumber: data.supplier.taxNumber || '',
          contactName: data.supplier.contactName || '',
          contactEmail: data.supplier.contactEmail || '',
          contactPhone: data.supplier.contactPhone || '',
          whatsapp: data.supplier.whatsapp || '',
          country: data.supplier.country || '',
          city: data.supplier.city || '',
          address: data.supplier.address || '',
          description: data.supplier.description || '',
        });
        setFinanceForm({
          bankName: data.supplier.bankName || '',
          bankAccountName: data.supplier.bankAccountName || '',
          bankIban: data.supplier.bankIban || '',
          bankSwift: data.supplier.bankSwift || '',
          bankCountry: data.supplier.bankCountry || '',
          paymentEmail: data.supplier.paymentEmail || '',
          preferredPaymentMethod: data.supplier.preferredPaymentMethod || 'BANK_TRANSFER',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/supplier/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/supplier/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });

      if (res.ok) {
        setSuccess('Company details updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update company details');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/supplier/settings/bank', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(financeForm),
      });

      if (res.ok) {
        setSuccess('Bank details updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update bank details');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/supplier/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        setSuccess('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and company settings</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <FaCheck className="flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUser className="inline-block mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'company'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBuilding className="inline-block mr-2" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'finance'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUniversity className="inline-block mr-2" />
              Finance
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'password'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaLock className="inline-block mr-2" />
              Password
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline-block mr-2 text-gray-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline-block mr-2 text-gray-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Company Tab */}
        {activeTab === 'company' && (
          <form onSubmit={handleCompanySubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBuilding className="inline-block mr-2 text-gray-400" />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Legal Name
                </label>
                <input
                  type="text"
                  value={companyForm.legalName}
                  onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Number
                </label>
                <input
                  type="text"
                  value={companyForm.taxNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, taxNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline-block mr-2 text-gray-400" />
                  Contact Name
                </label>
                <input
                  type="text"
                  value={companyForm.contactName}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline-block mr-2 text-gray-400" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={companyForm.contactEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline-block mr-2 text-gray-400" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={companyForm.contactPhone}
                  onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaWhatsapp className="inline-block mr-2 text-green-500" />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={companyForm.whatsapp}
                  onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={companyForm.country}
                  onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline-block mr-2 text-gray-400" />
                  Address
                </label>
                <input
                  type="text"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Tell us about your company..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Save Company Details
              </button>
            </div>
          </form>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <form onSubmit={handleFinanceSubmit} className="p-6 space-y-6">
            {/* Info Banner */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <FaUniversity className="inline-block mr-2" />
                Your bank details are used for receiving payments. Please ensure the information is accurate.
              </p>
            </div>

            {/* Preferred Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Payment Method
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: FaUniversity },
                  { value: 'PAYPAL', label: 'PayPal', icon: FaCreditCard },
                  { value: 'WISE', label: 'Wise', icon: FaMoneyBillWave },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      financeForm.preferredPaymentMethod === method.value
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={financeForm.preferredPaymentMethod === method.value}
                      onChange={(e) => setFinanceForm({ ...financeForm, preferredPaymentMethod: e.target.value })}
                      className="hidden"
                    />
                    <method.icon className="w-5 h-5" />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaUniversity className="text-gray-400" />
                Bank Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={financeForm.bankName}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., Deutsche Bank, ING, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={financeForm.bankAccountName}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankAccountName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Name as it appears on the account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={financeForm.bankIban}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankIban: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    placeholder="e.g., DE89370400440532013000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={financeForm.bankSwift}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankSwift: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    placeholder="e.g., DEUTDEDB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Country
                  </label>
                  <input
                    type="text"
                    value={financeForm.bankCountry}
                    onChange={(e) => setFinanceForm({ ...financeForm, bankCountry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g., Germany, Netherlands, etc."
                  />
                </div>
              </div>
            </div>

            {/* PayPal/Wise Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FaCreditCard className="text-gray-400" />
                PayPal / Wise
              </h3>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline-block mr-2 text-gray-400" />
                  Payment Email
                </label>
                <input
                  type="email"
                  value={financeForm.paymentEmail}
                  onChange={(e) => setFinanceForm({ ...financeForm, paymentEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Email for PayPal or Wise payments"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This email will be used for PayPal or Wise transfers
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Save Finance Details
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 pr-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <FaSpinner className="animate-spin" /> : <FaLock />}
                Change Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
