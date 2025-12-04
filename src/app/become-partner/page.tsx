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
  FaHandshake,
  FaGlobe,
  FaChartLine,
  FaHeadset,
  FaCreditCard,
  FaShieldAlt,
  FaCheckCircle,
  FaCar,
  FaUsers,
  FaStar,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const benefits = [
  {
    icon: FaGlobe,
    title: 'Global Exposure',
    description: 'Access customers from around the world looking for airport transfers in your area.',
  },
  {
    icon: FaChartLine,
    title: 'Grow Your Business',
    description: 'Increase your bookings with our marketing reach and established customer base.',
  },
  {
    icon: FaCreditCard,
    title: 'Secure Payments',
    description: 'Get paid reliably with our secure payment processing and weekly payouts.',
  },
  {
    icon: FaHeadset,
    title: '24/7 Support',
    description: 'Our dedicated partner support team is always available to assist you.',
  },
  {
    icon: FaShieldAlt,
    title: 'Insurance Coverage',
    description: 'Additional liability protection for all bookings made through our platform.',
  },
  {
    icon: FaUsers,
    title: 'Easy Management',
    description: 'User-friendly dashboard to manage bookings, drivers, and vehicles.',
  },
];

const stats = [
  { value: '500+', label: 'Partner Suppliers' },
  { value: '100+', label: 'Countries Covered' },
  { value: '1M+', label: 'Transfers Completed' },
  { value: '4.9', label: 'Average Rating' },
];

const requirements = [
  'Valid business license and registration',
  'Commercial vehicle insurance',
  'Professional, licensed drivers',
  'Well-maintained vehicles (less than 8 years old)',
  'Smartphone or tablet for driver app',
  'Commitment to quality service',
];

export default function BecomePartnerPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    fleetSize: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
              <Link href="/popular-routes" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>Popular Routes</Link>
              <Link href="/become-partner" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Become a Partner</Link>
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
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaHandshake className="text-teal-400" />
              <span className="text-teal-200">Partner Program</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Become a <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Partner</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Join our network of trusted transfer providers and grow your business with access to global customers.
            </p>
            <a href="#apply" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-full hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transition-all">
              Apply Now <FaArrowRight />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-teal-400">{stat.value}</div>
                <div className="text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner With Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of successful transfer companies already benefiting from our platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-gray-50 rounded-3xl p-8 hover:bg-teal-50 transition-colors group">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:from-teal-500 group-hover:to-cyan-500 transition-all">
                  <benefit.icon className="text-3xl text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Getting started is easy</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Apply', desc: 'Fill out our partner application form' },
              { step: '2', title: 'Verify', desc: 'We review your documents and fleet' },
              { step: '3', title: 'Onboard', desc: 'Set up your account and pricing' },
              { step: '4', title: 'Earn', desc: 'Start receiving bookings and grow' },
            ].map((item, idx) => (
              <div key={idx} className="text-center relative">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-teal-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Partner Requirements</h2>
              <p className="text-gray-300 mb-8">
                We maintain high standards to ensure quality service for our customers. Here&apos;s what we look for in our partners.
              </p>
              <ul className="space-y-4">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-teal-400 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="text-center mb-6">
                <FaCar className="text-5xl text-teal-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold">Ready to Join?</h3>
                <p className="text-gray-300 mt-2">Already have a transfer business? Apply now and start earning.</p>
              </div>
              <a href="#apply" className="block w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-center font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all">
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!submitted ? (
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Partner Application</h2>
                <p className="text-gray-600">Fill out the form below and our team will contact you within 48 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Your Company Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="John Smith"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="London"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="United Kingdom"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fleet Size *</label>
                  <select
                    required
                    value={formData.fleetSize}
                    onChange={(e) => setFormData({ ...formData, fleetSize: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select fleet size</option>
                    <option value="1-5">1-5 vehicles</option>
                    <option value="6-15">6-15 vehicles</option>
                    <option value="16-30">16-30 vehicles</option>
                    <option value="31-50">31-50 vehicles</option>
                    <option value="50+">50+ vehicles</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    placeholder="Tell us about your business, services offered, and why you'd like to partner with us..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                >
                  Submit Application <FaArrowRight />
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="text-4xl text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for your interest in partnering with us. Our team will review your application and contact you within 48 hours.
              </p>
              <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full">
                Return to Home <FaArrowRight />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar key={star} className="text-yellow-400 text-2xl" />
            ))}
          </div>
          <blockquote className="text-2xl text-gray-700 mb-6 leading-relaxed">
            &ldquo;Partnering with Airport Transfer Portal has transformed our business. We&apos;ve increased our bookings by 300% in just one year. The platform is easy to use and the support team is exceptional.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-900">Marco Silva</div>
              <div className="text-gray-500">Premium Transfers, Lisbon</div>
            </div>
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
                {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-all">
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
              <a href="#" className="text-gray-500 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
