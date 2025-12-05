'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaArrowRight,
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaSearch,
  FaCalendarAlt,
  FaEdit,
  FaTimesCircle,
  FaCheckCircle,
  FaCar,
  FaMapMarkerAlt,
  FaPlane,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function ManageBookingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchForm, setSearchForm] = useState({
    bookingRef: '',
    email: '',
  });
  const [booking, setBooking] = useState<{
    ref: string;
    status: string;
    date: string;
    time: string;
    from: string;
    to: string;
    vehicle: string;
    passengers: number;
    price: string;
    driver?: string;
    driverPhone?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/public/bookings/${encodeURIComponent(searchForm.bookingRef)}?email=${encodeURIComponent(searchForm.email)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Booking not found. Please check your booking reference and email address.');
        setLoading(false);
        return;
      }

      // Check if email matches any passenger email
      const passengerEmails = data.passengers?.map((p: { email: string }) => p.email?.toLowerCase()) || [];
      if (!passengerEmails.includes(searchForm.email.toLowerCase())) {
        setError('Email address does not match the booking. Please use the email address used when booking.');
        setLoading(false);
        return;
      }

      // Format the booking data
      const pickupDate = new Date(data.pickupTime);
      const from = data.direction === 'from_airport'
        ? `${data.airport?.name} (${data.airport?.code})`
        : data.pickupAddress || data.zone?.name;
      const to = data.direction === 'from_airport'
        ? data.dropoffAddress || data.zone?.name
        : `${data.airport?.name} (${data.airport?.code})`;

      setBooking({
        ref: data.publicCode,
        status: data.status,
        date: pickupDate.toLocaleDateString('en-GB'),
        time: pickupDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        from: from || 'N/A',
        to: to || 'N/A',
        vehicle: data.vehicleType,
        passengers: data.paxAdults + data.paxChildren,
        price: `${data.currency} ${data.totalPrice.toFixed(2)}`,
        driver: data.ride?.driver?.name,
        driverPhone: data.ride?.driver?.phone,
      });
    } catch {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center group">
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={50} className="h-12 w-auto rounded-lg shadow-md" priority />
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Home</Link>
              <Link href="/help" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Help Center</Link>
              <Link href="/manage-booking" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Manage Booking</Link>
              <Link href="/" className="ml-4 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all">Book Now</Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden p-2.5 rounded-xl ${isScrolled ? 'text-gray-700' : 'text-white'}`}>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaCalendarAlt className="text-teal-400" />
              <span className="text-teal-200">Your Booking</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Manage Your <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Booking</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              View, modify, or cancel your airport transfer booking in just a few clicks.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!booking ? (
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Find Your Booking</h2>
              <p className="text-gray-600 mb-8 text-center">Enter your booking reference and email address</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                  <FaTimesCircle />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Reference *</label>
                  <input
                    type="text"
                    required
                    value={searchForm.bookingRef}
                    onChange={(e) => setSearchForm({ ...searchForm, bookingRef: e.target.value })}
                    placeholder="ATP-XXXXXX"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={searchForm.email}
                    onChange={(e) => setSearchForm({ ...searchForm, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Find Booking
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-gray-500 text-sm mt-6">
                Tip: Your booking reference was sent to your email when you booked.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Booking Details */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Booking Reference</span>
                    <h2 className="text-2xl font-bold text-gray-900">{booking.ref}</h2>
                  </div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                    <FaCheckCircle /> {booking.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaCalendarAlt className="text-teal-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Date & Time</span>
                        <p className="font-semibold text-gray-900">{booking.date} at {booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaPlane className="text-teal-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Pick-up</span>
                        <p className="font-semibold text-gray-900">{booking.from}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaMapMarkerAlt className="text-cyan-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Drop-off</span>
                        <p className="font-semibold text-gray-900">{booking.to}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FaCar className="text-gray-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Vehicle</span>
                        <p className="font-semibold text-gray-900">{booking.vehicle} ({booking.passengers} passengers)</p>
                      </div>
                    </div>
                    {booking.driver && (
                      <div className="p-4 bg-teal-50 rounded-xl">
                        <span className="text-sm text-teal-600 font-medium">Driver Assigned</span>
                        <p className="font-bold text-gray-900">{booking.driver}</p>
                        <p className="text-gray-600">{booking.driverPhone}</p>
                      </div>
                    )}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total Price</span>
                      <p className="text-3xl font-bold text-teal-600">{booking.price}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-teal-500 hover:text-teal-600 transition-all">
                  <FaEdit /> Modify Booking
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-red-500 hover:text-red-600 transition-all">
                  <FaTimesCircle /> Cancel Booking
                </button>
              </div>

              <button
                onClick={() => setBooking(null)}
                className="w-full text-center text-gray-500 hover:text-teal-600 transition-colors"
              >
                Search for another booking
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8">
            If you can&apos;t find your booking or need assistance, our support team is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:shadow-lg transition-all">
              Contact Support <FaArrowRight />
            </Link>
            <Link href="/faq" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all">
              View FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={54} className="h-12 w-auto rounded-lg mb-6" />
              <p className="text-gray-300 mb-6">Book reliable airport transfers worldwide from verified local suppliers.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-teal-400">Search Transfers</Link></li>
                <li><Link href="/popular-routes" className="text-gray-300 hover:text-teal-400">Popular Routes</Link></li>
                <li><Link href="/airport-guides" className="text-gray-300 hover:text-teal-400">Airport Guides</Link></li>
                <li><Link href="/travel-tips" className="text-gray-300 hover:text-teal-400">Travel Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-300 hover:text-teal-400">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-teal-400">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-teal-400">FAQs</Link></li>
                <li><Link href="/manage-booking" className="text-gray-300 hover:text-teal-400">Manage Booking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300"><FaPhone className="text-teal-400" /><span>+90 216 557 52 52</span></li>
                <li className="flex items-center gap-3 text-gray-300"><FaEnvelope className="text-teal-400" /><span>support@airporttransferportal.com</span></li>
              </ul>
              <Link href="/become-partner" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold mt-6">
                Become a Partner <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm">&copy; {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/cookies" className="text-gray-300 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
