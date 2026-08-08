import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Package, ChevronRight, ArrowRight } from 'lucide-react';
import TrackingForm from './TrackingForm';

function Hero() {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const images = ['/hero1.jpeg', '/ship.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter your tracking number.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/track?tracking=${encodeURIComponent(trackingNumber.trim())}`);
    }, 600);
  };

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
    if (error) setError('');
  };

  // Helper to trigger tracking form submit from the secondary button
  const handleTrackClick = () => {
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden pt-[72px] bg-[#1A1A2E]"
      aria-labelledby="hero-heading"
    >
      {/* Background images */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        ))}
        <div className="absolute inset-0 bg-[#1A1A2E]/60 mix-blend-multiply" />
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-[#2B0071]/20 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-[#FF5500]/20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none z-0" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
          <div className="space-y-6 sm:space-y-8 pt-4 lg:pt-0 text-white">
            {/* NEW HEADLINE – shipping first */}
            <h1
              id="hero-heading"
              className="heading-hero text-white animate-fade-up delay-100"
            >
              Global Shipping <br />
              <span className="text-[#FF5500] relative inline-block">
                Made Simple.
                <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#FF5500]/30 rounded-full -z-10" />
              </span>
            </h1>

            {/* NEW SUBTEXT – emphasises shipping, tracking as a bonus */}
            <p className="body-text text-white/90 max-w-lg animate-fade-up delay-200">
              Ship your cargo worldwide with ease, compare rates, book in seconds,
              and <strong className="text-[#FF5500]">track every step</strong> in real time.
            </p>

            {/* PRIMARY CTAs – "Ship a Package" is now the main action */}
            <div className="flex flex-wrap gap-4 pt-2 animate-fade-up delay-300">
              <button
                onClick={() => navigate('/ship')}
                className="btn-primary group"
              >
                Ship a Package
                <Package size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleTrackClick}
                className="btn-outline-light group"
              >
                Track Package
                <ArrowRight size={18} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* TRACKING FORM – moved lower and made visually smaller */}
            <div className="animate-fade-up delay-400 mt-6 max-w-md">
              <TrackingForm
                trackingNumber={trackingNumber}
                onTrackingChange={handleInputChange}
                onSubmit={handleTrack}
                error={error}
                isLoading={isLoading}
                compact={true}                      // smaller appearance
                label="Or track a shipment"         // less prominent label
                labelClassName="text-white/80 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;