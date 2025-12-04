'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaQuestionCircle,
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
  FaCreditCard,
  FaCar,
  FaUser,
  FaExchangeAlt,
  FaHeadset,
  FaBook,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const helpCategories = [
  {
    icon: FaCalendarAlt,
    title: 'Booking & Reservations',
    description: 'How to book, modify, or cancel your transfer',
    articles: 12,
    link: '/faq#booking',
  },
  {
    icon: FaCreditCard,
    title: 'Payments & Pricing',
    description: 'Payment methods, pricing, and refunds',
    articles: 8,
    link: '/faq#payments',
  },
  {
    icon: FaCar,
    title: 'Vehicles & Services',
    description: 'Vehicle types, meet & greet, luggage policies',
    articles: 10,
    link: '/faq#vehicles',
  },
  {
    icon: FaUser,
    title: 'Account & Profile',
    description: 'Managing your account and preferences',
    articles: 6,
    link: '/faq#account',
  },
  {
    icon: FaExchangeAlt,
    title: 'Changes & Cancellations',
    description: 'How to modify or cancel bookings',
    articles: 7,
    link: '/faq#changes',
  },
  {
    icon: FaHeadset,
    title: 'Support & Contact',
    description: 'Get in touch with our support team',
    articles: 5,
    link: '/contact',
  },
];

const popularArticles = [
  { title: 'How do I book an airport transfer?', category: 'Booking' },
  { title: 'What is your cancellation policy?', category: 'Changes' },
  { title: 'How do I track my driver?', category: 'Services' },
  { title: 'What payment methods do you accept?', category: 'Payments' },
  { title: 'Can I modify my booking?', category: 'Changes' },
  { title: 'How does meet & greet work?', category: 'Services' },
];

export default function HelpCenterPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
              <Link href="/help" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Help Center</Link>
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
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20 -translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaQuestionCircle className="text-teal-400" />
              <span className="text-teal-200">Help Center</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How Can We <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Help?</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Find answers to common questions or get in touch with our support team.
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-teal-500/30 shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find help articles organized by topic</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, idx) => (
              <Link
                key={idx}
                href={category.link}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-teal-500 group-hover:to-cyan-500 transition-all">
                  <category.icon className="text-2xl text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{category.articles} articles</span>
                  <FaArrowRight className="text-teal-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Articles</h2>
            <p className="text-gray-600">Quick answers to frequently asked questions</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {popularArticles.map((article, idx) => (
                <Link
                  key={idx}
                  href="/faq"
                  className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-teal-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <FaBook className="text-teal-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{article.title}</h3>
                      <span className="text-sm text-gray-500">{article.category}</span>
                    </div>
                  </div>
                  <FaArrowRight className="text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FaHeadset className="text-4xl text-teal-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Our support team is available 24/7 to assist you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-600 font-bold rounded-full hover:bg-gray-100 transition-all">
              <FaEnvelope /> Contact Us
            </Link>
            <a href="tel:+15551234567" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 transition-all">
              <FaPhone /> Call Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Image src="/logo/logo_atp.jpg" alt="Airport Transfer Portal" width={180} height={54} className="h-12 w-auto rounded-lg mb-6" />
              <p className="text-gray-400 mb-6">Book reliable airport transfers worldwide from verified local suppliers.</p>
              <div className="flex gap-3">
                {[
                  { Icon: FaFacebookF, href: 'https://facebook.com' },
                  { Icon: FaTwitter, href: 'https://twitter.com' },
                  { Icon: FaInstagram, href: 'https://instagram.com' },
                  { Icon: FaLinkedinIn, href: 'https://linkedin.com' },
                ].map(({ Icon, href }, idx) => (
                  <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all">
                    <Icon />
                  </a>
                ))}
              </div>
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
                <li className="flex items-center gap-3 text-gray-400"><FaPhone className="text-teal-400" /><span>+1 (555) 123-4567</span></li>
                <li className="flex items-center gap-3 text-gray-400"><FaEnvelope className="text-teal-400" /><span>support@airporttransfer.com</span></li>
              </ul>
              <Link href="/become-partner" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold mt-6">
                Become a Partner <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Airport Transfer Portal. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-500 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/cookies" className="text-gray-500 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
