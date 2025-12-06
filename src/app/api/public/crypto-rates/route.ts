import { NextResponse } from 'next/server';

// Cache rates for 60 seconds to avoid too many API calls
let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET() {
  try {
    // Check cache
    if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
      return NextResponse.json(cachedRates.rates);
    }

    // Fetch current prices from CoinGecko (free, no API key needed)
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=eur',
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto rates');
    }

    const data = await response.json();

    const rates = {
      BTC: data.bitcoin?.eur || 0,
      ETH: data.ethereum?.eur || 0,
      XRP: data.ripple?.eur || 0,
    };

    // Cache the rates
    cachedRates = { rates, timestamp: Date.now() };

    return NextResponse.json(rates);
  } catch (error) {
    console.error('Error fetching crypto rates:', error);

    // Return cached rates if available, even if stale
    if (cachedRates) {
      return NextResponse.json(cachedRates.rates);
    }

    // Fallback rates (approximate)
    return NextResponse.json({
      BTC: 95000,
      ETH: 3500,
      XRP: 2.5,
    });
  }
}
