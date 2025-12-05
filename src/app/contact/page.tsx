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
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
  FaComments,
  FaPaperPlane,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function ContactPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    bookingRef: '',
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
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', bookingRef: '', message: '' });
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
              <Link href="/contact" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>Contact</Link>
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
              <FaComments className="text-teal-400" />
              <span className="text-teal-200">Get In Touch</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contact <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We&apos;re here to help. Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FaPhone, title: 'Call Us', value: '+90 216 557 52 52', subtitle: 'Available 24/7', color: 'teal', href: 'tel:+902165575252' },
              { icon: FaEnvelope, title: 'Email Us', value: 'support@airporttransferportal.com', subtitle: 'Response within 2 hours', color: 'cyan', href: 'mailto:support@airporttransferportal.com' },
              { icon: FaWhatsapp, title: 'WhatsApp', value: '+90 532 585 87 86', subtitle: 'Chat with us instantly', color: 'emerald', href: 'https://wa.me/905325858786?text=Hello!%20I%20would%20like%20to%20inquire%20about%20airport%20transfer%20services.' },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl hover:bg-teal-50 transition-colors group"
              >
                <div className={`w-14 h-14 bg-${item.color}-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-${item.color}-500 transition-colors`}>
                  <item.icon className={`text-2xl text-${item.color}-600 group-hover:text-white transition-colors`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <p className="text-teal-600 font-medium">{item.value}</p>
                  <p className="text-sm text-gray-500">{item.subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">Fill out the form below and we&apos;ll get back to you shortly.</p>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                  Thank you! Your message has been sent successfully. We&apos;ll respond within 2 hours.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                    >
                      <option value="">Select a topic</option>
                      <option value="booking">Booking Question</option>
                      <option value="modification">Modify Booking</option>
                      <option value="cancellation">Cancel Booking</option>
                      <option value="complaint">Complaint</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Reference</label>
                    <input
                      type="text"
                      value={formData.bookingRef}
                      onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="ATP-XXXXXX (optional)"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-teal-500 transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                >
                  Send Message <FaPaperPlane />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Our Office</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Address</h4>
                      <p className="text-gray-600">Mehmet Akif Ersoy Mah Hanimeli Sok NO 5/B<br />Uskudar - Istanbul</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaClock className="text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Hours</h4>
                      <p className="text-gray-600">Support: 24/7 Available<br />Office: Mon-Fri 9am-6pm GMT</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Urgent Assistance?</h3>
                <p className="text-white/90 mb-6">
                  If you have an imminent transfer and need immediate help, please call our 24/7 emergency line.
                </p>
                <a href="tel:+902165575252" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-bold rounded-xl hover:bg-gray-100 transition-all">
                  <FaPhone /> Call Now: +90 216 557 52 52
                </a>
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
