// src/components/ShipmentJourney.jsx
import { useEffect, useRef, useState } from 'react';
import { Package, ClipboardCheck, Truck, ShieldCheck, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const stages = [
  {
    id: 'pickup',
    label: 'Pickup',
    description: 'We collect your cargo from your doorstep',
    icon: Package,
    status: 'completed',
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'We sort, pack, and prepare for transit',
    icon: ClipboardCheck,
    status: 'completed',
  },
  {
    id: 'in-transit',
    label: 'In Transit',
    description: 'Your shipment moves via our global network',
    icon: Truck,
    status: 'active',
  },
  {
    id: 'customs',
    label: 'Customs Clearance',
    description: 'We handle all customs documentation smoothly',
    icon: ShieldCheck,
    status: 'upcoming',
  },
  {
    id: 'out-for-delivery',
    label: 'Final Mile',
    description: 'Your cargo is on its last leg to you',
    icon: MapPin,
    status: 'upcoming',
  },
  {
    id: 'delivered',
    label: 'Delivered',
    description: 'Safely arrived – track every step along the way',
    icon: CheckCircle,
    status: 'upcoming',
  },
];

function ShipmentJourney() {
  const sectionRef = useRef(null);
  const [activeStage, setActiveStage] = useState(2); // "In Transit" is active

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

    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          iconBg: 'bg-[#10B981]',
          iconText: 'text-white',
          lineBg: 'bg-[#10B981]',
          textColor: 'text-[#1A1A2E]',
          labelColor: 'text-[#10B981]',
          border: 'border-[#10B981]/30',
        };
      case 'active':
        return {
          iconBg: 'bg-[#2B0071]',
          iconText: 'text-white',
          lineBg: 'bg-[#2B0071]',
          textColor: 'text-[#1A1A2E]',
          labelColor: 'text-[#2B0071]',
          border: 'border-[#2B0071]/30',
        };
      case 'upcoming':
        return {
          iconBg: 'bg-[#E2E5F0]',
          iconText: 'text-gray-400',
          lineBg: 'bg-[#E2E5F0]',
          textColor: 'text-gray-400',
          labelColor: 'text-gray-400',
          border: 'border-transparent',
        };
      default:
        return {
          iconBg: 'bg-[#E2E5F0]',
          iconText: 'text-gray-400',
          lineBg: 'bg-[#E2E5F0]',
          textColor: 'text-gray-400',
          labelColor: 'text-gray-400',
          border: 'border-transparent',
        };
    }
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white" aria-labelledby="journey-heading">
      <div className="container-custom">
        {/* Header – now emphasising our shipping service */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <span className="label-sm text-[#FF5500] font-semibold block mb-2 reveal">Shipping Process</span>
          <h2 id="journey-heading" className="heading-section text-[#1A1A2E] reveal delay-100">
            We handle every step, <span className="text-[#2B0071]">so you don't have to.</span>
          </h2>
          <p className="body-text mt-4 reveal delay-200 text-gray-600">
            From pickup to delivery, your cargo is in safe hands. And you can 
            <strong className="text-[#2B0071]"> track it in real time</strong> whenever you like.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Horizontal timeline (desktop) */}
          <div className="hidden md:block relative pt-8 pb-4">
            {/* Connector line */}
            <div className="absolute top-[52px] left-[20px] right-[20px] h-0.5 bg-[#E2E5F0]">
              <div
                className="h-full bg-[#2B0071] transition-all duration-1000"
                style={{ width: `${(activeStage / (stages.length - 1)) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-6 gap-2 relative">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const styles = getStatusStyles(stage.status);
                const isActive = stage.status === 'active';
                const isCompleted = stage.status === 'completed';

                return (
                  <div key={stage.id} className="flex flex-col items-center text-center reveal" style={{ transitionDelay: `${index * 80 + 100}ms` }}>
                    {/* Icon */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                        ${styles.iconBg} ${styles.iconText}
                        ${isActive ? 'ring-4 ring-[#2B0071]/20 shadow-lg shadow-[#2B0071]/10' : ''}
                        ${isCompleted ? 'ring-2 ring-[#10B981]/20' : ''}
                        relative z-10
                      `}
                    >
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    {/* Label */}
                    <p className={`text-sm font-bold mt-3 ${styles.textColor} transition-colors duration-300`}>
                      {stage.label}
                    </p>
                    <p className={`text-xs ${styles.labelColor} mt-0.5 max-w-[80px]`}>
                      {stage.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical timeline (mobile) */}
          <div className="md:hidden space-y-0">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const styles = getStatusStyles(stage.status);
              const isActive = stage.status === 'active';
              const isCompleted = stage.status === 'completed';
              const isLast = index === stages.length - 1;

              return (
                <div
                  key={stage.id}
                  className="flex gap-4 reveal"
                  style={{ transitionDelay: `${index * 80 + 100}ms` }}
                >
                  {/* Left: Icon + line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500
                        ${styles.iconBg} ${styles.iconText}
                        ${isActive ? 'ring-4 ring-[#2B0071]/20 shadow-lg shadow-[#2B0071]/10' : ''}
                        ${isCompleted ? 'ring-2 ring-[#10B981]/20' : ''}
                        relative z-10
                      `}
                    >
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-[28px] transition-colors duration-500 ${
                          isCompleted || isActive ? 'bg-[#2B0071]' : 'bg-[#E2E5F0]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Right: Content */}
                  <div className="pt-1 pb-5">
                    <p className={`text-base font-bold ${styles.textColor} transition-colors duration-300`}>
                      {stage.label}
                    </p>
                    <p className={`text-sm ${styles.labelColor} mt-0.5`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom: Status legend + shipping CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 reveal">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B0071] ring-2 ring-[#2B0071]/20" />
                In Progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E5F0]" />
                Upcoming
              </span>
            </div>
            <Link
              to="/ship"
              className="btn-primary inline-flex items-center gap-2 group shrink-0"
            >
              Ship your cargo now
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShipmentJourney;