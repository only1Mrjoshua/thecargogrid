import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, FileText, Cookie, Database, Users, CreditCard, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PrivacyPolicyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Back
          </button>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-[#2B0071]/10 flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-[#2B0071]" />
              </div>
              <h1 className="heading-section text-[#1A1A2E]">Privacy Policy</h1>
              <p className="text-gray-500 mt-2">
                Last updated: August 2026
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto mt-4">
                The Cargo Grid is committed to protecting your privacy and handling your personal
                data with transparency and care.
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 space-y-8">
              {/* 1. Data Collection */}
              <section>
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Database size={20} className="text-[#2B0071]" />
                  Data Collection
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We collect information that you voluntarily provide to us when you use our services,
                  create an account, track a shipment, or contact our support team. This may include
                  your name, email address, phone number, postal address, and shipment details.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  We also collect data automatically through your use of our website, such as IP
                  address, browser type, device information, and interaction patterns to improve
                  your experience.
                </p>
              </section>

              {/* 2. Customer Information */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Users size={20} className="text-[#2B0071]" />
                  Customer Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We store customer information such as your name, contact details, and shipping
                  preferences to manage your shipments and provide personalised support. This data
                  is used exclusively for service delivery, communication, and improving our
                  logistics operations.
                </p>
              </section>

              {/* 3. Tracking Information */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-[#2B0071]" />
                  Tracking Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  When you track a shipment, we record the tracking number and the associated
                  shipment status history. This information is necessary to provide you with
                  real‑time updates and to ensure the security and integrity of the delivery process.
                </p>
              </section>

              {/* 4. Payment Information */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <CreditCard size={20} className="text-[#2B0071]" />
                  Payment Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  When you make a payment for customs fees or shipping charges, we collect payment
                  details such as card type, last four digits, and billing address. All payment
                  transactions are processed through secure, PCI‑compliant gateways. We do not store
                  full card numbers on our servers.
                </p>
              </section>

              {/* 5. Cookies */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Cookie size={20} className="text-[#2B0071]" />
                  Cookies
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies to enhance your browsing experience, analyse site traffic, and
                  remember your preferences. You can control cookie settings in your browser. Some
                  cookies are essential for the website to function properly, while others help us
                  improve performance and tailor content.
                </p>
              </section>

              {/* 6. Data Protection */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Lock size={20} className="text-[#2B0071]" />
                  Data Protection
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement industry‑standard security measures to protect your personal data
                  against unauthorised access, alteration, disclosure, or destruction. All data
                  transmitted between your device and our servers is encrypted using TLS protocols.
                  We regularly review our security practices to maintain the highest level of
                  protection.
                </p>
              </section>

              {/* 7. Third-Party Services */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Database size={20} className="text-[#2B0071]" />
                  Third‑Party Services
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may share limited data with trusted third‑party service providers to facilitate
                  shipping, payment processing, analytics, and customer support. These partners are
                  contractually obligated to protect your data and use it only for the purposes
                  specified by us. We do not sell or rent your personal information to third parties.
                </p>
              </section>

              {/* 8. Your Rights */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-[#2B0071]" />
                  Your Rights
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You have the right to access, correct, or delete your personal data at any time.
                  You may also request a copy of the data we hold about you. To exercise these rights,
                  please contact us at <a href="mailto:privacy@thecargogrid.com" className="text-[#FF5500] hover:underline">privacy@thecargogrid.com</a>.
                </p>
              </section>

              {/* Contact */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <p className="text-sm text-gray-500">
                  If you have any questions about our Privacy Policy, please contact our Data
                  Protection Officer at <a href="mailto:dpo@thecargogrid.com" className="text-[#FF5500] hover:underline">dpo@thecargogrid.com</a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPolicyPage;