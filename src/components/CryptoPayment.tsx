'use client';

import { useState, useEffect } from 'react';
import { FaBitcoin, FaEthereum, FaCopy, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { SiRipple } from 'react-icons/si';
import QRCode from 'qrcode';

interface CryptoPaymentProps {
  amountEUR: number;
  onPaymentSubmit: (data: {
    currency: string;
    amount: number;
    txHash: string;
    walletAddress: string;
  }) => void;
  onCancel?: () => void;
}

const WALLET_ADDRESSES = {
  BTC: '3GxpTvvdU33Ddk4aPZG4kaZrPJ1DHgbz2z',
  ETH: '0x36E444aa90a9515f6AC2062202a64D4486B9746F',
  XRP: 'rUcPodpLjJpsKrJAm982t7VK6dXNXyGM3g',
};

const XRP_MEMO = '2535841586';

const CRYPTO_INFO = {
  BTC: {
    name: 'Bitcoin',
    icon: FaBitcoin,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-500',
  },
  ETH: {
    name: 'Ethereum',
    icon: FaEthereum,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-500',
  },
  XRP: {
    name: 'Ripple (XRP)',
    icon: SiRipple,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-500',
  },
};

export default function CryptoPayment({ amountEUR, onPaymentSubmit, onCancel }: CryptoPaymentProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'XRP' | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      generateQRCode(selectedCrypto);
    }
  }, [selectedCrypto]);

  const fetchRates = async () => {
    try {
      const res = await fetch('/api/public/crypto-rates');
      const data = await res.json();
      setRates(data);
    } catch (error) {
      console.error('Failed to fetch crypto rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (crypto: string) => {
    const address = WALLET_ADDRESSES[crypto as keyof typeof WALLET_ADDRESSES];
    let qrData = address;

    // Create proper payment URI
    if (crypto === 'BTC') {
      qrData = `bitcoin:${address}`;
    } else if (crypto === 'ETH') {
      qrData = `ethereum:${address}`;
    } else if (crypto === 'XRP') {
      qrData = `${address}?dt=${XRP_MEMO}`;
    }

    try {
      const qr = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrCode(qr);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  const getCryptoAmount = (crypto: string) => {
    if (!rates[crypto]) return 0;
    return amountEUR / rates[crypto];
  };

  const copyAddress = () => {
    if (!selectedCrypto) return;
    const address = WALLET_ADDRESSES[selectedCrypto];
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMemo = () => {
    navigator.clipboard.writeText(XRP_MEMO);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!selectedCrypto || !txHash.trim()) return;

    setSubmitting(true);
    try {
      onPaymentSubmit({
        currency: selectedCrypto,
        amount: getCryptoAmount(selectedCrypto),
        txHash: txHash.trim(),
        walletAddress: WALLET_ADDRESSES[selectedCrypto],
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Pay with Cryptocurrency</h3>
      <p className="text-gray-600 mb-6">Select your preferred cryptocurrency and send the exact amount shown.</p>

      {/* Amount Display */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-600">Amount to pay</p>
        <p className="text-2xl font-bold text-gray-900">€{amountEUR.toFixed(2)}</p>
      </div>

      {/* Crypto Selection */}
      {!selectedCrypto ? (
        <div className="space-y-3">
          {(['BTC', 'ETH', 'XRP'] as const).map((crypto) => {
            const info = CRYPTO_INFO[crypto];
            const Icon = info.icon;
            const amount = getCryptoAmount(crypto);

            return (
              <button
                key={crypto}
                onClick={() => setSelectedCrypto(crypto)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:${info.borderColor} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${info.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{info.name}</p>
                    <p className="text-sm text-gray-500">{crypto}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${info.color}`}>
                    {amount.toFixed(crypto === 'BTC' ? 6 : crypto === 'ETH' ? 5 : 2)} {crypto}
                  </p>
                  <p className="text-xs text-gray-500">≈ €{amountEUR.toFixed(2)}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Crypto Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const info = CRYPTO_INFO[selectedCrypto];
                const Icon = info.icon;
                return (
                  <>
                    <div className={`w-10 h-10 ${info.bgColor} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <span className="font-semibold">{info.name}</span>
                  </>
                );
              })()}
            </div>
            <button
              onClick={() => setSelectedCrypto(null)}
              className="text-sm text-teal-600 hover:underline"
            >
              Change
            </button>
          </div>

          {/* Amount to Send */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 mb-1">Send exactly:</p>
            <p className="text-2xl font-mono font-bold text-yellow-900">
              {getCryptoAmount(selectedCrypto).toFixed(selectedCrypto === 'BTC' ? 6 : selectedCrypto === 'ETH' ? 5 : 2)} {selectedCrypto}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            {qrCode && (
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                <img src={qrCode} alt="Payment QR Code" className="w-48 h-48" />
              </div>
            )}
          </div>

          {/* Wallet Address */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 p-3 rounded-lg text-xs font-mono break-all">
                {WALLET_ADDRESSES[selectedCrypto]}
              </code>
              <button
                onClick={copyAddress}
                className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? <FaCheck className="text-green-500" /> : <FaCopy className="text-gray-500" />}
              </button>
            </div>
          </div>

          {/* XRP Memo Warning */}
          {selectedCrypto === 'XRP' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">IMPORTANT: Memo/Tag Required!</p>
                  <p className="text-sm text-red-700 mt-1">
                    You MUST include this memo/destination tag or your payment will be lost:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-red-100 px-3 py-2 rounded-lg font-mono font-bold text-red-900">
                      {XRP_MEMO}
                    </code>
                    <button
                      onClick={copyMemo}
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <FaCopy className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction Hash Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Hash / ID
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Enter your transaction hash after sending"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              After sending the payment, paste the transaction hash here for verification.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!txHash.trim() || submitting}
              className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'I Have Sent Payment'}
            </button>
          </div>

          {/* Info Note */}
          <p className="text-xs text-gray-500 text-center">
            Your booking will be confirmed once we verify the transaction (usually within 30 minutes).
          </p>
        </div>
      )}
    </div>
  );
}
