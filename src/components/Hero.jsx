// src/components/Hero.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Package, ChevronRight, ArrowRight } from 'lucide-react';
import TrackingForm from './TrackingForm';

function Hero() {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();

    if (!trackingNumber.trim()) {
      setError('Please enter your tracking number.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate a brief loading state
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/track?tracking=${encodeURIComponent(trackingNumber.trim())}`);
    }, 600);
  };

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
    if (error) setError('');
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden pt-[72px] bg-[#F8F9FD]"
      aria-labelledby="hero-heading"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#2B0071]/[0.03] rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-[#FF5500]/[0.04] rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left: Content */}
          <div className="space-y-6 sm:space-y-8 pt-4 lg:pt-0">

            {/* Heading */}
            <h1
              id="hero-heading"
              className="heading-hero text-[#1A1A2E] animate-fade-up delay-100"
            >
              Track Your Shipment.
              <br />
              <span className="text-[#2B0071] relative inline-block">
                Stay in Control.
                <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#FF5500]/30 rounded-full -z-10" />
              </span>
            </h1>

            {/* Description */}
            <p className="body-text max-w-lg animate-fade-up delay-200">
              Track your package from dispatch to destination with real-time shipment updates,
              transparent delivery milestones, and secure notifications every step of the way.
            </p>

            {/* Tracking Form */}
            <div className="animate-fade-up delay-300">
              <TrackingForm
                trackingNumber={trackingNumber}
                onTrackingChange={handleInputChange}
                onSubmit={handleTrack}
                error={error}
                isLoading={isLoading}
                compact={false}
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2 animate-fade-up delay-400">
              <button
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                }}
                className="btn-primary group"
              >
                Track Package
                <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/services')}
                className="btn-secondary"
              >
                Explore Our Services
              </button>
            </div>
          </div>

          {/* Right: Image Composition */}
          <div className="relative lg:mt-0 animate-fade-up delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#2B0071]/10">
              <img
                src="/hero-logistics.jpg"
                alt="The Cargo Grid logistics service — international shipping and cargo delivery"
                className="w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] xl:h-[520px] object-cover"
                loading="lazy"
              />

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/20 via-transparent to-transparent pointer-events-none" />

              {/* Floating tracking card */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 sm:bottom-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xl border border-white/40 max-w-xs ml-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-semibold text-[#1A1A2E] tracking-wider uppercase">In Transit</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono font-bold text-[#2B0071]">TCG-928374123456</span>
                  <span className="text-[#E2E5F0]">|</span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin size={14} className="text-[#FF5500]" />
                    London → Edinburgh
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#E2E5F0]/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Est. delivery</span>
                  <span className="font-semibold text-[#1A1A2E]">Aug 08, 2026</span>
                </div>
              </div>

              {/* Floating badge - top right */}
              <div className="absolute top-4 right-4 bg-[#2B0071]/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <Clock size={14} className="text-[#FF5500]" />
                <span>24/7 Tracking</span>
              </div>

              {/* Small decorative element */}
              <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-[#FF5500]/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;