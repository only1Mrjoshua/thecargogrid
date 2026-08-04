// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  tracking: {
    title: 'Tracking',
    links: [
      { label: 'Track Shipment', href: '/track' },
      { label: 'Shipment Status', href: '/track' },
      { label: 'Delivery Information', href: '/track' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Contact Support', href: '/contact' },
      { label: 'Shipping Questions', href: '/faq' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
    ],
  },
};

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A2E] text-white/80" role="contentinfo">
      <div className="container-custom">
        {/* Main Footer */}
        <div className="py-12 sm:py-16 md:py-20 border-b border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
                <Link to="/" className="inline-block">
                <img
                    src="/logo.png"
                    alt="The Cargo Grid"
                    className="h-16 w-auto object-contain brightness-0 invert"
                />
                </Link>

              <p className="text-sm text-white/60 max-w-xs leading-relaxed">
                Reliable logistics. Clear tracking. Every step of the way.
              </p>

              <div className="space-y-2 text-sm text-white/50">
                <p className="flex items-center gap-2.5">
                  <Mail
                    size={16}
                    className="text-[#FF5500] flex-shrink-0"
                  />
                  <span>support@thecargogrid.com</span>
                </p>

                <p className="flex items-center gap-2.5">
                  <Phone
                    size={16}
                    className="text-[#FF5500] flex-shrink-0"
                  />
                  <span>+1 (800) 555-0199</span>
                </p>

                <p className="flex items-center gap-2.5">
                  <MapPin
                    size={16}
                    className="text-[#FF5500] flex-shrink-0"
                  />
                  <span>123 Logistics Ave, Suite 400</span>
                </p>
              </div>
            </div>

            {/* Link Columns */}
            {Object.values(footerLinks).map((column) => (
              <div key={column.title} className="space-y-3">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  {column.title}
                </h3>

                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 flex items-center justify-center text-sm text-white/40">
          <p>
            &copy; {currentYear} The Cargo Grid. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;