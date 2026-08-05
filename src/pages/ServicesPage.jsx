import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2, Truck, Zap, Ship, ShieldCheck, Package,
  MapPin, Route, Warehouse, Award, CheckCircle, ArrowRight,
  Clock, Users, Headphones
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const services = [
  {
    id: 1,
    title: 'International Shipping',
    description: 'Reliable cross-border transportation with customs support and real-time tracking.',
    icon: Globe2,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
  {
    id: 2,
    title: 'Domestic Delivery',
    description: 'Fast and secure delivery across the UK, with next-day and same-day options.',
    icon: Truck,
    color: 'text-[#FF5500]',
    bg: 'bg-[#FF5500]/5',
  },
  {
    id: 3,
    title: 'Express Delivery',
    description: 'Time-sensitive shipments delivered with priority handling and expedited transit.',
    icon: Zap,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
  {
    id: 4,
    title: 'Freight Services',
    description: 'Cost-effective freight solutions for large or heavy cargo, including palletised goods.',
    icon: Ship,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
  {
    id: 5,
    title: 'Customs Clearance',
    description: 'Expert support through customs processes, including documentation and fee management.',
    icon: ShieldCheck,
    color: 'text-[#FF5500]',
    bg: 'bg-[#FF5500]/5',
  },
  {
    id: 6,
    title: 'Package Handling',
    description: 'Secure processing and careful management of parcels to ensure they arrive intact.',
    icon: Package,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
  {
    id: 7,
    title: 'Door-to-Door Delivery',
    description: 'Convenient pickup and drop-off services directly from your location to the recipient.',
    icon: MapPin,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
  {
    id: 8,
    title: 'Shipment Tracking',
    description: 'Real-time visibility with detailed milestones, notifications, and status updates.',
    icon: Route,
    color: 'text-[#FF5500]',
    bg: 'bg-[#FF5500]/5',
  },
  {
    id: 9,
    title: 'Secure Warehousing',
    description: 'Short-term and long-term storage options with full inventory management.',
    icon: Warehouse,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
  {
    id: 10,
    title: 'Insurance Services',
    description: 'Comprehensive coverage options to protect your shipment against loss or damage.',
    icon: Award,
    color: 'text-[#2B0071]',
    bg: 'bg-[#2B0071]/5',
  },
];

function ServicesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        {/* Hero */}
        <section className="bg-[#2B0071] text-white py-16 md:py-20">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block text-[#FF5500] text-sm font-semibold uppercase tracking-wider mb-3 reveal">
                Our Services
              </span>
              <h1 className="heading-hero text-white reveal delay-100">
                Logistics built <span className="text-[#FF5500]">around you.</span>
              </h1>
              <p className="text-lg text-white/80 mt-4 reveal delay-200">
                From everyday deliveries to international freight, we offer a full range of
                logistics services designed to keep your packages moving reliably.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section-padding bg-[#F8F9FD]">
          <div className="container-custom">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="heading-section text-[#1A1A2E] reveal">
                What we <span className="text-[#2B0071]">deliver.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 reveal"
                    style={{ transitionDelay: `${index * 60 + 100}ms` }}
                  >
                    <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center ${service.color} mb-4`}>
                      <Icon size={24} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A2E]">{service.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="reveal">
                <span className="label-sm text-[#FF5500] font-semibold block">Why Choose The Cargo Grid</span>
                <h2 className="heading-section text-[#1A1A2E]">
                  We deliver more than <span className="text-[#2B0071]">packages.</span>
                </h2>
                <p className="body-text mt-3">
                  Our commitment goes beyond moving goods. We provide transparency, reliability,
                  and a customer experience that sets us apart.
                </p>
                <ul className="space-y-3 mt-6">
                  {[
                    { icon: Clock, text: 'Real‑time tracking with proactive updates' },
                    { icon: Users, text: 'Dedicated support team available 24/7' },
                    { icon: ShieldCheck, text: 'Secure handling and insured shipments' },
                    { icon: Award, text: 'Proven track record of on‑time delivery' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] flex-shrink-0">
                        <CheckCircle size={14} />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="reveal delay-100">
                <div className="bg-[#2B0071]/5 rounded-2xl p-6 border border-[#E2E5F0]">
                  <img
                    src="/warehouse.jpg"
                    alt="The Cargo Grid logistics facility"
                    className="w-full h-[300px] object-cover rounded-xl shadow-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-[#2B0071] text-white">
          <div className="container-custom text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="heading-section text-white reveal">
                Ready to ship with <span className="text-[#FF5500]">confidence?</span>
              </h2>
              <p className="text-lg text-white/80 mt-3 reveal delay-100">
                Whether you need international shipping or a local delivery, we’re here to help.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6 reveal delay-200">
                <button
                  onClick={() => navigate('/track')}
                  className="btn-primary bg-[#FF5500] hover:bg-[#e64a00] text-white"
                >
                  Track Your Package
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-outline-light"
                >
                  Contact Our Team
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default ServicesPage;