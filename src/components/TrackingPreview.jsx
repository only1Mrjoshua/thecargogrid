// src/components/TrackingPreview.jsx
import { useEffect, useRef } from 'react';
import { MapPin, CheckCircle, Circle, Clock, Truck, Package, ArrowRight } from 'lucide-react';

const timelineItems = [
  { label: 'Order Received', status: 'completed' },
  { label: 'Shipment Processed', status: 'completed' },
  { label: 'Departed Facility', status: 'completed' },
  { label: 'In Transit', status: 'active' },
  { label: 'Customs Clearance', status: 'upcoming' },
  { label: 'Out for Delivery', status: 'upcoming' },
  { label: 'Delivered', status: 'upcoming' },
];

function TrackingPreview() {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-[#10B981]" />;
      case 'active':
        return <Circle size={16} className="text-[#2B0071] fill-[#2B0071]/20 animate-pulse" />;
      default:
        return <Circle size={16} className="text-[#E2E5F0]" />;
    }
  };

  const getStatusLine = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-[#10B981]';
      case 'active':
        return 'bg-[#2B0071]';
      default:
        return 'bg-[#E2E5F0]';
    }
  };

  return (
    <section ref={sectionRef} className="section-padding bg-[#F8F9FD]" aria-labelledby="preview-heading">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="label-sm text-[#FF5500] font-semibold block mb-2 reveal">Live Preview</span>
          <h2 id="preview-heading" className="heading-section text-[#1A1A2E] reveal delay-100">
            Know exactly where <span className="text-[#2B0071]">your shipment stands.</span>
          </h2>
        </div>

        {/* Tracking Card Preview */}
        <div className="max-w-3xl mx-auto reveal delay-200">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-[0_8px_30px_rgba(26,26,46,0.06)] overflow-hidden">
            {/* Card Header */}
            <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-[#E2E5F0] bg-[#F8F9FD]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  IN TRANSIT
                </span>
                <span className="text-xs text-gray-400 font-mono">CG-928374</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={14} />
                <span>Updated 2 min ago</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="px-5 sm:px-7 py-5 sm:py-7">
              {/* Route */}
              <div className="flex items-center gap-3 text-sm mb-6">
                <span className="font-medium text-[#1A1A2E]">London, UK</span>
                <ArrowRight size={16} className="text-[#2B0071]/40" />
                <span className="font-medium text-[#1A1A2E]">Edinburgh, UK</span>
              </div>

              {/* ETA */}
              <div className="bg-[#2B0071]/5 rounded-xl px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-medium text-[#1A1A2E]">Estimated Delivery</span>
                <span className="text-sm font-bold text-[#2B0071]">August 8, 2026</span>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {timelineItems.map((item, index) => {
                  const isLast = index === timelineItems.length - 1;
                  return (
                    <div key={item.label} className="flex gap-3">
                      {/* Left: icon + line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-6 h-6 flex items-center justify-center">
                          {getStatusIcon(item.status)}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 min-h-[28px] ${getStatusLine(item.status)}`} />
                        )}
                      </div>

                      {/* Right: label */}
                      <div className="pb-4 pt-0.5">
                        <span
                          className={`text-sm font-medium ${
                            item.status === 'completed'
                              ? 'text-[#1A1A2E]'
                              : item.status === 'active'
                              ? 'text-[#2B0071] font-semibold'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 sm:px-7 py-3 sm:py-4 border-t border-[#E2E5F0] bg-[#F8F9FD]/30 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-gray-400">Last update: Departed Lagos facility</span>
              <button className="text-xs font-semibold text-[#2B0071] hover:text-[#FF5500] transition-colors duration-300 flex items-center gap-1">
                View full details
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-gray-400 mt-6 reveal">
          This is a preview of your real-time tracking experience
        </p>
      </div>
    </section>
  );
}

export default TrackingPreview;