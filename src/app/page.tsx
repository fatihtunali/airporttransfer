'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaSuitcase,
  FaSearch,
  FaShieldAlt,
  FaCar,
  FaGlobe,
  FaHandshake,
  FaMapMarkerAlt
} from 'react-icons/fa';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface Zone {
  id: number;
  name: string;
  city: string;
  country: string;
}

type LocationItem = (Airport & { type: 'airport' }) | (Zone & { type: 'zone' });

export default function Home() {
  const router = useRouter();
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected values
  const [selectedFrom, setSelectedFrom] = useState<LocationItem | null>(null);
  const [selectedTo, setSelectedTo] = useState<LocationItem | null>(null);

  // Search inputs
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    returnDate: '',
    returnTime: '',
    passengers: '2',
    luggage: '2',
    flightNumber: '',
  });

  // Fetch airports on mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await fetch('/api/public/airports');
        const data = await res.json();
        setAirports(data);
      } catch (error) {
        console.error('Failed to fetch airports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, []);

  // Fetch zones when airport is selected (for "To" field)
  useEffect(() => {
    if (selectedFrom?.type === 'airport') {
      const fetchZones = async () => {
        try {
          const res = await fetch(`/api/public/zones?airportId=${selectedFrom.id}`);
          const data = await res.json();
          setFilteredZones(data);
        } catch (error) {
          console.error('Failed to fetch zones:', error);
        }
      };
      fetchZones();
    } else {
      setFilteredZones([]);
    }
  }, [selectedFrom]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter airports based on search
  const filteredAirports = airports.filter(
    (a) =>
      a.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
      a.code.toLowerCase().includes(fromSearch.toLowerCase()) ||
      a.city.toLowerCase().includes(fromSearch.toLowerCase())
  );

  // Filter zones for "To" based on search
  const searchedZones = filteredZones.filter(
    (z) =>
      z.name.toLowerCase().includes(toSearch.toLowerCase()) ||
      z.city.toLowerCase().includes(toSearch.toLowerCase())
  );

  const handleFromSelect = (airport: Airport) => {
    setSelectedFrom({ ...airport, type: 'airport' });
    setFromSearch(`${airport.code} - ${airport.name}`);
    setShowFromDropdown(false);
    // Reset "To" when airport changes
    setSelectedTo(null);
    setToSearch('');
  };

  const handleToSelect = (zone: Zone) => {
    setSelectedTo({ ...zone, type: 'zone' });
    setToSearch(zone.name);
    setShowToDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFrom || !selectedTo || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    // Build search params
    const pickupDateTime = `${formData.date}T${formData.time}:00`;
    const params = new URLSearchParams({
      airportId: selectedFrom.id.toString(),
      zoneId: selectedTo.id.toString(),
      direction: 'FROM_AIRPORT',
      pickupTime: pickupDateTime,
      paxAdults: formData.passengers,
      currency: 'EUR',
    });

    if (formData.flightNumber) {
      params.set('flightNumber', formData.flightNumber);
    }

    // Navigate to search results
    router.push(`/search?${params.toString()}`);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-white/90 hover:text-white transition-colors">How It Works</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors">Popular Routes</a>
              <a href="#" className="text-white/90 hover:text-white transition-colors">Help</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/airport-pickup.jpg')`,
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Centered Layout */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Airport Transfers
              <span className="block text-orange-400">Worldwide</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Book reliable transfers from local suppliers. Compare prices and travel with confidence.
            </p>
          </div>

          {/* Search Card - Full Width Centered */}
          <div className="card max-w-4xl mx-auto">
                {/* Trip Type Toggle */}
                <div className="flex mb-6">
                  <button
                    onClick={() => setTripType('one-way')}
                    className={`flex-1 py-3 text-center font-semibold rounded-l-lg transition-all ${
                      tripType === 'one-way'
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    One Way
                  </button>
                  <button
                    onClick={() => setTripType('round-trip')}
                    className={`flex-1 py-3 text-center font-semibold rounded-r-lg transition-all ${
                      tripType === 'round-trip'
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Round Trip
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-5 mb-5">
                    {/* From - Airport Autocomplete */}
                    <div className="relative" ref={fromRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">From (Airport)</label>
                      <div className="flex items-center gap-3">
                        <FaPlaneDeparture className="text-sky-500 text-xl flex-shrink-0" />
                        <input
                          type="text"
                          placeholder={loading ? 'Loading airports...' : 'Select airport'}
                          value={fromSearch}
                          onChange={(e) => {
                            setFromSearch(e.target.value);
                            setSelectedFrom(null);
                            setShowFromDropdown(true);
                          }}
                          onFocus={() => setShowFromDropdown(true)}
                          className="input-field"
                          required
                        />
                      </div>
                      {showFromDropdown && filteredAirports.length > 0 && (
                        <div className="absolute z-50 w-full min-w-[320px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                          {filteredAirports.map((airport) => (
                            <button
                              key={airport.id}
                              type="button"
                              onClick={() => handleFromSelect(airport)}
                              className="w-full px-4 py-3 text-left hover:bg-sky-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                            >
                              <FaPlaneDeparture className="text-sky-500 mt-1 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                  <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded text-sm font-bold">{airport.code}</span>
                                  <span className="truncate">{airport.name}</span>
                                </div>
                                <div className="text-sm text-gray-500 truncate">{airport.city}, {airport.country}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* To - Zone Autocomplete */}
                    <div className="relative" ref={toRef}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">To (Destination)</label>
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-orange-500 text-xl flex-shrink-0" />
                        <input
                          type="text"
                          placeholder={selectedFrom ? 'Select destination' : 'Select airport first'}
                          value={toSearch}
                          onChange={(e) => {
                            setToSearch(e.target.value);
                            setSelectedTo(null);
                            setShowToDropdown(true);
                          }}
                          onFocus={() => selectedFrom && setShowToDropdown(true)}
                          className="input-field"
                          disabled={!selectedFrom}
                          required
                        />
                      </div>
                      {showToDropdown && searchedZones.length > 0 && (
                        <div className="absolute z-50 w-full min-w-[320px] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                          {searchedZones.map((zone) => (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => handleToSelect(zone)}
                              className="w-full px-4 py-3 text-left hover:bg-sky-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                            >
                              <FaMapMarkerAlt className="text-orange-500 mt-1 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 truncate">{zone.name}</div>
                                <div className="text-sm text-gray-500 truncate">{zone.city}, {zone.country}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-5 mb-5">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-sky-500 text-lg flex-shrink-0" />
                        <input
                          type="date"
                          min={today}
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                      <div className="flex items-center gap-3">
                        <FaClock className="text-sky-500 text-lg flex-shrink-0" />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    {/* Passengers */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Passengers</label>
                      <div className="flex items-center gap-3">
                        <FaUsers className="text-sky-500 text-lg flex-shrink-0" />
                        <select
                          value={formData.passengers}
                          onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                          className="input-field appearance-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Luggage */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Luggage</label>
                      <div className="flex items-center gap-3">
                        <FaSuitcase className="text-sky-500 text-lg flex-shrink-0" />
                        <select
                          value={formData.luggage}
                          onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                          className="input-field appearance-none"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'Bag' : 'Bags'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Round Trip Fields */}
                  {tripType === 'round-trip' && (
                    <div className="grid md:grid-cols-2 gap-5 mb-5 p-5 bg-sky-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date</label>
                        <div className="flex items-center gap-3">
                          <FaCalendarAlt className="text-sky-500 text-lg flex-shrink-0" />
                          <input
                            type="date"
                            min={formData.date || today}
                            value={formData.returnDate}
                            onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                            className="input-field"
                            required={tripType === 'round-trip'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Return Time</label>
                        <div className="flex items-center gap-3">
                          <FaClock className="text-sky-500 text-lg flex-shrink-0" />
                          <input
                            type="time"
                            value={formData.returnTime}
                            onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                            className="input-field"
                            required={tripType === 'round-trip'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flight Number (Optional) */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Number (Optional)</label>
                    <div className="flex items-center gap-3 max-w-xs">
                      <FaPlaneArrival className="text-sky-500 text-lg flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g., TK1234"
                        value={formData.flightNumber}
                        onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                        className="input-field"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-8">For airport pickups - we'll track your flight</p>
                  </div>

                  {/* Search Button */}
                  <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 text-lg py-4">
                    <FaSearch />
                    Search Transfers
                  </button>
                </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AirportTransfer?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The smart way to book airport transfers worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaGlobe className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-600">Transfers available in thousands of cities and airports worldwide</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaCar className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Suppliers</h3>
              <p className="text-gray-600">Compare prices from verified local transfer companies</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Booking</h3>
              <p className="text-gray-600">Safe payment and instant confirmation for every booking</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Customer support available around the clock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={180}
                height={54}
                className="h-11 w-auto bg-white rounded p-1"
              />
              <p className="text-gray-400 mt-4">
                Book reliable airport transfers worldwide from verified local suppliers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Transfers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Search Transfers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Popular Routes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Airport Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Travel Tips</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manage Booking</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/partner" className="hover:text-white transition-colors">Become a Partner</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} AirportTransfer. All rights reserved.</p>
            <a href="/partner" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
              Are you a transfer company? Join our network →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
