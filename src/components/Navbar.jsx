import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import MobileMenu from './MobileMenu';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Track Shipment', href: '/track' },
  { label: 'Services', href: '/services' },
  { label: 'Ship a Package', href: '/ship' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'navbar-blur border-b border-[#E2E5F0]/60 shadow-sm'
            : 'bg-white/70 backdrop-blur-sm border-b border-transparent'
        }`}
        style={{ height: '72px' }}
        role="banner"
      >
        <div className="container-custom h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" aria-label="The Cargo Grid home">
            <img src="/logo.png" alt="The Cargo Grid" className="h-14 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-medium text-[#1A1A2E]/80 hover:text-[#2B0071] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2B0071] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/ship"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#2B0071] bg-[#2B0071]/5 rounded-xl transition-all duration-300 hover:bg-[#2B0071]/10"
            >
              Ship Now
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#FF5500] rounded-xl transition-all duration-300 hover:bg-[#e64a00] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/25 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Track Package
              <ChevronRight size={16} className="opacity-80" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -mr-2 text-[#1A1A2E] hover:text-[#2B0071] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={28} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}

export default Navbar;