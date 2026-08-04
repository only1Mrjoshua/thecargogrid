// src/pages/Home.jsx
import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import HowTrackingWorks from '../components/HowTrackingWorks';
import Services from '../components/Services';
import WhyCargoGrid from '../components/WhyCargoGrid';
import ShipmentJourney from '../components/ShipmentJourney';
import TrackingPreview from '../components/TrackingPreview';
import SecuritySection from '../components/SecuritySection';
import SupportCTA from '../components/SupportCTA';
import Footer from '../components/Footer';

function Home() {
  const mainRef = useRef(null);

  // Scroll reveal using Intersection Observer
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
      <HowTrackingWorks />
      <Services />
      <WhyCargoGrid />
      <ShipmentJourney />
      <TrackingPreview />
      <SecuritySection />
      <SupportCTA />
      <Footer />
    </div>
  );
}

export default Home;