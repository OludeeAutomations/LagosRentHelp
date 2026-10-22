import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#41614F] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <img src="/icon.png" alt="" className=" w-14" />

              <span className="text-xl font-bold text-[#ffffff] hidden sm:block">
                LagosRentHelp
              </span>
            </Link>
            <p className="text-white mb-6">
              The ultimate platform connecting property owners with tenants for
              both short-term stays and long-term rentals in Lagos.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61580883641779"
                className="text-white hover:text-[#129B36] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/lagos_rent?t=wwcqSDsWXvP3_KhYnKIZIg&s=09"
                className="text-white hover:text-[#129B36] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-white hover:text-[#129B36] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-white hover:text-[#129B36] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white hover:text-[#129B36] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-white hover:text-[#129B36] transition-colors">
                  Search Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white hover:text-[#129B36] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="text-white hover:text-[#129B36] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white hover:text-[#129B36] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Property Types</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/search?type=1-bedroom"
                  className="text-white hover:text-[#129B36] transition-colors">
                  1-Bedroom Apartments
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=2-bedroom"
                  className="text-white hover:text-[#129B36] transition-colors">
                  2-Bedroom Apartments
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=3-bedroom"
                  className="text-white hover:text-[#129B36] transition-colors">
                  3-Bedroom Apartments
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=duplex"
                  className="text-white hover:text-[#129B36] transition-colors">
                  Duplexes
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=short-let"
                  className="text-white hover:text-[#129B36] transition-colors">
                  Short Lets
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#129B36] mt-1 flex-shrink-0" />
                <p className="text-white">Lagos, Nigeria</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-[#129B36] flex-shrink-0" />
                <p className="text-white">+234 708 229 3054</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-[#129B36] flex-shrink-0" />
                <p className="text-white">info@lagosrenthelp.ng</p>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-[#129B36] flex-shrink-0" />
                <p className="text-white">WhatsApp: +234 708 229 3054</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-sm mb-4 md:mb-0">
            © {currentYear} LagosRentHelp. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/privacy"
              className="text-white hover:text-[#129B36] text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-white hover:text-[#129B36] text-sm transition-colors">
              Terms of Service
            </Link>
            <Link
              to="/faq"
              className="text-white hover:text-[#129B36] text-sm transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
