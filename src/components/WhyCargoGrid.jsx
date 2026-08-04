// src/components/WhyCargoGrid.jsx
import { useEffect, useRef } from 'react';
import { CheckCircle2, Eye, Bell, FileText, CreditCard } from 'lucide-react';

const features = [
  {
    title: 'Real-Time Visibility',
    description: 'Know where your shipment is and what happens next.',
    icon: Eye,
  },
  {
    title: 'Proactive Notifications',
    description: 'Receive important updates when shipment conditions change.',
    icon: Bell,
  },
  {
    title: 'Secure Documentation',
    description: 'Access shipment and customs documents in one place.',
    icon: FileText,
  },
  {
    title: 'Transparent Payments',
    description: 'View and securely settle applicable shipment fees.',
    icon: CreditCard,
  },
];

function WhyCargoGrid() {
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
    <section ref={sectionRef} className="section-padding bg-[#F8F9FD]" aria-labelledby="why-heading">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left: Image */}
          <div className="reveal order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#2B0071]/8">
              <img
                src="/warehouse.jpg"
                alt="The Cargo Grid warehouse and logistics facility"
                className="w-full h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px] xl:h-[480px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#2B0071]/5 via-transparent to-transparent pointer-events-none" />

              {/* Floating trust badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 sm:bottom-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/40 max-w-[200px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1A2E]">99.8%</p>
                    <p className="text-[10px] text-gray-500 font-medium">Satisfaction rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="reveal">
              <span className="label-sm text-[#FF5500] font-semibold block mb-2">Why The Cargo Grid</span>
              <h2 id="why-heading" className="heading-section text-[#1A1A2E]">
                More visibility. <br />
                <span className="text-[#2B0071]">Less uncertainty.</span>
              </h2>
            </div>

            <p className="body-text reveal delay-100">
              You shouldn't have to wonder where your shipment is. The Cargo Grid gives you
              complete visibility and control over your packages from pickup to delivery.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="reveal flex items-start gap-4"
                    style={{ transitionDelay: `${index * 80 + 200}ms` }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#2B0071]/5 text-[#2B0071] flex items-center justify-center mt-0.5">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1A1A2E]">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyCargoGrid;