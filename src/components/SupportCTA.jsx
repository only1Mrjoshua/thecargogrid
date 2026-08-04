// src/components/SupportCTA.jsx
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowRight, Headphones } from 'lucide-react';

function SupportCTA() {
  const sectionRef = useRef(null);
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
      { threshold: 0.2 }
    );

    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-white" aria-labelledby="support-heading">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 bg-[#2B0071]/5 rounded-full text-xs font-semibold text-[#2B0071] tracking-wider uppercase mb-4">
            <Headphones size={14} className="text-[#FF5500]" />
            24/7 Support
          </div>

          <h2 id="support-heading" className="heading-section text-[#1A1A2E] reveal delay-100">
            Need help with <span className="text-[#2B0071]">your shipment?</span>
          </h2>

          <p className="body-text max-w-2xl mx-auto mt-4 reveal delay-200">
            Our support team is available to help you understand your shipment status
            and guide you through the next steps.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 reveal delay-300">
            <Link
              to="/contact"
              className="btn-primary group"
            >
              <MessageCircle size={18} className="mr-2" />
              Contact Support
              <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => {
                const form = document.querySelector('form');
                if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                else navigate('/track');
              }}
              className="btn-secondary"
            >
              Track Package
            </button>
          </div>

          {/* Trust signal */}
          <p className="text-xs text-gray-400 mt-6 reveal flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[#10B981]" />
            Average response time: under 2 hours
          </p>
        </div>
      </div>
    </section>
  );
}

export default SupportCTA;