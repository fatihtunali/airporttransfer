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
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaShieldAlt,
  FaHeadset,
  FaWifi,
  FaSnowflake,
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

const vehicleDescriptions: Record<string, string> = {
  SEDAN: 'Comfortable sedan for small groups',
  VAN: 'Spacious van for families',
  MINIBUS: 'Perfect for medium groups',
  BUS: 'Large capacity for big groups',
  VIP: 'Luxury vehicle with premium service',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <FaCar className="absolute inset-0 m-auto w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Finding Your Perfect Transfer</h3>
          <p className="text-gray-500">Searching for available vehicles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPlane className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
          >
            <FaArrowLeft />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <FaArrowLeft />
              <span className="font-medium">Back to Search</span>
            </Link>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FaCar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-primary hidden sm:block">Airport Transfer Portal</span>
            </Link>
            <div className="flex items-center gap-4">
              <a href="tel:+1234567890" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-primary">
                <FaHeadset className="text-accent" />
                <span className="font-medium">24/7 Support</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Search Summary Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-teal-900 to-cyan-900 text-white py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-3">Available Transfers</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <FaCalendarAlt className="text-accent" />
                  <span>{pickupTime && formatDate(pickupTime)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <FaClock className="text-accent" />
                  <span>{pickupTime && formatTime(pickupTime)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <FaUsers className="text-accent" />
                  <span>{paxAdults} passengers</span>
                </div>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg"
            >
              <FaMapMarkerAlt />
              Modify Search
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Sort Bar */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left: Filter Toggle & Active Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    showFilters
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaFilter />
                  <span>Filters</span>
                  {selectedVehicleTypes.length > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      showFilters ? 'bg-white/20' : 'bg-primary text-white'
                    }`}>
                      {selectedVehicleTypes.length}
                    </span>
                  )}
                </button>

                {selectedVehicleTypes.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-primary font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}

                {/* Active Filter Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedVehicleTypes.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {type}
                      <button
                        onClick={() => toggleVehicleType(type)}
                        className="hover:text-primary-dark"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Sort by:</span>
                <div className="relative">
                  <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                  >
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Rating: Best First</option>
                    <option value="duration_asc">Duration: Fastest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Vehicle Type Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaCar className="text-primary" />
                      Vehicle Type
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {VEHICLE_TYPES.map((type) => {
                        const isSelected = selectedVehicleTypes.includes(type);
                        const count = results.filter(r => r.vehicleType === type).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={type}
                            onClick={() => toggleVehicleType(type)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'bg-primary text-white border-primary shadow-lg'
                                : 'bg-white border-gray-200 hover:border-primary hover:shadow-md'
                            }`}
                          >
                            <span className={isSelected ? 'text-white' : 'text-primary'}>
                              {vehicleIcons[type]}
                            </span>
                            <span className="font-medium text-sm">{type}</span>
                            <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                              {count} available
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-primary">€</span>
                      Price Range ({currency})
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            min={0}
                          />
                        </div>
                        <span className="text-gray-300 mt-6">—</span>
                        <div className="flex-1">
                          <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            min={0}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Transfers Available</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We couldn't find any transfers for your selected route. This might be because:
            </p>
            <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
              <ul className="text-gray-600 text-left space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  </span>
                  <span>No suppliers currently operate on this route</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  </span>
                  <span>The requested pickup time is too soon</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  </span>
                  <span>All vehicles are fully booked for this time</span>
                </li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              <FaArrowLeft />
              Try Different Route
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredAndSortedResults.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{results.length}</span> transfer options
                {selectedVehicleTypes.length > 0 && <span className="text-primary ml-1">(filtered)</span>}
              </p>
            </div>

            {filteredAndSortedResults.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-4">No transfers match your current filters.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : filteredAndSortedResults.map((option, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Vehicle Info */}
                    <div className="flex items-start gap-5 flex-1">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        {vehicleIcons[option.vehicleType] || <FaCar className="w-10 h-10" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{option.vehicleType}</h3>
                            <p className="text-gray-500 text-sm mb-2">{vehicleDescriptions[option.vehicleType]}</p>
                          </div>
                          {option.vehicleType === 'VIP' && (
                            <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-gray-700 font-medium">{option.supplier.name}</span>
                          {option.supplier.rating > 0 && (
                            <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-lg">
                              <FaStar className="text-yellow-400" />
                              <span className="font-semibold text-gray-800">{option.supplier.rating.toFixed(1)}</span>
                              <span className="text-gray-400 text-sm">({option.supplier.ratingCount})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Capacity & Duration */}
                    <div className="flex items-center gap-6 lg:gap-8 text-gray-600 border-y lg:border-y-0 lg:border-x border-gray-100 py-4 lg:py-0 lg:px-8">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                          <FaUser className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{vehicleCapacity[option.vehicleType]?.passengers || 4}</p>
                          <p className="text-xs text-gray-500">max</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                          <FaSuitcase className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{vehicleCapacity[option.vehicleType]?.luggage || 4}</p>
                          <p className="text-xs text-gray-500">bags</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                          <FaClock className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{option.estimatedDurationMin}</p>
                          <p className="text-xs text-gray-500">min</p>
                        </div>
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total price</p>
                        <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                          {option.currency} {option.totalPrice.toFixed(2)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectOption(option)}
                        className="w-full lg:w-auto px-8 py-3.5 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                      >
                        Select Vehicle
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-green-600" />
                        </span>
                        {option.cancellationPolicy}
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-green-600" />
                        </span>
                        Meet & Greet
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-green-600" />
                        </span>
                        Flight Tracking
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheck className="w-3 h-3 text-green-600" />
                        </span>
                        60 min free waiting
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaWifi className="w-3 h-3 text-blue-600" />
                        </span>
                        Free WiFi
                      </span>
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaSnowflake className="w-3 h-3 text-blue-600" />
                        </span>
                        Air Conditioning
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-center text-gray-500 text-sm uppercase tracking-wider mb-6">Why Book With Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FaShieldAlt className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-800">Secure Booking</p>
              <p className="text-sm text-gray-500">SSL encrypted</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FaHeadset className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-800">24/7 Support</p>
              <p className="text-sm text-gray-500">Always here to help</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FaStar className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-800">Top Rated</p>
              <p className="text-sm text-gray-500">Verified drivers</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FaCheck className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-gray-800">Best Price</p>
              <p className="text-sm text-gray-500">Guaranteed</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-teal-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <FaCar className="w-5 h-5 text-accent" />
              </div>
              <span className="font-bold text-xl">Airport Transfer Portal</span>
            </div>
            <p className="text-white/70 text-sm">
              © {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <FaCar className="absolute inset-0 m-auto w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Results</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
