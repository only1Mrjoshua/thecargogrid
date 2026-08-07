// src/components/Stats.jsx
import { useEffect, useRef, useState } from 'react';
import { Package, Clock, Globe2, ShieldCheck } from 'lucide-react';

const stats = [
  {
    label: 'Shipments Delivered',
    value: '100K',
    icon: Package,
    suffix: '+',
  },
  {
    label: 'On-Time Delivery',
    value: '98',
    icon: Clock,
    suffix: '%',
  },
  {
    label: 'Shipment Visibility',
    value: '24/7',
    icon: Globe2,
    suffix: '',
  },
  {
    label: 'Delivery Destinations',
    value: '150',
    icon: ShieldCheck,
    suffix: '+',
  },
];

function Stats() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-10 sm:py-14 md:py-16 bg-white border-y border-[#E2E5F0]"
      aria-label="Company statistics"
    >
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const delay = index * 100;

            return (
              <div
                key={stat.label}
                className={`text-center transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${delay}ms` }}
              >
                <div className="flex justify-center mb-2">
                  <div className="p-2.5 rounded-xl bg-[#2B0071]/5 text-[#2B0071]">
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1A1A2E] tracking-tight">
                  {stat.value}
                  {stat.suffix}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide uppercase mt-0.5">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Stats;