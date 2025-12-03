'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaCar,
  FaUser,
  FaSuitcase,
  FaClock,
  FaStar,
  FaArrowLeft,
  FaCheck,
  FaShuttleVan,
  FaBus,
  FaCrown,
  FaFilter,
  FaSortAmountDown,
} from 'react-icons/fa';

interface TransferOption {
  supplier: {
    id: number;
    name: string;
    rating: number;
    ratingCount: number;
  };
  vehicleType: string;
  currency: string;
  totalPrice: number;
  estimatedDurationMin: number;
  cancellationPolicy: string;
  optionCode: string;
}

interface SearchResult {
  options: TransferOption[];
}

const vehicleIcons: Record<string, React.ReactNode> = {
  SEDAN: <FaCar className="w-8 h-8" />,
  VAN: <FaShuttleVan className="w-8 h-8" />,
  MINIBUS: <FaBus className="w-8 h-8" />,
  BUS: <FaBus className="w-10 h-10" />,
  VIP: <FaCrown className="w-8 h-8" />,
};

const vehicleCapacity: Record<string, { passengers: number; luggage: number }> = {
  SEDAN: { passengers: 3, luggage: 3 },
  VAN: { passengers: 7, luggage: 7 },
  MINIBUS: { passengers: 16, luggage: 16 },
  BUS: { passengers: 50, luggage: 50 },
  VIP: { passengers: 3, luggage: 3 },
};

type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'duration_asc';

const VEHICLE_TYPES = ['SEDAN', 'VAN', 'MINIBUS', 'BUS', 'VIP'] as const;

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<TransferOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort state
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 9999 });
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [showFilters, setShowFilters] = useState(false);

  // Get search parameters
  const airportId = searchParams.get('airportId');
  const zoneId = searchParams.get('zoneId');
  const direction = searchParams.get('direction') || 'FROM_AIRPORT';
  const pickupTime = searchParams.get('pickupTime');
  const paxAdults = searchParams.get('paxAdults') || '2';
  const currency = searchParams.get('currency') || 'EUR';

  useEffect(() => {
    const fetchResults = async () => {
      if (!airportId || !zoneId || !pickupTime) {
        setError('Missing search parameters');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/public/search-transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airportId: parseInt(airportId),
            zoneId: parseInt(zoneId),
            direction,
            pickupTime,
            paxAdults: parseInt(paxAdults),
            currency,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to search transfers');
        }

        const data: SearchResult = await res.json();
        setResults(data.options);
      } catch (err) {
        setError('Failed to load transfer options');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [airportId, zoneId, direction, pickupTime, paxAdults, currency]);

  // Update price range when results load
  useEffect(() => {
    if (results.length > 0) {
      const prices = results.map(r => r.totalPrice);
      setPriceRange({ min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) });
    }
  }, [results]);

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results];

    // Filter by vehicle type
    if (selectedVehicleTypes.length > 0) {
      filtered = filtered.filter(r => selectedVehicleTypes.includes(r.vehicleType));
    }

    // Filter by price range
    filtered = filtered.filter(r => r.totalPrice >= priceRange.min && r.totalPrice <= priceRange.max);

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'rating_desc':
        filtered.sort((a, b) => b.supplier.rating - a.supplier.rating);
        break;
      case 'duration_asc':
        filtered.sort((a, b) => a.estimatedDurationMin - b.estimatedDurationMin);
        break;
    }

    return filtered;
  }, [results, selectedVehicleTypes, priceRange, sortBy]);

  const toggleVehicleType = (type: string) => {
    setSelectedVehicleTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedVehicleTypes([]);
    if (results.length > 0) {
      const prices = results.map(r => r.totalPrice);
      setPriceRange({ min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectOption = (option: TransferOption) => {
    // Navigate to booking page with option details
    const params = new URLSearchParams({
      optionCode: option.optionCode,
      airportId: airportId!,
      zoneId: zoneId!,
      pickupTime: pickupTime!,
      paxAdults,
      vehicleType: option.vehicleType,
      totalPrice: option.totalPrice.toString(),
      currency: option.currency,
      supplierName: option.supplier.name,
    });
    router.push(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for available transfers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="btn-primary">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <FaArrowLeft />
              <span>Back to Search</span>
            </Link>
            <Link href="/">
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={160}
                height={48}
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Search Summary */}
      <div className="bg-sky-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Available Transfers</h1>
              <p className="text-sky-100">
                {pickupTime && formatDate(pickupTime)} at {pickupTime && formatTime(pickupTime)} • {paxAdults} passengers
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Modify Search
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Sort Bar */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left: Filter Toggle & Active Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    showFilters ? 'bg-sky-50 border-sky-300 text-sky-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <FaFilter />
                  <span>Filters</span>
                  {selectedVehicleTypes.length > 0 && (
                    <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {selectedVehicleTypes.length}
                    </span>
                  )}
                </button>

                {selectedVehicleTypes.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Right: Sort Dropdown */}
              <div className="flex items-center gap-3">
                <FaSortAmountDown className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Rating: Best First</option>
                  <option value="duration_asc">Duration: Fastest First</option>
                </select>
              </div>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Vehicle Type Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Vehicle Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLE_TYPES.map((type) => {
                        const isSelected = selectedVehicleTypes.includes(type);
                        const count = results.filter(r => r.vehicleType === type).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={type}
                            onClick={() => toggleVehicleType(type)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-sky-500 border-sky-500 text-white'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="w-5 h-5">
                              {vehicleIcons[type]}
                            </span>
                            <span>{type}</span>
                            <span className={`text-xs ${isSelected ? 'text-sky-100' : 'text-gray-400'}`}>
                              ({count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Price Range ({currency})
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">Min</label>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          min={0}
                        />
                      </div>
                      <span className="text-gray-400">-</span>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500">Max</label>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCar className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No transfers available</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find any transfers for your route. This could be because:
            </p>
            <ul className="text-gray-600 text-left max-w-md mx-auto mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                No suppliers operate on this route yet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                The pickup time is too soon
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                All vehicles are fully booked
              </li>
            </ul>
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              <FaArrowLeft />
              Try Different Route
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 mb-4">
              {filteredAndSortedResults.length} of {results.length} transfer options
              {selectedVehicleTypes.length > 0 && ' (filtered)'}
            </p>

            {filteredAndSortedResults.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-600 mb-4">No transfers match your filters.</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : filteredAndSortedResults.map((option, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Vehicle Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                        {vehicleIcons[option.vehicleType] || <FaCar className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{option.vehicleType}</h3>
                        <p className="text-gray-600">{option.supplier.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {option.supplier.rating > 0 && (
                            <span className="flex items-center gap-1 text-sm">
                              <FaStar className="text-yellow-400" />
                              {option.supplier.rating.toFixed(1)}
                              <span className="text-gray-400">({option.supplier.ratingCount})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center gap-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaUser />
                        <span>{vehicleCapacity[option.vehicleType]?.passengers || 4} max</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaSuitcase />
                        <span>{vehicleCapacity[option.vehicleType]?.luggage || 4} bags</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock />
                        <span>{option.estimatedDurationMin} min</span>
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {option.currency} {option.totalPrice.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Total price</p>
                      <button
                        onClick={() => handleSelectOption(option)}
                        className="btn-primary"
                      >
                        Select
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaCheck className="text-green-500" />
                        {option.cancellationPolicy}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCheck className="text-green-500" />
                        Meet & Greet
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCheck className="text-green-500" />
                        Flight Tracking
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCheck className="text-green-500" />
                        60 min free waiting
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
