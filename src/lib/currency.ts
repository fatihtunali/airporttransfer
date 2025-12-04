/**
 * Currency Conversion Service
 * Provides real-time exchange rates and currency conversion
 */

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Cache for exchange rates (refresh every hour)
let ratesCache: ExchangeRates | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

// Fallback rates (updated periodically, used when API is unavailable)
const FALLBACK_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  TRY: 36.5,
  CHF: 0.95,
  SEK: 11.4,
  NOK: 11.7,
  DKK: 7.46,
  PLN: 4.32,
  CZK: 25.2,
  HUF: 390,
  RON: 4.97,
  BGN: 1.96,
  HRK: 7.53,
  RUB: 99,
  AED: 3.97,
  SAR: 4.05,
  CAD: 1.48,
  AUD: 1.65,
  JPY: 163,
  CNY: 7.85,
  INR: 90.5,
};

/**
 * Fetch exchange rates from API
 * Using exchangerate.host (free, no API key required for basic use)
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();

  // Return cached rates if still valid
  if (ratesCache && (now - lastFetch) < CACHE_DURATION) {
    return ratesCache;
  }

  try {
    // Try primary API (exchangerate.host - free tier)
    const response = await fetch(
      'https://api.exchangerate.host/latest?base=EUR',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success !== false && data.rates) {
        ratesCache = {
          base: 'EUR',
          rates: data.rates,
          timestamp: now
        };
        lastFetch = now;
        console.log('[Currency] Fetched exchange rates successfully');
        return ratesCache;
      }
    }

    // Try fallback API (frankfurter.app - free, no key needed)
    const fallbackResponse = await fetch(
      'https://api.frankfurter.app/latest?from=EUR',
      { next: { revalidate: 3600 } }
    );

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.rates) {
        ratesCache = {
          base: 'EUR',
          rates: { EUR: 1, ...fallbackData.rates },
          timestamp: now
        };
        lastFetch = now;
        console.log('[Currency] Fetched exchange rates from fallback API');
        return ratesCache;
      }
    }

    // Use fallback rates if API fails
    console.warn('[Currency] API unavailable, using fallback rates');
    return {
      base: 'EUR',
      rates: FALLBACK_RATES,
      timestamp: now
    };
  } catch (error) {
    console.error('[Currency] Error fetching rates:', error);
    // Return fallback rates
    return {
      base: 'EUR',
      rates: FALLBACK_RATES,
      timestamp: now
    };
  }
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{
  amount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}> {
  // Same currency, no conversion needed
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return {
      amount,
      convertedAmount: amount,
      rate: 1,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase()
    };
  }

  const { rates } = await fetchExchangeRates();

  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // Get rates (base is EUR)
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;

  // Convert: first to EUR, then to target currency
  const inEur = amount / fromRate;
  const converted = inEur * toRate;

  // Calculate direct rate
  const directRate = toRate / fromRate;

  return {
    amount,
    convertedAmount: Math.round(converted * 100) / 100, // Round to 2 decimals
    rate: Math.round(directRate * 10000) / 10000, // Round to 4 decimals
    fromCurrency: from,
    toCurrency: to
  };
}

/**
 * Get current exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const result = await convertCurrency(1, fromCurrency, toCurrency);
  return result.rate;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode.toUpperCase());
    const symbol = currency?.symbol || currencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode.toUpperCase());
  return currency?.symbol || currencyCode;
}

/**
 * Get all available exchange rates (for caching/display)
 */
export async function getAllExchangeRates(): Promise<{
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}> {
  const { rates, timestamp } = await fetchExchangeRates();
  return {
    base: 'EUR',
    rates,
    lastUpdated: new Date(timestamp).toISOString()
  };
}

/**
 * Convert price object to different currency
 */
export async function convertPricing(
  pricing: {
    basePrice: number;
    extrasPrice: number;
    totalPrice: number;
    currency: string;
  },
  toCurrency: string
): Promise<{
  basePrice: number;
  extrasPrice: number;
  totalPrice: number;
  currency: string;
  originalCurrency: string;
  exchangeRate: number;
}> {
  const rate = await getExchangeRate(pricing.currency, toCurrency);

  return {
    basePrice: Math.round(pricing.basePrice * rate * 100) / 100,
    extrasPrice: Math.round(pricing.extrasPrice * rate * 100) / 100,
    totalPrice: Math.round(pricing.totalPrice * rate * 100) / 100,
    currency: toCurrency.toUpperCase(),
    originalCurrency: pricing.currency.toUpperCase(),
    exchangeRate: rate
  };
}
