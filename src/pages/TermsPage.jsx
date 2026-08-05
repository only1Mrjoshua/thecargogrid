import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, Truck, CreditCard, Package, AlertCircle, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function TermsPage() {
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
                <FileText size={32} className="text-[#2B0071]" />
              </div>
              <h1 className="heading-section text-[#1A1A2E]">Terms & Conditions</h1>
              <p className="text-gray-500 mt-2">
                Last updated: August 2026
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto mt-4">
                By using The Cargo Grid services, you agree to the following terms and conditions.
                Please read them carefully.
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 space-y-8">
              {/* 1. Shipping Terms */}
              <section>
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Truck size={20} className="text-[#2B0071]" />
                  Shipping Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  The Cargo Grid provides logistics and shipping services across domestic and
                  international routes. Shipping times are estimated and may vary due to factors
                  beyond our control, such as weather, customs delays, or carrier disruptions.
                  We will make reasonable efforts to meet the estimated delivery dates but do not
                  guarantee them.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  All shipments are subject to the terms of the carrier partner used for the
                  specific route. The customer is responsible for providing accurate shipping
                  addresses and contact information.
                </p>
              </section>

              {/* 2. Payment Terms */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <CreditCard size={20} className="text-[#2B0071]" />
                  Payment Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  All fees for shipping, customs clearance, and related services must be paid in
                  full before the shipment is released or delivered. Payments are processed through
                  secure third‑party gateways. We accept major credit and debit cards. Invoices are
                  issued for each transaction and can be accessed through your account or the
                  shipment details page.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  Failure to pay outstanding fees may result in delayed release or storage charges
                  applied by customs or the carrier.
                </p>
              </section>

              {/* 3. Delivery Conditions */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Package size={20} className="text-[#2B0071]" />
                  Delivery Conditions
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Delivery will be attempted to the address provided by the customer. If delivery
                  cannot be completed due to an incorrect address, the recipient being unavailable,
                  or other reasons, the shipment may be returned to the depot or held for collection.
                  Additional charges may apply for re‑delivery or storage.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  The customer is responsible for ensuring that someone is available to receive the
                  package at the scheduled time. For signature‑required deliveries, the recipient
                  must sign for the package.
                </p>
              </section>

              {/* 4. Customs Responsibilities */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Shield size={20} className="text-[#2B0071]" />
                  Customs Responsibilities
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  For international shipments, the customer is responsible for providing accurate
                  and complete customs documentation, including commercial invoices, packing lists,
                  and any permits or licenses required by the destination country.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  Customs duties, taxes, and fees are the responsibility of the recipient unless
                  otherwise agreed. The Cargo Grid will assist with customs clearance but does not
                  assume liability for delays or additional charges caused by incorrect documentation
                  or regulatory changes.
                </p>
              </section>

              {/* 5. Refunds */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <AlertCircle size={20} className="text-[#2B0071]" />
                  Refunds
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Refunds for shipping fees are available only if the shipment has not been picked
                  up or processed. Once a shipment is in transit, fees are non‑refundable. Customs
                  and clearance fees are non‑refundable once processing has commenced.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  If a shipment is lost or damaged, a claim may be filed according to the insurance
                  or carrier terms. Refunds for such cases will be assessed on a case‑by‑case basis.
                </p>
              </section>

              {/* 6. Liability */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-[#2B0071]" />
                  Liability
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  The Cargo Grid’s liability is limited to the value of the shipment or the amount
                  paid for the service, whichever is lower. We are not liable for indirect, special,
                  or consequential damages, including lost profits or business interruption.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  Our liability for loss or damage is subject to the terms of the carrier or
                  insurance provider. Customers are encouraged to purchase additional insurance
                  for high‑value shipments.
                </p>
              </section>

              {/* 7. User Responsibilities */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2 mb-3">
                  <Users size={20} className="text-[#2B0071]" />
                  User Responsibilities
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to provide accurate and complete information when using our services,
                  including shipment details, contact information, and payment details. You are
                  responsible for maintaining the confidentiality of your account credentials and
                  for all activities that occur under your account.
                </p>
                <p className="text-gray-600 leading-relaxed mt-2">
                  You must not use our services for illegal, hazardous, or prohibited items. You
                  agree to comply with all applicable laws and regulations, including those related
                  to customs, trade sanctions, and data protection.
                </p>
              </section>

              {/* 8. Amendments */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <h2 className="text-xl font-bold text-[#1A1A2E] mb-3">Amendments</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Cargo Grid reserves the right to update these terms at any time. Changes will
                  be posted on this page, and the “last updated” date will be revised. Your continued
                  use of our services constitutes acceptance of the updated terms.
                </p>
              </section>

              {/* Contact */}
              <section className="border-t border-[#E2E5F0] pt-6">
                <p className="text-sm text-gray-500">
                  If you have any questions about these Terms & Conditions, please contact us at
                  <a href="mailto:legal@thecargogrid.com" className="text-[#FF5500] hover:underline ml-1">
                    legal@thecargogrid.com
                  </a>.
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

export default TermsPage;