import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe2, ShieldCheck, Truck, Clock, Users, Award,
  TrendingUp, Lock, FileCheck, CheckCircle, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function AboutPage() {
  const navigate = useNavigate();

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        {/* Hero Section */}
        <section className="relative bg-[#2B0071] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FF5500]/20 to-transparent" />
          </div>
          <div className="container-custom py-16 md:py-24 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-[#FF5500] text-sm font-semibold uppercase tracking-wider mb-4 reveal">
                <Globe2 size={18} />
                About The Cargo Grid
              </span>
              <h1 className="heading-hero text-white reveal delay-100">
                Connecting the world,<br />
                <span className="text-[#FF5500]">one shipment at a time.</span>
              </h1>
              <p className="text-lg text-white/80 mt-4 max-w-xl reveal delay-200">
                We are a modern logistics company that combines technology, reliability,
                and a customer-first approach to make international shipping transparent
                and stress-free.
              </p>
              <button
                onClick={() => navigate('/track')}
                className="mt-6 inline-flex items-center gap-2 btn-primary text-white bg-[#FF5500] hover:bg-[#e64a00] text-sm px-6 py-3 reveal delay-300"
              >
                Track Your Shipment
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="reveal">
                <div className="w-12 h-12 rounded-xl bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] mb-4">
                  <Award size={24} />
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To empower businesses and individuals with seamless, transparent, and
                  reliable logistics solutions that simplify the complexity of global shipping.
                </p>
              </div>
              <div className="reveal delay-100">
                <div className="w-12 h-12 rounded-xl bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] mb-4">
                  <TrendingUp size={24} />
                </div>
                <h2 className="text-2xl font-bold text-[#1A1A2E] mb-3">Our Vision</h2>
                <p className="text-gray-600 leading-relaxed">
                  To become the most trusted logistics partner by combining cutting-edge
                  tracking technology with a human-centric approach to customer service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="section-padding bg-[#F8F9FD]">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="label-sm text-[#FF5500] font-semibold block reveal">Our Capabilities</span>
              <h2 className="heading-section text-[#1A1A2E] reveal delay-100">
                Built for <span className="text-[#2B0071]">reliability</span> and <span className="text-[#2B0071]">speed</span>
              </h2>
              <p className="body-text mt-3 reveal delay-200">
                We operate a robust logistics network that connects major hubs across the UK
                and the world, ensuring your packages move efficiently.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Globe2, label: 'Global Network', desc: 'Shipping to 150+ destinations' },
                { icon: Truck, label: 'Fleet Management', desc: 'Modern, reliable vehicles' },
                { icon: Clock, label: 'Express Options', desc: 'Same-day & next-day delivery' },
                { icon: ShieldCheck, label: 'Secure Handling', desc: 'End-to-end package protection' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 text-center hover:-translate-y-1 transition-all duration-300 reveal"
                  style={{ transitionDelay: `${idx * 100 + 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] mx-auto mb-3">
                    <item.icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className="font-bold text-[#1A1A2E]">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security & Reliability */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <span className="label-sm text-[#FF5500] font-semibold block reveal">Security & Reliability</span>
                <h2 className="heading-section text-[#1A1A2E] reveal delay-100">
                  Your shipment is <span className="text-[#2B0071]">in safe hands.</span>
                </h2>
                <p className="body-text mt-3 reveal delay-200">
                  We prioritise the security and integrity of every package. From advanced
                  tracking to secure documentation handling, we ensure complete transparency.
                </p>
                <ul className="space-y-3 mt-6">
                  {[
                    { icon: Lock, text: 'End‑to‑end encrypted tracking data' },
                    { icon: FileCheck, text: 'Verified shipment documentation' },
                    { icon: CheckCircle, text: 'Proactive notifications and updates' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-700 reveal" style={{ transitionDelay: `${idx * 100 + 200}ms` }}>
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] flex-shrink-0">
                        <CheckCircle size={14} />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2 reveal">
                <div className="bg-[#2B0071]/5 rounded-2xl p-8 border border-[#E2E5F0]">
                  <img
                    src="/warehouse.jpg"
                    alt="The Cargo Grid secure logistics facility"
                    className="w-full h-[280px] object-cover rounded-xl shadow-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Commitment */}
        <section className="section-padding bg-[#2B0071] text-white">
          <div className="container-custom text-center">
            <div className="max-w-3xl mx-auto">
              <Users size={40} className="text-[#FF5500] mx-auto mb-4" />
              <span className="label-sm text-[#FF5500] font-semibold block">Our Commitment</span>
              <h2 className="heading-section text-white reveal">Customer first, always.</h2>
              <p className="text-lg text-white/80 mt-3 reveal delay-100">
                We believe that logistics is about more than moving packages. It’s about building
                trust, providing clarity, and delivering peace of mind. Every interaction matters.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 reveal delay-200">
                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-[#FF5500]">24/7</div>
                  <p className="text-sm text-white/70">Real‑time visibility</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-[#FF5500]">98%</div>
                  <p className="text-sm text-white/70">On‑time delivery rate</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-[#FF5500]">150+</div>
                  <p className="text-sm text-white/70">Destinations worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-white">
          <div className="container-custom text-center">
            <h2 className="heading-section text-[#1A1A2E] reveal">Ready to track your shipment?</h2>
            <p className="body-text max-w-xl mx-auto mt-3 reveal delay-100">
              Experience the transparency and reliability of The Cargo Grid. Start tracking now.
            </p>
            <button
              onClick={() => navigate('/track')}
              className="mt-6 btn-primary reveal delay-200"
            >
              Track Your Package
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default AboutPage;