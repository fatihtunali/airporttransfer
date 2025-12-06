'use client';

import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaGift, FaClock, FaCopy, FaCheck } from 'react-icons/fa';

interface ExitIntentPromo {
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  currency: string;
  displayText: string;
  headline: string;
}

interface ExitIntentPopupProps {
  /** Only show on these pages (e.g., ['/search', '/booking']) */
  allowedPaths?: string[];
  /** Delay before popup can appear (ms) */
  delay?: number;
  /** Don't show again for this many days after dismissal */
  dismissDays?: number;
}

export default function ExitIntentPopup({
  allowedPaths = ['/search', '/booking'],
  delay = 5000,
  dismissDays = 1,
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [promo, setPromo] = useState<ExitIntentPromo | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShow, setCanShow] = useState(false);

  // Fetch exit-intent promo
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await fetch('/api/public/promo-codes/exit-intent');
        const data = await res.json();
        if (data.available && data.promo) {
          setPromo(data.promo);
        }
      } catch (error) {
        console.error('Failed to fetch exit-intent promo:', error);
      }
    };

    // Check if we should show the popup
    const dismissed = localStorage.getItem('exitIntentDismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissal = (now.getTime() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < dismissDays) {
        return; // Don't show if recently dismissed
      }
    }

    // Check if already used
    const used = localStorage.getItem('exitIntentUsed');
    if (used) {
      return; // Don't show if already used
    }

    // Check if on allowed path
    const currentPath = window.location.pathname;
    const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));
    if (!isAllowed) {
      return;
    }

    fetchPromo();

    // Enable showing after delay
    const timer = setTimeout(() => {
      setCanShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [allowedPaths, delay, dismissDays]);

  // Detect exit intent
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!canShow || !promo || isVisible) return;

    // Only trigger when mouse leaves from top of viewport
    if (e.clientY <= 0) {
      setIsVisible(true);
    }
  }, [canShow, promo, isVisible]);

  // Detect mobile back button / tab switch
  const handleVisibilityChange = useCallback(() => {
    if (!canShow || !promo || isVisible) return;

    if (document.visibilityState === 'hidden') {
      // User is leaving - show popup when they come back
      const showOnReturn = () => {
        if (document.visibilityState === 'visible') {
          setIsVisible(true);
          document.removeEventListener('visibilitychange', showOnReturn);
        }
      };
      document.addEventListener('visibilitychange', showOnReturn);
    }
  }, [canShow, promo, isVisible]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleMouseLeave, handleVisibilityChange]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('exitIntentDismissed', new Date().toISOString());
  };

  const handleCopyCode = async () => {
    if (!promo) return;

    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      localStorage.setItem('exitIntentUsed', 'true');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = promo.code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isVisible || !promo) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <FaGift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wait! Don&apos;t Go Yet!</h2>
          <p className="text-white/90">
            {promo.headline}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Discount display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-teal-600 mb-2">
              {promo.discountType === 'PERCENTAGE'
                ? `${promo.discountValue}%`
                : `${promo.currency} ${promo.discountValue}`}
            </div>
            <p className="text-gray-500">OFF YOUR TRANSFER</p>
          </div>

          {/* Promo code box */}
          <div className="bg-gray-50 border-2 border-dashed border-teal-300 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 text-center">
              Your Exclusive Code
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-bold text-teal-600 tracking-wider">
                {promo.code}
              </span>
              <button
                onClick={handleCopyCode}
                className={`p-2 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                }`}
                title={copied ? 'Copied!' : 'Copy code'}
              >
                {copied ? <FaCheck className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Timer/urgency */}
          <div className="flex items-center justify-center gap-2 text-sm text-orange-600 mb-6">
            <FaClock className="w-4 h-4" />
            <span>Limited time offer - Book now!</span>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCopyCode}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg shadow-teal-500/30"
            >
              {copied ? 'Code Copied! Continue Booking' : 'Copy Code & Continue'}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </div>
        </div>

        {/* Footer note */}
        {promo.description && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-400 text-center">
              {promo.description}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
