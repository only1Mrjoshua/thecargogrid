// src/components/SecuritySection.jsx
import { useEffect, useRef } from 'react';
import { Shield, FileCheck, Eye, Lock, CheckCircle } from 'lucide-react';

const features = [
  {
    title: 'Secure Payments',
    description: 'Protected payment processing for all shipment fees.',
    icon: Lock,
  },
  {
    title: 'Verified Documents',
    description: 'Access official shipment documentation when required.',
    icon: FileCheck,
  },
  {
    title: 'Transparent Tracking',
    description: 'Clear shipment milestones from origin to destination.',
    icon: Eye,
  },
];

function SecuritySection() {
  const sectionRef = useRef(null);

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

    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-[#2B0071] text-white"
      aria-labelledby="security-heading"
    >
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-white/80 tracking-wider uppercase mb-6 reveal">
            <Shield size={14} className="text-[#FF5500]" />
            Security & Trust
          </div>

          <h2 id="security-heading" className="heading-section reveal delay-100">
            Your shipment information <br className="hidden sm:block" />
            <span className="text-[#FF5500]">stays protected.</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mt-4 reveal delay-200">
            From tracking updates to payment confirmations and shipment documentation,
            The Cargo Grid is designed around secure and transparent logistics management.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="reveal bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-7 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FF5500]/20 flex items-center justify-center text-[#FF5500] mx-auto mb-4">
                    <Icon size={24} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Trust indicator */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60 reveal">
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#10B981]" />
              SOC 2 Compliant
            </span>
            <span className="w-px h-4 bg-white/10 hidden sm:block" />
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#10B981]" />
              End-to-end encryption
            </span>
            <span className="w-px h-4 bg-white/10 hidden sm:block" />
            <span className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#10B981]" />
              Data protection
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SecuritySection;