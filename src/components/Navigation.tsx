import React, { useState, useEffect } from 'react';
import { Menu, X, Home } from 'lucide-react';
import { Agent } from '../types';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentAgent?: Agent;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, currentAgent }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/60 backdrop-blur-xl ${
      isScrolled 
        ? 'border-b border-white/20' 
        : ''
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img 
              src="/Group 39.png" 
              alt="Lagos Homes Logo" 
             className="h-[150px] w-[150px] md:h-[200px] md:w-[200px] object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 py-2 text-white hover:text-emerald-200 transition-colors ${
                  currentPage === item.id ? 'text-emerald-300' : ''
                }`}
              >
                {item.label}
                {currentPage === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"></div>
                )}
              </button>
            ))}
            
            {/* Agent Listing Button */}
            <button
              onClick={() => onNavigate('add-listing')}
              className={`px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all duration-300 transform hover:scale-105 ${
                currentPage === 'add-listing' ? 'bg-emerald-600' : ''
              }`}
            >
              Agent Listing
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-emerald-200 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-black hover:text-gray-700 transition-colors ${
                    currentPage === item.id ? 'text-emerald-600 font-semibold' : ''
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Mobile Agent Listing Button */}
              <button
                onClick={() => {
                  onNavigate('add-listing');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium ${
                  currentPage === 'add-listing' ? 'bg-emerald-600' : ''
                }`}
              >
                Agent Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;