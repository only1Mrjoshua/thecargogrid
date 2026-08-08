// src/components/HowTrackingWorks.jsx
import { useEffect, useRef } from 'react';
import { Calculator, ClipboardCheck, Ship, MapPin, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Get a Quote',
    description: 'Enter your cargo details – weight, dimensions, origin, and destination – for an instant, transparent rate.',
    icon: Calculator,
  },
  {
    number: '02',
    title: 'Book & Prepare',
    description: 'Choose your service, complete the booking, and prepare your shipment with our easy-to-follow instructions.',
    icon: ClipboardCheck,
  },
  {
    number: '03',
    title: 'Ship & Dispatch',
    description: 'We handle the logistics – from pickup and customs to routing your cargo on the fastest available route.',
    icon: Ship,
  },
  {
    number: '04',
    title: 'Track & Receive',
    description: 'Follow your shipment in real time with live updates, and get notified the moment it arrives safely.',
    icon: MapPin,
  },
];

function HowTrackingWorks() {
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
    <section ref={sectionRef} className="section-padding bg-[#F8F9FD]" aria-labelledby="how-it-works-heading">
      <div className="container-custom">
        {/* Header – now shipping-focused */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18 lg:mb-20">
          <span className="label-sm text-[#FF5500] font-semibold block mb-2 reveal">How It Works</span>
          <h2 id="how-it-works-heading" className="heading-section text-[#1A1A2E] reveal delay-100">
            Ship your cargo <span className="text-[#2B0071]">in four simple steps.</span>
          </h2>
          <p className="body-text mt-4 reveal delay-200">
            From quoting to delivery, we make global shipping seamless. And yes, 
            you can <strong className="text-[#FF5500]">track every stage</strong> along the way.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop connector line (hidden on mobile) */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-[#E2E5F0] -z-10">
            <div className="h-full w-0 bg-[#2B0071] transition-all duration-1000" style={{ width: '100%' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const delay = index * 100 + 200;

              return (
                <div
                  key={step.number}
                  className="reveal relative"
                  style={{ transitionDelay: `${delay}ms` }}
                >
                  <div className="card-premium p-6 sm:p-7 text-center h-full flex flex-col items-center hover:shadow-[0_8px_30px_rgba(43,0,113,0.08)] group">
                    <div className="relative mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#2B0071]/5 flex items-center justify-center text-[#2B0071] group-hover:bg-[#2B0071]/10 transition-colors duration-300">
                        <Icon size={26} strokeWidth={1.6} />
                      </div>
                      <span className="absolute -top-2 -right-2 text-xs font-extrabold text-[#E2E5F0] tracking-tight">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{step.title}</h3>
                    <p className="body-small text-center">{step.description}</p>

                    {index < steps.length - 1 && (
                      <div className="md:hidden w-0.5 h-6 bg-[#E2E5F0] mx-auto mt-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA – primary action is to ship, with tracking as secondary */}
        <div className="text-center mt-12 reveal flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            to="/ship"
            className="btn-primary inline-flex items-center gap-2 group"
          >
            Get a shipping quote now
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/track"
            className="text-sm font-semibold text-[#2B0071] hover:text-[#FF5500] transition-colors duration-300 group inline-flex items-center gap-1"
          >
            Or track your existing shipment
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HowTrackingWorks;