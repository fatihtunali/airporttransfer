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
  FaChevronDown,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const faqCategories = [
  {
    id: 'booking',
    title: 'Booking & Reservations',
    faqs: [
      {
        question: 'How do I book an airport transfer?',
        answer: 'Booking is simple! Enter your pickup and drop-off locations, select your date and time, choose a vehicle type, and complete your payment. You will receive instant confirmation via email.'
      },
      {
        question: 'How far in advance should I book?',
        answer: 'We recommend booking at least 24-48 hours in advance to ensure availability. However, we do accept same-day bookings subject to availability.'
      },
      {
        question: 'Can I book for someone else?',
        answer: 'Yes, you can book for another passenger. Just enter their details in the passenger information section during checkout.'
      },
      {
        question: 'Will I receive a booking confirmation?',
        answer: 'Yes, you will receive an instant email confirmation with all booking details including your driver contact information and pickup instructions.'
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Pricing',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for corporate accounts.'
      },
      {
        question: 'Is the price I see the final price?',
        answer: 'Yes, the price quoted includes all standard fees. Any additional costs (tolls, parking) are clearly indicated before you book.'
      },
      {
        question: 'When is payment taken?',
        answer: 'Payment is processed immediately upon booking to secure your transfer. Some routes offer pay-later options.'
      },
      {
        question: 'Can I get a receipt for business expenses?',
        answer: 'Yes, a VAT receipt is automatically sent to your email after your transfer is completed. You can also download it from your account.'
      },
    ],
  },
  {
    id: 'vehicles',
    title: 'Vehicles & Services',
    faqs: [
      {
        question: 'What types of vehicles are available?',
        answer: 'We offer a range of vehicles including sedans (1-3 passengers), minivans (4-6 passengers), minibuses (7-16 passengers), and luxury vehicles for VIP transfers.'
      },
      {
        question: 'How much luggage can I bring?',
        answer: 'Standard transfers include 1 large suitcase and 1 carry-on per passenger. If you have extra luggage, please indicate this when booking.'
      },
      {
        question: 'Do you provide child seats?',
        answer: 'Yes, child seats and booster seats are available upon request. Please specify the age and weight of children when booking.'
      },
      {
        question: 'What is meet & greet service?',
        answer: 'Your driver will meet you in the arrivals hall with a name sign after you clear customs. They will assist with your luggage and escort you to the vehicle.'
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes & Cancellations',
    faqs: [
      {
        question: 'Can I modify my booking?',
        answer: 'Yes, you can modify your booking up to 24 hours before pickup at no extra charge. Changes within 24 hours may incur a fee.'
      },
      {
        question: 'What is your cancellation policy?',
        answer: 'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours are charged 50%. No-shows are charged 100%.'
      },
      {
        question: 'What if my flight is delayed?',
        answer: 'We track your flight automatically. If delayed, your driver will wait at no extra charge. For significant delays, we will reschedule your pickup.'
      },
      {
        question: 'How do I cancel my booking?',
        answer: 'You can cancel via the link in your confirmation email, through your account dashboard, or by contacting our support team.'
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Profile',
    faqs: [
      {
        question: 'Do I need an account to book?',
        answer: 'No, you can book as a guest. However, creating an account lets you manage bookings, save preferences, and access faster checkout.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page. We will send a reset link to your registered email address.'
      },
      {
        question: 'Can I save my frequent routes?',
        answer: 'Yes, registered users can save favorite routes and passenger details for faster booking in the future.'
      },
    ],
  },
];

export default function FAQPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('booking');
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleQuestion = (question: string) => {
    const newOpen = new Set(openQuestions);
    if (newOpen.has(question)) {
      newOpen.delete(question);
    } else {
      newOpen.add(question);
    }
    setOpenQuestions(newOpen);
  };

  const currentCategory = faqCategories.find(c => c.id === activeCategory) || faqCategories[0];

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
              <Link href="/faq" className={`px-4 py-2 rounded-full font-medium transition-all ${isScrolled ? 'bg-teal-50 text-teal-600' : 'bg-white/10 text-white'}`}>FAQs</Link>
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
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 px-4 py-2 rounded-full border border-teal-400/30 mb-6">
              <FaQuestionCircle className="text-teal-400" />
              <span className="text-teal-200">Frequently Asked Questions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">FAQs</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find quick answers to common questions about our airport transfer services.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-4 shadow-lg sticky top-28">
                <h3 className="font-bold text-gray-900 mb-4 px-2">Categories</h3>
                <nav className="space-y-1">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                        activeCategory === category.id
                          ? 'bg-teal-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentCategory.title}</h2>
                <div className="space-y-4">
                  {currentCategory.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0">
                      <button
                        onClick={() => toggleQuestion(faq.question)}
                        className="w-full flex items-center justify-between py-5 text-left group"
                      >
                        <span className="font-semibold text-gray-900 pr-8 group-hover:text-teal-600 transition-colors">
                          {faq.question}
                        </span>
                        <FaChevronDown
                          className={`text-gray-400 flex-shrink-0 transition-transform ${
                            openQuestions.has(faq.question) ? 'rotate-180 text-teal-500' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          openQuestions.has(faq.question) ? 'max-h-96 pb-5' : 'max-h-0'
                        }`}
                      >
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:shadow-lg transition-all">
              Contact Support <FaArrowRight />
            </Link>
            <Link href="/help" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all">
              Browse Help Center
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
