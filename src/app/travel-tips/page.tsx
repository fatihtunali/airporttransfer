'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaLightbulb,
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
  FaSuitcase,
  FaPassport,
  FaMobileAlt,
  FaShieldAlt,
  FaMoneyBillWave,
  FaPlane,
  FaCheckCircle,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const tips = [
  {
    icon: FaClock,
    title: 'Book in Advance',
    description: 'Book your airport transfer at least 24-48 hours before your flight. This ensures availability and often gets you better rates.',
    category: 'Planning',
  },
  {
    icon: FaPassport,
    title: 'Share Flight Details',
    description: 'Always provide your flight number when booking. This allows drivers to track your flight and adjust pickup times for delays.',
    category: 'Booking',
  },
  {
    icon: FaMobileAlt,
    title: 'Download Confirmation',
    description: 'Save your booking confirmation offline. You will need it at the airport, and WiFi might not always be available.',
    category: 'Preparation',
  },
  {
    icon: FaSuitcase,
    title: 'Declare Extra Luggage',
    description: 'If you have more than 2 large bags, mention it when booking to ensure an appropriate vehicle is assigned.',
    category: 'Booking',
  },
  {
    icon: FaShieldAlt,
    title: 'Verify Driver Identity',
    description: 'Your driver will display a name sign. Verify their identity before entering the vehicle for your safety.',
    category: 'Safety',
  },
  {
    icon: FaMoneyBillWave,
    title: 'Know What is Included',
    description: 'Check if tolls, parking fees, and waiting time are included in your quote. Ask before booking to avoid surprises.',
    category: 'Pricing',
  },
  {
    icon: FaPlane,
    title: 'Allow Buffer Time',
    description: 'For airport pickups, schedule your transfer 2-3 hours before your flight to account for traffic and check-in.',
    category: 'Planning',
  },
  {
    icon: FaCheckCircle,
    title: 'Read Reviews',
    description: 'Check reviews and ratings of transfer providers. Past customer experiences can help you choose the best service.',
    category: 'Booking',
  },
];

const categories = ['All', 'Planning', 'Booking', 'Preparation', 'Safety', 'Pricing'];

export default function TravelTipsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredTips = activeCategory === 'All'
    ? tips
    : tips.filter(tip => tip.category === activeCategory);

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
              <Link href="/travel-tips" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Travel Tips</Link>
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaLightbulb className="text-yellow-400" />
              <span className="text-teal-200">Expert Advice</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Travel <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Tips</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Make the most of your airport transfer with our expert tips and advice.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                  activeCategory === category
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTips.map((tip, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4">
                  <tip.icon className="text-2xl text-teal-600" />
                </div>
                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-600 text-xs font-semibold rounded-full mb-3">
                  {tip.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Tips Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pro Traveler Tips</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Advanced tips for frequent travelers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Use Flight Tracking', desc: 'Share your flight number so drivers can monitor delays and arrive accordingly.' },
              { title: 'Save Driver Contact', desc: 'Keep your driver contact handy for emergencies or last-minute changes.' },
              { title: 'Tip Appropriately', desc: 'Tipping 10-15% for excellent service is appreciated in most countries.' },
            ].map((tip, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
                  <FaCheckCircle className="text-teal-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                <p className="text-gray-300 text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Book Your Transfer?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Put these tips into practice and enjoy a seamless airport transfer experience.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:shadow-lg transition-all">
            Book Now <FaArrowRight />
          </Link>
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
