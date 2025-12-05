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
  FaFileContract,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function TermsPage() {
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
              <Link href="/help" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Help Center</Link>
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
      <section className="relative pt-32 pb-12 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaFileContract className="text-teal-400" />
              <span className="text-teal-200">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-gray-300">Last updated: December 2024</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-6">
              Welcome to Airport Transfer Portal. These Terms of Service govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Services Description</h2>
            <p className="text-gray-600 mb-6">
              Airport Transfer Portal is an online marketplace connecting travelers with local transfer service providers. We facilitate bookings but do not directly provide transportation services. All transfers are performed by independent, verified suppliers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Payment</h2>
            <p className="text-gray-600 mb-4">When making a booking through our platform:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>You must provide accurate and complete information</li>
              <li>Payment is required at the time of booking unless otherwise specified</li>
              <li>Prices are displayed in the selected currency and include all applicable fees</li>
              <li>You will receive a confirmation email with your booking details</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
            <p className="text-gray-600 mb-4">Our standard cancellation policy is as follows:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Free cancellation up to 24 hours before the scheduled pickup time</li>
              <li>50% charge for cancellations within 24 hours of pickup</li>
              <li>No refund for no-shows or cancellations after pickup time</li>
              <li>Flight delays are monitored; your driver will wait accordingly</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-600 mb-4">As a user of our service, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>Provide accurate flight and contact information</li>
              <li>Be ready at the designated pickup location and time</li>
              <li>Treat drivers and vehicles with respect</li>
              <li>Comply with local laws and regulations</li>
              <li>Not transport illegal items or substances</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Liability Limitations</h2>
            <p className="text-gray-600 mb-6">
              Airport Transfer Portal acts as an intermediary between travelers and transfer providers. While we verify our suppliers, we are not liable for the direct actions of drivers or for circumstances beyond our control, including but not limited to traffic delays, weather conditions, or vehicle breakdowns.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy</h2>
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. Please refer to our <Link href="/privacy" className="text-teal-600 hover:text-teal-700">Privacy Policy</Link> for information on how we collect, use, and protect your personal data.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of the service constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us at <a href="mailto:legal@airporttransferportal.com" className="text-teal-600 hover:text-teal-700">legal@airporttransferportal.com</a> or visit our <Link href="/contact" className="text-teal-600 hover:text-teal-700">Contact page</Link>.
            </p>
          </div>
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
