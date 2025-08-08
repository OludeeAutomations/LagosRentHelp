import React from 'react';
import { Home, Mail, Phone, MapPin, MessageCircle, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const quickLinks = [
    { label: 'Home', href: '#' },
    { label: 'Add Listing', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Logo & Tagline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-500 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Lagos Rentals</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Connecting Lagosians to affordable rental homes.
              </p>
            </div>

            {/* Middle Column - Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-gray-300 text-sm hover:text-sky-400 transition-colors duration-200 py-1"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Lagos, Nigeria</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 text-sm">
                  <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <a href="mailto:info@lagosrentals.ng" className="hover:text-sky-400 transition-colors">
                    info@lagosrentals.ng
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 text-sm">
                  <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <a href="tel:+2348012345678" className="hover:text-sky-400 transition-colors">
                    +234 801 234 5678
                  </a>
                </div>
              </div>

              {/* Social Icons */}
              <div className="pt-2">
                <h4 className="text-sm font-medium text-white mb-3">Follow Us</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://wa.me/2348012345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors duration-200 group"
                  >
                    <MessageCircle className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-pink-600 transition-colors duration-200 group"
                  >
                    <Instagram className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 group"
                  >
                    <Facebook className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="border-t border-gray-700"></div>

      {/* Bottom Bar */}
      <div className="py-4 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            © 2025 Lagos Rentals. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;