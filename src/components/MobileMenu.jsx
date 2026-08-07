import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Track Shipment', href: '/track' },
  { label: 'Services', href: '/services' },
  { label: 'Ship a Package', href: '/ship' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

function MobileMenu({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#FFFFFF] shadow-2xl animate-slide-down overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E5F0]">
            <img src="/logo.png" alt="The Cargo Grid" className="h-8 w-auto object-contain" />
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-[#1A1A2E] hover:text-[#2B0071] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
              aria-label="Close menu"
            >
              <X size={28} strokeWidth={1.8} />
            </button>
          </div>

          <nav className="flex-1 px-5 py-8 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={onClose}
                className="flex items-center justify-between py-3.5 px-4 text-base font-medium text-[#1A1A2E] hover:text-[#2B0071] hover:bg-[#F8F9FD] rounded-xl transition-all duration-200 group"
              >
                <span>{link.label}</span>
                <ChevronRight size={18} className="text-[#2B0071]/40 group-hover:text-[#2B0071] transition-colors" />
              </Link>
            ))}
          </nav>

          <div className="px-5 py-6 border-t border-[#E2E5F0] bg-[#F8F9FD] space-y-3">
            <Link
              to="/ship"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3.5 text-base font-semibold text-[#2B0071] bg-[#2B0071]/5 rounded-xl transition-all duration-300 hover:bg-[#2B0071]/10"
            >
              Ship a Package
            </Link>
            <Link
              to="/track"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3.5 text-base font-semibold text-white bg-[#FF5500] rounded-xl transition-all duration-300 hover:bg-[#e64a00]"
            >
              Track Package
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;