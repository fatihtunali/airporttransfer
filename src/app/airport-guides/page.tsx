'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaPlane,
  FaMapMarkerAlt,
  FaArrowRight,
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaWifi,
  FaUtensils,
  FaShoppingBag,
  FaParking,
  FaSubway,
  FaInfoCircle,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const airports = [
  {
    code: 'LHR',
    name: 'London Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    terminals: 4,
    features: ['Free WiFi', 'Shopping', 'Restaurants', 'Lounges'],
    description: 'One of the busiest airports in Europe, serving as a major hub for international travel.',
  },
  {
    code: 'CDG',
    name: 'Paris Charles de Gaulle',
    city: 'Paris',
    country: 'France',
    terminals: 3,
    features: ['Free WiFi', 'Shopping', 'Metro Access', 'Hotels'],
    description: 'The largest airport in France, located northeast of Paris with excellent city connections.',
  },
  {
    code: 'AMS',
    name: 'Amsterdam Schiphol',
    city: 'Amsterdam',
    country: 'Netherlands',
    terminals: 1,
    features: ['Museum', 'Casino', 'Shopping', 'Train Station'],
    description: 'A single-terminal airport known for its efficiency and unique amenities including a museum.',
  },
  {
    code: 'FCO',
    name: 'Rome Fiumicino',
    city: 'Rome',
    country: 'Italy',
    terminals: 4,
    features: ['Shopping', 'Restaurants', 'Train Access', 'VIP Services'],
    description: 'Italy&apos;s largest airport, gateway to the Eternal City with excellent rail connections.',
  },
  {
    code: 'BCN',
    name: 'Barcelona El Prat',
    city: 'Barcelona',
    country: 'Spain',
    terminals: 2,
    features: ['Free WiFi', 'Metro Access', 'Shopping', 'Lounges'],
    description: 'A modern airport serving Catalonia with great public transport to the city center.',
  },
  {
    code: 'DXB',
    name: 'Dubai International',
    city: 'Dubai',
    country: 'UAE',
    terminals: 3,
    features: ['Luxury Shopping', 'Spa', 'Hotels', '24/7 Services'],
    description: 'One of the world&apos;s busiest airports, known for luxury amenities and duty-free shopping.',
  },
  {
    code: 'IST',
    name: 'Istanbul Airport',
    city: 'Istanbul',
    country: 'Turkey',
    terminals: 1,
    features: ['Shopping', 'Restaurants', 'Hotels', 'Modern Facilities'],
    description: 'A new mega-hub connecting Europe and Asia with state-of-the-art facilities.',
  },
  {
    code: 'JFK',
    name: 'New York JFK',
    city: 'New York',
    country: 'USA',
    terminals: 6,
    features: ['AirTrain', 'Shopping', 'Dining', 'Lounges'],
    description: 'The main international gateway to New York City with extensive terminal facilities.',
  },
];

const featureIcons: { [key: string]: React.ElementType } = {
  'Free WiFi': FaWifi,
  'WiFi': FaWifi,
  'Shopping': FaShoppingBag,
  'Luxury Shopping': FaShoppingBag,
  'Restaurants': FaUtensils,
  'Dining': FaUtensils,
  'Metro Access': FaSubway,
  'Train Access': FaSubway,
  'Train Station': FaSubway,
  'AirTrain': FaSubway,
  'Parking': FaParking,
};

export default function AirportGuidesPage() {
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
              <Link href="/popular-routes" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Popular Routes</Link>
              <Link href="/airport-guides" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Airport Guides</Link>
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
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaPlane className="text-teal-400" />
              <span className="text-teal-200">Airport Information</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Airport <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Guides</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Essential information about major airports worldwide to help you plan your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Airports Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {airports.map((airport, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                <div className="h-32 bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center relative">
                  <span className="text-6xl font-bold text-white/20">{airport.code}</span>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">{airport.terminals} Terminal{airport.terminals > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-bold rounded-lg">{airport.code}</span>
                    <span className="text-gray-500 text-sm">{airport.city}, {airport.country}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{airport.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{airport.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {airport.features.map((feature, fidx) => {
                      const Icon = featureIcons[feature] || FaInfoCircle;
                      return (
                        <span key={fidx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          <Icon className="text-teal-500" />
                          {feature}
                        </span>
                      );
                    })}
                  </div>
                  <Link href="/" className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                    Book Transfer <FaArrowRight className="text-sm" />
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
            Need Help at Your Airport?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our drivers know every airport inside out. Book your transfer and enjoy a stress-free journey.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:shadow-lg transition-all">
            Book Your Transfer <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={54} className="h-12 w-auto rounded-lg mb-6" />
              <p className="text-white/80 mb-6">Book reliable airport transfers worldwide from verified local suppliers.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-white/80 hover:text-white">Search Transfers</Link></li>
                <li><Link href="/popular-routes" className="text-white/80 hover:text-white">Popular Routes</Link></li>
                <li><Link href="/airport-guides" className="text-white/80 hover:text-white">Airport Guides</Link></li>
                <li><Link href="/travel-tips" className="text-white/80 hover:text-white">Travel Tips</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-white/80 hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="text-white/80 hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="text-white/80 hover:text-white">FAQs</Link></li>
                <li><Link href="/manage-booking" className="text-white/80 hover:text-white">Manage Booking</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white"><FaPhone className="text-teal-400" /><span>+90 216 557 52 52</span></li>
                <li className="flex items-center gap-3 text-white"><FaEnvelope className="text-teal-400" /><span>support@airporttransferportal.com</span></li>
              </ul>
              <Link href="/become-partner" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold mt-6">
                Become a Partner <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm">&copy; {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-white/70 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/privacy" className="text-white/70 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/cookies" className="text-white/70 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
