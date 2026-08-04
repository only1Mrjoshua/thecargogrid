// src/components/Services.jsx
import { useEffect, useRef } from 'react';
import { Globe2, Zap, ShieldCheck, MapPin, Package, Truck } from 'lucide-react';
import ServiceCard from './ServiceCard';

const services = [
  {
    title: 'International Shipping',
    description: 'Reliable cross-border package transportation with customs support.',
    icon: Globe2,
  },
  {
    title: 'Express Delivery',
    description: 'Fast delivery options for time-sensitive shipments.',
    icon: Zap,
  },
  {
    title: 'Customs Clearance',
    description: 'Expert support through customs and shipment processing.',
    icon: ShieldCheck,
  },
  {
    title: 'Real-Time Tracking',
    description: 'Stay informed from origin to final destination.',
    icon: MapPin,
  },
  {
    title: 'Package Handling',
    description: 'Secure processing and careful package management.',
    icon: Package,
  },
  {
    title: 'Door-to-Door Delivery',
    description: 'Convenient delivery from dispatch to destination.',
    icon: Truck,
  },
];

function Services() {
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
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white" aria-labelledby="services-heading">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
          <span className="label-sm text-[#FF5500] font-semibold block mb-2 reveal">Our Services</span>
          <h2 id="services-heading" className="heading-section text-[#1A1A2E] reveal delay-100">
            Logistics built <span className="text-[#2B0071]">around your needs.</span>
          </h2>
          <p className="body-text mt-4 reveal delay-200">
            From everyday deliveries to international shipments, we provide reliable logistics
            services designed to keep your packages moving.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
              delay={index * 80 + 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;