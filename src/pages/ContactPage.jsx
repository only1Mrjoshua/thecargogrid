import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  AlertCircle, MessageCircle, HelpCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    trackingNumber: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', trackingNumber: '', subject: '', message: '' });
    }, 1500);
  };

  const goToFAQ = () => navigate('/faq');
  const goToTrack = () => navigate('/track');

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#10B981]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A2E]">Message Sent!</h2>
            <p className="text-gray-600 mt-2">
              Thank you for contacting us. Our support team will get back to you within 24 hours.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-6 btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form – 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-2">
                  <MessageCircle size={24} className="text-[#2B0071]" />
                  Contact Support
                </h1>
                <p className="text-gray-500 text-sm mb-6">
                  Have a question about your shipment? Fill in the form below and we'll get back to you shortly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all ${
                          errors.name ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'border-[#E2E5F0]'
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-[#EF4444]">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all ${
                          errors.email ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'border-[#E2E5F0]'
                        }`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-[#EF4444]">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="trackingNumber" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      Tracking Number (optional)
                    </label>
                    <input
                      id="trackingNumber"
                      name="trackingNumber"
                      type="text"
                      placeholder="TCG-123456789012"
                      value={formData.trackingNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Brief description of your issue"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all ${
                        errors.subject ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'border-[#E2E5F0]'
                      }`}
                    />
                    {errors.subject && <p className="mt-1 text-xs text-[#EF4444]">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Describe your issue or question in detail..."
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 text-base bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all resize-y ${
                        errors.message ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20' : 'border-[#E2E5F0]'
                      }`}
                    />
                    {errors.message && <p className="mt-1 text-xs text-[#EF4444]">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info – 1/3 width */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-[#2B0071] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1A2E]">Email</p>
                      <a href="mailto:support@thecargogrid.com" className="text-[#FF5500] hover:underline">
                        support@thecargogrid.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-[#2B0071] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1A2E]">Phone</p>
                      <a href="tel:+448005550199" className="text-gray-600 hover:text-[#2B0071] transition-colors">
                        +44 800 555 0199
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#2B0071] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1A2E]">Office Address</p>
                      <p className="text-gray-600">
                        123 Logistics Avenue<br />
                        London, EC1A 1BB<br />
                        United Kingdom
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[#2B0071] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1A1A2E]">Business Hours</p>
                      <p className="text-gray-600">
                        Mon–Fri: 8:00am – 6:00pm<br />
                        Sat: 9:00am – 2:00pm<br />
                        Sun: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                <h4 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-3">
                  Quick Help
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={goToFAQ}
                    className="w-full text-left text-sm text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-2"
                  >
                    <HelpCircle size={16} />
                    Visit our FAQ
                  </button>
                  <button
                    onClick={goToTrack}
                    className="w-full text-left text-sm text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={16} />
                    Track your shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ContactPage;