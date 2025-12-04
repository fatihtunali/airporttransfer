'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaPlaneDeparture,
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaShieldAlt,
  FaCar,
  FaGlobe,
  FaHandshake,
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
  FaLinkedinIn,
  FaUsers,
  FaSuitcase,
  FaPlane,
  FaClock,
  FaCalendarCheck,
  FaRoute
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
    passengers: '2',
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

    router.push(`/search?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  // Stats counter animation
  const stats = [
    { value: '500+', label: 'Airports' },
    { value: '100+', label: 'Countries' },
    { value: '50K+', label: 'Happy Customers' },
    { value: '4.9', label: 'Rating' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={180}
                height={50}
                className="h-12 w-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <a href="#how-it-works" className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                How It Works
              </a>
              <a href="#fleet" className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                Our Fleet
              </a>
              <a href="#reviews" className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                Reviews
              </a>
              <Link href="/supplier/login" className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
                Partner Login
              </Link>
              <Link href="/agency/login" className="ml-4 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-full hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5">
                Book Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-colors ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden absolute top-20 left-0 right-0 bg-white shadow-2xl border-t transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div className="p-6 space-y-2">
              <a href="#how-it-works" className="block py-3 px-4 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-medium transition-colors">How It Works</a>
              <a href="#fleet" className="block py-3 px-4 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-medium transition-colors">Our Fleet</a>
              <a href="#reviews" className="block py-3 px-4 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-medium transition-colors">Reviews</a>
              <Link href="/supplier/login" className="block py-3 px-4 text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-xl font-medium transition-colors">Partner Login</Link>
              <div className="pt-4">
                <Link href="/agency/login" className="block py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center font-semibold rounded-xl">Book Now</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Teal/Cyan Theme */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Gradient Background - Travel Quote Bot Style */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900" />

        {/* Animated Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Side - Hero Content */}
            <div className="text-white space-y-8 animate-fade-in">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-400/30">
                <div className="flex -space-x-1">
                  {[1,2,3,4,5].map(i => (
                    <FaStar key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-medium text-teal-200">Rated 4.9/5 by 50,000+ travelers</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  Airport Transfers
                  <span className="block mt-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Made Simple.
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-lg leading-relaxed">
                  Book reliable, pre-arranged transfers in <strong className="text-white">500+ cities</strong> worldwide. Your driver awaits.
                </p>
              </div>

              {/* Quick Stats - Desktop */}
              <div className="hidden md:flex items-center gap-8 pt-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl font-bold text-teal-400">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <FaCheckCircle className="text-teal-400" />
                  <span className="text-sm">Free Cancellation</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FaCheckCircle className="text-teal-400" />
                  <span className="text-sm">Meet & Greet</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FaCheckCircle className="text-teal-400" />
                  <span className="text-sm">Flight Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Side - Booking Form */}
            <div className="animate-slide-up">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/20 border border-white/10">
                {/* Form Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book Your Transfer</h2>
                  <p className="text-gray-500 mt-1">Get instant quotes from local providers</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* From Field */}
                  <div ref={fromRef} className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaPlaneDeparture className="inline mr-2 text-teal-600" />
                      Pick-up Location
                    </label>
                    <input
                      type="text"
                      placeholder={loading ? 'Loading airports...' : 'Airport, city or address'}
                      value={fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setSelectedFrom(null);
                        setShowFromDropdown(true);
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 shadow-sm"
                      required
                    />
                    {showFromDropdown && filteredAirports.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-72 overflow-y-auto">
                        {filteredAirports.slice(0, 6).map((airport) => (
                          <button
                            key={airport.id}
                            type="button"
                            onClick={() => handleFromSelect(airport)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-teal-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FaPlane className="text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-teal-600 text-white text-xs rounded-md font-bold">{airport.code}</span>
                                <span className="truncate">{airport.name}</span>
                              </div>
                              <div className="text-sm text-gray-500">{airport.city}, {airport.country}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* To Field */}
                  <div ref={toRef} className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-cyan-600" />
                      Drop-off Location
                    </label>
                    <input
                      type="text"
                      placeholder={selectedFrom ? 'Hotel, address or zone' : 'Select pick-up first'}
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setSelectedTo(null);
                        setShowToDropdown(true);
                      }}
                      onFocus={() => selectedFrom && setShowToDropdown(true)}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                      disabled={!selectedFrom}
                      required
                    />
                    {showToDropdown && searchedZones.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-72 overflow-y-auto">
                        {searchedZones.slice(0, 6).map((zone) => (
                          <button
                            key={zone.id}
                            type="button"
                            onClick={() => handleToSelect(zone)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FaMapMarkerAlt className="text-cyan-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{zone.name}</div>
                              <div className="text-sm text-gray-500">{zone.city}, {zone.country}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date, Time, Passengers Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        min={today}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-3 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                      <select
                        value={formData.passengers}
                        onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                        className="w-full px-3 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 shadow-sm cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
                  >
                    Search Transfers
                    <FaArrowRight className="text-sm" />
                  </button>
                </form>

                {/* Form Footer */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FaShieldAlt className="text-green-500" />
                    <span>Secure booking</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FaCreditCard className="text-teal-500" />
                    <span>Pay later</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="grid grid-cols-4 gap-4 mt-12 md:hidden">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-teal-400">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-gray-600">
              <FaShieldAlt className="text-teal-600 text-xl" />
              <span className="font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaCreditCard className="text-teal-600 text-xl" />
              <span className="font-medium">All Cards Accepted</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaHeadset className="text-teal-600 text-xl" />
              <span className="font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaCheckCircle className="text-teal-600 text-xl" />
              <span className="font-medium">Free Cancellation</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaRoute /> Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From search to pickup, we make airport transfers effortless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                icon: FaPlaneDeparture,
                title: 'Search & Compare',
                description: 'Enter your route and instantly compare prices from verified local suppliers.',
                color: 'teal'
              },
              {
                step: '02',
                icon: FaCar,
                title: 'Choose Vehicle',
                description: 'Select from economy to luxury vehicles. See photos, reviews, and inclusions.',
                color: 'cyan'
              },
              {
                step: '03',
                icon: FaCalendarCheck,
                title: 'Book & Relax',
                description: 'Confirm with instant booking. Your driver will be waiting with a name sign.',
                color: 'emerald'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${item.color}-100`}>
                      <item.icon className={`text-2xl text-${item.color}-600`} />
                    </div>
                    <span className="text-5xl font-bold text-gray-100 group-hover:text-teal-100 transition-colors">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-0.5 bg-gradient-to-r from-teal-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Fleet Section */}
      <section className="py-24 bg-gray-50" id="fleet">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaCar /> Our Fleet
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Ride
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From budget-friendly sedans to luxury vehicles for any occasion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Economy', icon: FaCar, passengers: '1-3', luggage: '2', price: 'From $25', desc: 'Comfortable & affordable' },
              { name: 'Business', icon: FaUserTie, passengers: '1-3', luggage: '2', price: 'From $45', desc: 'Premium sedans' },
              { name: 'Minivan', icon: FaShuttleVan, passengers: '4-6', luggage: '5', price: 'From $55', desc: 'Perfect for families' },
              { name: 'Minibus', icon: FaBus, passengers: '7-16', luggage: '10', price: 'From $85', desc: 'Group travel' },
            ].map((vehicle, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:border-teal-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-teal-50 group-hover:to-cyan-50 transition-colors">
                  <vehicle.icon className="text-7xl text-gray-300 group-hover:text-teal-500 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{vehicle.name}</h3>
                    <span className="text-lg font-bold text-teal-600">{vehicle.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{vehicle.desc}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <FaUsers className="text-teal-500" />
                      <span>{vehicle.passengers}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaSuitcase className="text-teal-500" />
                      <span>{vehicle.luggage}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 text-white relative overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full filter blur-3xl opacity-10" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full filter blur-3xl opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-200 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-teal-400/30">
              <FaStar className="text-yellow-400" /> Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Smart Way to Travel
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join millions of travelers who trust us for hassle-free airport transfers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaGlobe, title: 'Global Coverage', desc: '500+ airports in 100+ countries', color: 'teal' },
              { icon: FaCar, title: 'Verified Suppliers', desc: 'Vetted local partners you can trust', color: 'cyan' },
              { icon: FaShieldAlt, title: 'Secure Booking', desc: 'Protected payments & data', color: 'emerald' },
              { icon: FaClock, title: '24/7 Support', desc: 'We are here when you need us', color: 'amber' },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110 bg-${item.color}-500/20`}>
                  <item.icon className={`text-3xl text-${item.color}-400`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-white" id="reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <FaStar /> Customer Reviews
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Travelers
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} className="text-yellow-400 text-2xl" />
              ))}
            </div>
            <p className="text-gray-600">4.9 out of 5 based on 50,000+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Mitchell', location: 'London, UK', text: 'Exceptional service! Driver was waiting at arrivals with my name. Professional, clean car, and great communication. Will definitely use again!', rating: 5, avatar: 'S' },
              { name: 'Marco Rossi', location: 'Rome, Italy', text: 'Best transfer service I have used. Competitive prices, punctual drivers, and the booking process was incredibly smooth. Highly recommend!', rating: 5, avatar: 'M' },
              { name: 'Emily Chen', location: 'Singapore', text: 'Used for a business trip - everything was perfect. Flight was delayed but driver tracked it and was there when I landed. Top notch!', rating: 5, avatar: 'E' },
            ].map((review, idx) => (
              <div key={idx} className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{review.name}</div>
                    <div className="text-sm text-gray-500">{review.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Book?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of happy travelers. Book your airport transfer now and travel with peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2">
                  Book Your Transfer
                  <FaArrowRight />
                </a>
                <Link href="/become-partner" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20 inline-flex items-center justify-center gap-2">
                  Become a Partner
                  <FaHandshake />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image
                src="/logo/logo_atp.jpg"
                alt="Airport Transfer Portal"
                width={180}
                height={54}
                className="h-12 w-auto rounded-lg mb-6"
              />
              <p className="text-gray-400 mb-6 leading-relaxed">
                Book reliable airport transfers worldwide from verified local suppliers. Travel with confidence.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: FaFacebookF, href: 'https://facebook.com' },
                  { Icon: FaTwitter, href: 'https://twitter.com' },
                  { Icon: FaInstagram, href: 'https://instagram.com' },
                  { Icon: FaLinkedinIn, href: 'https://linkedin.com' },
                ].map(({ Icon, href }, idx) => (
                  <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all duration-300">
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-400 hover:text-teal-400 transition-colors">Search Transfers</Link></li>
                <li><Link href="/popular-routes" className="text-gray-400 hover:text-teal-400 transition-colors">Popular Routes</Link></li>
                <li><Link href="/airport-guides" className="text-gray-400 hover:text-teal-400 transition-colors">Airport Guides</Link></li>
                <li><Link href="/travel-tips" className="text-gray-400 hover:text-teal-400 transition-colors">Travel Tips</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 hover:text-teal-400 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-teal-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-teal-400 transition-colors">FAQs</Link></li>
                <li><Link href="/manage-booking" className="text-gray-400 hover:text-teal-400 transition-colors">Manage Booking</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                    <FaPhone className="text-teal-400" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                    <FaEnvelope className="text-teal-400" />
                  </div>
                  <span>support@airporttransfer.com</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/become-partner" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                  Become a Partner <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="text-gray-500 hover:text-white text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
