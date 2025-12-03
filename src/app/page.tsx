'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaHeadset,
  FaCreditCard,
  FaUserTie,
  FaBus,
  FaShuttleVan,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn
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
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Scroll handler for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch airports on mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await fetch('/api/public/airports');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAirports(data);
        } else {
          setAirports([]);
        }
      } catch {
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, []);

  // Fetch zones when airport is selected
  useEffect(() => {
    if (selectedFrom?.type === 'airport') {
      const fetchZones = async () => {
        try {
          const res = await fetch(`/api/public/zones?airportId=${selectedFrom.id}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setFilteredZones(data);
          } else {
            setFilteredZones([]);
          }
        } catch {
          setFilteredZones([]);
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

    router.push(`/search?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'navbar-solid' : 'navbar-transparent'}`}>
        <div className="container-custom">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={180}
                height={50}
                className="h-12 w-auto rounded"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#how-it-works" className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                How It Works
              </a>
              <a href="#vehicles" className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                Vehicles
              </a>
              <a href="#reviews" className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                Reviews
              </a>
              <Link href="/supplier/login" className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                Partner Login
              </Link>
              <Link href="/agency/login" className="btn-primary btn-sm">
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700' : 'text-white'}`}
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-xl border-t animate-slide-down">
              <div className="p-4 space-y-4">
                <a href="#how-it-works" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">How It Works</a>
                <a href="#vehicles" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">Vehicles</a>
                <a href="#reviews" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">Reviews</a>
                <Link href="/supplier/login" className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg">Partner Login</Link>
                <Link href="/agency/login" className="btn-primary w-full text-center">Book Now</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/assets/airport-pickup.jpg')` }}
        />
        <div className="hero-overlay" />
        <div className="hero-pattern" />

        <div className="relative z-10 w-full container-custom pt-32 pb-20">
          {/* Centered Hero Content */}
          <div className="text-center text-white animate-fade-in mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FaStar className="text-yellow-400" />
              <span className="text-sm font-medium">Rated 4.9/5 by 10,000+ customers</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Book Your Airport
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00b4b4] to-[#00d4d4]">
                Transfer Worldwide
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Reliable, comfortable, and affordable airport transfers from verified local suppliers.
            </p>
          </div>

          {/* Wide Centered Search Form */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/70 rounded-xl p-4 animate-slide-up">
              <form onSubmit={handleSubmit}>
                {/* Row 1: Trip Type Toggle - Colorful */}
                <div className="flex justify-center mb-3">
                  <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setTripType('one-way')}
                      className={`px-5 py-2 text-sm font-semibold transition-all ${tripType === 'one-way' ? 'bg-[#00b4b4] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      One Way
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripType('round-trip')}
                      className={`px-5 py-2 text-sm font-semibold transition-all ${tripType === 'round-trip' ? 'bg-[#00b4b4] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Round Trip
                    </button>
                  </div>
                </div>

                {/* Row 2: Pick Up & Drop Off */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div ref={fromRef} className="relative">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Pick Up</label>
                    <input
                      type="text"
                      placeholder={loading ? 'Loading...' : 'Select airport'}
                      value={fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setSelectedFrom(null);
                        setShowFromDropdown(true);
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                      required
                    />
                    {showFromDropdown && filteredAirports.length > 0 && (
                      <div className="dropdown">
                        {filteredAirports.slice(0, 8).map((airport) => (
                          <button
                            key={airport.id}
                            type="button"
                            onClick={() => handleFromSelect(airport)}
                            className="dropdown-item"
                          >
                            <FaPlaneDeparture className="dropdown-item-icon" />
                            <div>
                              <div className="dropdown-item-title flex items-center gap-2">
                                <span className="badge badge-primary">{airport.code}</span>
                                {airport.name}
                              </div>
                              <div className="dropdown-item-subtitle">{airport.city}, {airport.country}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div ref={toRef} className="relative">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Drop Off</label>
                    <input
                      type="text"
                      placeholder={selectedFrom ? 'Select destination' : 'Select pickup first'}
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setSelectedTo(null);
                        setShowToDropdown(true);
                      }}
                      onFocus={() => selectedFrom && setShowToDropdown(true)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4] disabled:bg-gray-50"
                      disabled={!selectedFrom}
                      required
                    />
                    {showToDropdown && searchedZones.length > 0 && (
                      <div className="dropdown">
                        {searchedZones.slice(0, 8).map((zone) => (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => handleToSelect(zone)}
                            className="dropdown-item"
                          >
                            <FaMapMarkerAlt className="dropdown-item-icon text-[#ff6b35]" />
                            <div>
                              <div className="dropdown-item-title">{zone.name}</div>
                              <div className="dropdown-item-subtitle">{zone.city}, {zone.country}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Date, Time, Passengers, Luggage, Flight */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Date</label>
                    <input
                      type="date"
                      min={today}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Passengers</label>
                    <select
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Luggage</label>
                    <select
                      value={formData.luggage}
                      onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Flight No.</label>
                    <input
                      type="text"
                      placeholder="TK1234"
                      value={formData.flightNumber}
                      onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                    />
                  </div>
                </div>

                {/* Round Trip Fields (conditional) */}
                {tripType === 'round-trip' && (
                  <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-[#f0fafa] rounded-lg border border-[#00b4b4]/20">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Return Date</label>
                      <input
                        type="date"
                        min={formData.date || today}
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                        required={tripType === 'round-trip'}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Return Time</label>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00b4b4]"
                        required={tripType === 'round-trip'}
                      />
                    </div>
                  </div>
                )}

                {/* Row 4: Search Button - Smaller */}
                <div className="flex justify-center">
                  <button type="submit" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-semibold px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <FaSearch className="text-xs" />
                    Search Transfers
                  </button>
                </div>
              </form>
            </div>

            {/* Trust Indicators below form */}
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-white/90">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#00b4b4]" />
                <span>Free Cancellation</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#00b4b4]" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#00b4b4]" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-[#00b4b4]" />
                <span>500+ Airports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-[#00b4b4]" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-[#00b4b4]" />
              <span className="text-sm font-medium">All Cards Accepted</span>
            </div>
            <div className="flex items-center gap-2">
              <FaHeadset className="text-[#00b4b4]" />
              <span className="text-sm font-medium">24/7 Customer Support</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-[#00b4b4]" />
              <span className="text-sm font-medium">Free Cancellation</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-[#f8fafc]" id="how-it-works">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="badge badge-primary mb-4">Simple & Easy</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your airport transfer in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="feature-icon feature-icon-teal">
                <FaSearch size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Search & Compare</h3>
              <p className="text-gray-600">
                Enter your pickup and drop-off locations. Compare prices from multiple verified local suppliers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-orange">
                <FaCar size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Choose Your Vehicle</h3>
              <p className="text-gray-600">
                Select from economy cars to luxury vehicles. Pick the one that fits your needs and budget.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <FaCheckCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Book & Relax</h3>
              <p className="text-gray-600">
                Confirm your booking with instant confirmation. Your driver will be waiting at the airport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="section-padding" id="vehicles">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="badge badge-secondary mb-4">Our Fleet</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Vehicle
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From budget-friendly sedans to luxury SUVs, we have the perfect ride for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Economy Sedan', icon: FaCar, passengers: '1-3', luggage: '2', price: 'From $25' },
              { name: 'Business Sedan', icon: FaUserTie, passengers: '1-3', luggage: '2', price: 'From $45' },
              { name: 'Minivan', icon: FaShuttleVan, passengers: '4-6', luggage: '4', price: 'From $55' },
              { name: 'Minibus', icon: FaBus, passengers: '7-16', luggage: '8', price: 'From $85' },
            ].map((vehicle) => (
              <div key={vehicle.name} className="vehicle-card">
                <div className="vehicle-card-image">
                  <vehicle.icon size={64} className="text-[#1e3a5f]" />
                </div>
                <div className="vehicle-card-content">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <FaUsers className="text-[#00b4b4]" /> {vehicle.passengers}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaSuitcase className="text-[#00b4b4]" /> {vehicle.luggage}
                    </span>
                  </div>
                  <div className="vehicle-card-price">{vehicle.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding gradient-bg text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="badge bg-white/20 text-white mb-4">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Smart Way to Book Transfers
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Join thousands of satisfied travelers who trust us for their airport transfers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaGlobe className="w-8 h-8 text-[#00b4b4]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Coverage</h3>
              <p className="text-white/70">500+ airports in 100+ countries worldwide</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaCar className="w-8 h-8 text-[#ff6b35]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Suppliers</h3>
              <p className="text-white/70">Verified partners with local expertise</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="w-8 h-8 text-[#10b981]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
              <p className="text-white/70">Safe payment & instant confirmation</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="w-8 h-8 text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-white/70">Customer support around the clock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section-padding bg-[#f8fafc]" id="reviews">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="badge badge-primary mb-4">Customer Reviews</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className="text-yellow-400 text-2xl" />
              ))}
              <span className="text-xl font-bold text-gray-900 ml-2">4.9/5</span>
            </div>
            <p className="text-gray-600">Based on 10,000+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', location: 'London, UK', text: 'Excellent service! Driver was waiting right at arrivals with my name. Very professional and the car was spotless.', rating: 5 },
              { name: 'Marco R.', location: 'Rome, Italy', text: 'Best airport transfer I\'ve ever booked. Great price, punctual driver, and easy booking process. Highly recommend!', rating: 5 },
              { name: 'John D.', location: 'New York, USA', text: 'Used this service for a business trip. Everything was perfect - from booking to drop-off. Will use again!', rating: 5 },
            ].map((review, idx) => (
              <div key={idx} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-semibold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="card-glass p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Book Your Transfer?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of happy travelers. Book your airport transfer now and travel with peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="btn-primary btn-lg">
                <FaSearch />
                Search Transfers
              </a>
              <Link href="/supplier/register" className="btn-outline btn-lg">
                Become a Partner
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={180}
                height={54}
                className="h-12 w-auto bg-white rounded p-1 mb-4"
              />
              <p className="text-gray-400 mb-6">
                Book reliable airport transfers worldwide from verified local suppliers.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#00b4b4] hover:text-white transition-colors">
                  <FaFacebookF />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#00b4b4] hover:text-white transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#00b4b4] hover:text-white transition-colors">
                  <FaInstagram />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#00b4b4] hover:text-white transition-colors">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Transfers</h4>
              <ul className="space-y-3">
                <li><a href="#" className="footer-link">Search Transfers</a></li>
                <li><a href="#" className="footer-link">Popular Routes</a></li>
                <li><a href="#" className="footer-link">Airport Guides</a></li>
                <li><a href="#" className="footer-link">Travel Tips</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="footer-link">Help Center</a></li>
                <li><a href="#" className="footer-link">Contact Us</a></li>
                <li><a href="#" className="footer-link">FAQs</a></li>
                <li><a href="#" className="footer-link">Manage Booking</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <FaPhone className="text-[#00b4b4]" />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FaEnvelope className="text-[#00b4b4]" />
                  support@airporttransfer.com
                </li>
              </ul>
              <div className="mt-6">
                <h5 className="text-white font-medium mb-2">Become a Partner</h5>
                <Link href="/supplier/register" className="text-[#00b4b4] hover:text-[#00d4d4] transition-colors flex items-center gap-2">
                  Join our network <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} AirportTransfer Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="footer-link text-sm">Terms of Service</a>
              <a href="#" className="footer-link text-sm">Privacy Policy</a>
              <a href="#" className="footer-link text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
