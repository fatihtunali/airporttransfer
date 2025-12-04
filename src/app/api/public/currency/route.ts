import { NextRequest, NextResponse } from 'next/server';
import { convertCurrency, getAllExchangeRates, SUPPORTED_CURRENCIES } from '@/lib/currency';

// GET /api/public/currency - Get exchange rates and supported currencies
export async function GET() {
  try {
    const rates = await getAllExchangeRates();

    return NextResponse.json({
      currencies: SUPPORTED_CURRENCIES,
      rates: rates.rates,
      baseCurrency: rates.base,
      lastUpdated: rates.lastUpdated
    });
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}

// POST /api/public/currency - Convert amount between currencies
export async function POST(request: NextRequest) {
  try {
    const { amount, from, to } = await request.json();

    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, from, to' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const result = await convertCurrency(amount, from, to);

    return NextResponse.json({
      original: {
        amount: result.amount,
        currency: result.fromCurrency
      },
      converted: {
        amount: result.convertedAmount,
        currency: result.toCurrency
      },
      rate: result.rate,
      rateDisplay: `1 ${result.fromCurrency} = ${result.rate} ${result.toCurrency}`
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}
