import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';

const footerLinks = {
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#/about' },
      { label: 'Services', href: '#/services' },
      { label: 'Ship a Package', href: '#/ship' },
      { label: 'Contact', href: '#/contact' },
      { label: 'FAQ', href: '#/faq' },
    ],
  },
  tracking: {
    title: 'Tracking',
    links: [
      { label: 'Track Shipment', href: '#/track' },
      { label: 'Shipment Status', href: '#/track' },
      { label: 'Delivery Information', href: '#/track' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#/contact' },
      { label: 'Contact Support', href: '#/contact' },
      { label: 'Shipping Questions', href: '#/faq' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#/privacy' },
      { label: 'Terms & Conditions', href: '#/terms' },
    ],
  },
};

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A2E] text-white/80" role="contentinfo">
      <div className="container-custom">
        <div className="py-12 sm:py-16 md:py-20 border-b border-white/10">
          {/* Adjusted grid to give the brand/contact column a bit more width on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-8">
            
            {/* Brand Column */}
            <div className="space-y-5">
              <a href="#/" className="inline-block" aria-label="West Oceania home">
                <img 
                  src="/logo.png" 
                  alt="West Oceania" 
                  className="h-14 w-auto object-contain brightness-0 invert" 
                />
              </a>
              <p className="text-sm text-white/60 max-w-xs leading-relaxed">
                Reliable logistics. Clear tracking. Every step of the way.
              </p>
              
              {/* Contact Details */}
              <div className="space-y-3 text-sm text-white/60 pt-1">
                <a 
                  href="mailto:support@westoceania.com" 
                  className="flex items-start gap-3 hover:text-white transition-colors group"
                >
                  <Mail size={16} className="text-[#FF5500] flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="text-white/40 text-xs uppercase tracking-wider mr-1.5">Support:</span>
                    support@westoceania.com
                  </span>
                </a>
                
                <a 
                  href="mailto:inquiries@westoceania.com" 
                  className="flex items-start gap-3 hover:text-white transition-colors group"
                >
                  <Mail size={16} className="text-[#FF5500] flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="text-white/40 text-xs uppercase tracking-wider mr-1.5">Inquiries:</span>
                    inquiries@westoceania.com
                  </span>
                </a>
                
                <a 
                  href="tel:+447473954435" 
                  className="flex items-start gap-3 hover:text-white transition-colors group"
                >
                  <Phone size={16} className="text-[#FF5500] flex-shrink-0 mt-0.5" />
                  <span>+44 7473954435</span>
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                {footerLinks.company.title}
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tracking Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                {footerLinks.tracking.title}
              </h3>
              <ul className="space-y-3">
                {footerLinks.tracking.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                {footerLinks.support.title}
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                {footerLinks.legal.title}
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-center text-sm text-white/40">
          <p>&copy; 1995-{currentYear} West Oceania. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;