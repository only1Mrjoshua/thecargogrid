import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import ShipSection from '../components/ShipSection';     // shipping-focused
import HowTrackingWorks from '../components/HowTrackingWorks'; // now shipping process
import Services from '../components/Services';          // shipping services
import WhyCargoGrid from '../components/WhyCargoGrid';  // shipping benefits
import ShipmentJourney from '../components/ShipmentJourney'; // shipping journey
import TrackingPreview from '../components/TrackingPreview'; // tracking demo (now lower)
import SecuritySection from '../components/SecuritySection';
import SupportCTA from '../components/SupportCTA';
import Footer from '../components/Footer';

function Home() {
  const mainRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={mainRef} className="min-h-screen bg-[#F8F9FD]">
      <Navbar />
      <Hero />
      <Stats />
      <ShipSection />          {/* moved up – shipping first */}
      <HowTrackingWorks />     {/* now shows shipping process with tracking as a step */}
      <Services />             {/* shipping services */}
      <WhyCargoGrid />         {/* shipping benefits */}
      <ShipmentJourney />      {/* shipping journey timeline */}
      <TrackingPreview />      {/* tracking demo – now lower down */}
      <SecuritySection />
      <SupportCTA />
      <Footer />
    </div>
  );
}

export default Home;