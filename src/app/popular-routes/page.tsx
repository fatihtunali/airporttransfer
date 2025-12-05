'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaPlane,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaClock,
  FaCar,
  FaUsers,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const popularRoutes = [
  {
    from: 'London Heathrow (LHR)',
    to: 'Central London',
    price: 'From €45',
    duration: '45-60 min',
    rating: 4.9,
    reviews: 12500,
    image: '/images/london.jpg',
  },
  {
    from: 'Paris CDG (CDG)',
    to: 'Paris City Center',
    price: 'From €55',
    duration: '40-50 min',
    rating: 4.8,
    reviews: 9800,
    image: '/images/paris.jpg',
  },
  {
    from: 'Barcelona El Prat (BCN)',
    to: 'Barcelona City',
    price: 'From €35',
    duration: '25-35 min',
    rating: 4.9,
    reviews: 8200,
    image: '/images/barcelona.jpg',
  },
  {
    from: 'Rome Fiumicino (FCO)',
    to: 'Rome City Center',
    price: 'From €50',
    duration: '35-45 min',
    rating: 4.7,
    reviews: 7500,
    image: '/images/rome.jpg',
  },
  {
    from: 'Amsterdam Schiphol (AMS)',
    to: 'Amsterdam Center',
    price: 'From €40',
    duration: '20-30 min',
    rating: 4.9,
    reviews: 6800,
    image: '/images/amsterdam.jpg',
  },
  {
    from: 'Dubai International (DXB)',
    to: 'Dubai Marina',
    price: 'From €30',
    duration: '25-35 min',
    rating: 4.8,
    reviews: 5500,
    image: '/images/dubai.jpg',
  },
  {
    from: 'New York JFK (JFK)',
    to: 'Manhattan',
    price: 'From €65',
    duration: '45-75 min',
    rating: 4.7,
    reviews: 11200,
    image: '/images/newyork.jpg',
  },
  {
    from: 'Istanbul Airport (IST)',
    to: 'Istanbul City',
    price: 'From €35',
    duration: '40-60 min',
    rating: 4.8,
    reviews: 7100,
    image: '/images/istanbul.jpg',
  },
];

export default function PopularRoutesPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              <Link href="/popular-routes" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Popular Routes</Link>
              <Link href="/airport-guides" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Airport Guides</Link>
              <Link href="/contact" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Contact</Link>
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
              <FaMapMarkerAlt className="text-teal-400" />
              <span className="text-teal-200">Top Destinations</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Popular <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Transfer Routes</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our most booked airport transfer routes with the best prices and verified drivers.
            </p>
          </div>
        </div>
      </section>

      {/* Routes Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularRoutes.map((route, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="h-40 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                  <FaPlane className="text-6xl text-teal-500/30" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-teal-600 mb-2">
                    <FaPlane />
                    <span className="font-medium">{route.from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-cyan-600 mb-4">
                    <FaMapMarkerAlt />
                    <span className="font-medium">{route.to}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">{route.price}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <FaStar />
                      <span className="text-gray-700 font-medium">{route.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FaClock />
                      <span>{route.duration}</span>
                    </div>
                    <span>{route.reviews.toLocaleString()} reviews</span>
                  </div>
                  <Link href="/" className="block w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Don&apos;t See Your Route?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We cover 500+ airports worldwide. Search for your specific route and get instant quotes.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:shadow-lg transition-all">
            Search All Routes <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={54} className="h-12 w-auto rounded-lg mb-6" />
              <p className="text-gray-400 mb-6">Book reliable airport transfers worldwide from verified local suppliers.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-400 hover:text-teal-400">Search Transfers</Link></li>
                <li><Link href="/popular-routes" className="text-gray-400 hover:text-teal-400">Popular Routes</Link></li>
                <li><Link href="/airport-guides" className="text-gray-400 hover:text-teal-400">Airport Guides</Link></li>
                <li><Link href="/travel-tips" className="text-gray-400 hover:text-teal-400">Travel Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 hover:text-teal-400">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-teal-400">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-teal-400">FAQs</Link></li>
                <li><Link href="/manage-booking" className="text-gray-400 hover:text-teal-400">Manage Booking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400">
                  <FaPhone className="text-teal-400" />
                  <span>+90 216 557 52 52</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <FaEnvelope className="text-teal-400" />
                  <span>support@airporttransferportal.com</span>
                </li>
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
