import { useNavigate } from 'react-router-dom';
import { Package, Truck, Zap, Headphones, ArrowRight } from 'lucide-react';

function ShipSection() {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-[#F8F9FD]" aria-labelledby="ship-heading">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="order-2 lg:order-1">
            <span className="label-sm text-[#FF5500] font-semibold block mb-2 reveal">
              Ship with Confidence
            </span>
            <h2 id="ship-heading" className="heading-section text-[#1A1A2E] reveal delay-100">
              Ship a package in <span className="text-[#2B0071]">minutes.</span>
            </h2>
            <p className="body-text mt-4 reveal delay-200">
              Get a shipping quote, provide your details, and choose your delivery options.
              Our support team will then reach out to confirm your shipment and arrange payment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 reveal delay-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] flex-shrink-0">
                  <Package size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A2E]">Instant Quote</h4>
                  <p className="text-sm text-gray-500">Get a shipping estimate in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] flex-shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A2E]">Fast Booking</h4>
                  <p className="text-sm text-gray-500">Complete your shipment details in minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] flex-shrink-0">
                  <Truck size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A2E]">Multiple Options</h4>
                  <p className="text-sm text-gray-500">Standard, Express & Priority delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] flex-shrink-0">
                  <Headphones size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#1A1A2E]">Support-Led Payment</h4>
                  <p className="text-sm text-gray-500">Our team handles payment confirmation</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/ship')}
              className="mt-6 btn-primary group reveal delay-400"
            >
              Ship a Package
              <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right image */}
          <div className="order-1 lg:order-2 reveal delay-200">
            <div className="bg-[#2B0071]/5 rounded-2xl p-6 border border-[#E2E5F0]">
              <img
                src="/hero2.jpeg"
                alt="The Cargo Grid shipping and logistics facility"
                className="w-full h-[280px] object-cover rounded-xl shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShipSection;