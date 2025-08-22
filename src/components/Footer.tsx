import React from 'react';
import { Home, Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Home', href: 'home' },
    { label: 'Add Listing', href: 'add-listing' },
    { label: 'About', href: 'about' },
    { label: 'Contact', href: 'contact' },
    { label: 'Terms of Service', href: 'terms' },
    { label: 'Privacy Policy', href: 'privacy' }
  ];

  const handleLinkClick = (href: string) => {
    // Trigger navigation to any page
    window.dispatchEvent(new CustomEvent('navigate', { detail: href }));
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-8">
            {/* Left Column - Logo & Tagline */}
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <img 
                  src="/Group 39.png" 
                  alt="Lagos Homes Logo" 
                  className="h-[200px] w-[200px] object-contain"
                />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
                Connecting Lagosians to affordable rental homes.
              </p>
            </div>

            {/* Middle Column - Quick Links */}
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto md:mx-0 md:max-w-none">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(link.href)}
                    className="text-gray-300 text-sm hover:text-sky-400 transition-colors duration-200 py-1 text-center md:text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Third Column - Contact Info */}
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-lg font-semibold text-white">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-300 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Lagos State, Nigeria</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-300 text-sm">
                  <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <a href="mailto:admin@lagosrenthelp.ng" className="hover:text-sky-400 transition-colors">
                    admin@lagosrenthelp.ng
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-300 text-sm">
                  <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <a href="tel:+2347082293054" className="hover:text-sky-400 transition-colors">
                    +234 708 229 3054
                  </a>
                </div>
              </div>
            </div>

            {/* Fourth Column - Social Media */}
            <div className="space-y-4 text-center md:text-left">
              <h3 className="text-lg font-semibold text-white">Follow Us</h3>
              <div className="flex justify-center md:justify-start space-x-4">
                <div className="bg-gray-800 p-2 rounded-lg cursor-default">
                  <MessageCircle className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg cursor-default">
                  <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg cursor-default">
                  <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom Bar */}
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © 2025 Lagos Rent Help. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;