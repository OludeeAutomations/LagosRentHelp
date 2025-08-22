import React, { useState } from 'react';
import { Search, Filter, Star, TrendingUp } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Property, Agent, ClientViewCount } from '../types';

interface HomePageProps {
  properties: Property[];
  agents: Agent[];
  clientViewCounts: ClientViewCount[];
  onUpdateViewCounts: (viewCounts: ClientViewCount[]) => void;
  onNavigate?: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ properties, agents, clientViewCounts, onUpdateViewCounts, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || property.propertyType === selectedType;
    const matchesPrice = !priceRange || checkPriceRange(property.price, priceRange);
    
    return matchesSearch && matchesType && matchesPrice;
  });

  const checkPriceRange = (price: number, range: string) => {
    switch (range) {
      case 'under-200k': return price < 200000;
      case '200k-400k': return price >= 200000 && price < 400000;
      case '400k-600k': return price >= 400000 && price < 600000;
      case 'over-600k': return price >= 600000;
      default: return true;
    }
  };

  const getAgentForProperty = (agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  };

  const featuredProperties = properties.filter(p => p.featured);

  // Handle atomic hero loading
  React.useEffect(() => {
    // Atomic loading sequence
    let videoLoadTimer: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;

    const initializeHero = () => {
      // Wait for video to be ready
      videoLoadTimer = setTimeout(() => {
        document.body.classList.add('hero-loaded');
      }, 800); // Optimized timing for video initialization

      // Fallback safety net
      fallbackTimer = setTimeout(() => {
        document.body.classList.add('hero-loaded');
      }, 2500);
    };

    // Start initialization immediately
    initializeHero();
    
    return () => {
      clearTimeout(videoLoadTimer);
      clearTimeout(fallbackTimer);
      document.body.classList.remove('hero-loaded');
    };
  }, []);

  const handleVideoReady = () => {
    // Video is ready, trigger immediate load
    document.body.classList.add('hero-loaded');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Animated Background */}
      <section className="hero-section">
        {/* Crossfade Background Images */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="hero-image hero-image-1"
            style={{
              backgroundImage: 'url(/gettyimages-691802402-612x612.jpg)'
            }}
          />
          <div 
            className="hero-image hero-image-2"
            style={{
              backgroundImage: 'url(/gettyimages-923379128-612x612.jpg)'
            }}
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[90vh] px-4 pt-32 pb-20 sm:py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-12 md:mb-6 animate-fade-in leading-tight">
              Find Affordable Homes in Lagos
            </h1>
            <p className="text-lg md:text-2xl mt-1 sm:mt-2 md:mt-4 mb-6 sm:mb-8 text-gray-200 animate-fade-in max-w-2xl mx-auto leading-relaxed">
              Discover quality, budget-friendly rentals across Lagos State with verified agents and transparent pricing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <button 
                onClick={() => {
                  document.getElementById('featured-properties')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[200px]"
              >
                Browse Listings
              </button>
              <button 
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 min-w-[200px]"
              >
                Search Properties
              </button>
            </div>
            
            {/* Expandable Search Bar */}
            {showSearchBar && (
              <div className="mt-8 max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-fade-in border border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                  
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-900">All Types</option>
                    <option value="Single Room" className="text-gray-900">Single Room</option>
                    <option value="Self-Contain" className="text-gray-900">Self-Contain</option>
                    <option value="Mini Flat" className="text-gray-900">Mini Flat</option>
                    <option value="One Bedroom" className="text-gray-900">One Bedroom</option>
                    <option value="Two Bedroom" className="text-gray-900">Two Bedroom</option>
                  </select>
                  
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-900">Any Price</option>
                    <option value="under-200k" className="text-gray-900">Under ₦200k</option>
                    <option value="200k-400k" className="text-gray-900">₦200k - ₦400k</option>
                    <option value="400k-600k" className="text-gray-900">₦400k - ₦600k</option>
                    <option value="over-600k" className="text-gray-900">Over ₦600k</option>
                  </select>
                  
                  <button 
                    onClick={() => {
                      document.getElementById('all-properties')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}
                    className="btn-primary w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Filter className="h-5 w-5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="relative z-10 absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-white py-8 px-4 stats-container">
        <div className="max-w-6xl mx-auto">
          <div className="hidden md:flex animate-very-slow-infinite-slide-spaced">
            {/* First set of stats */}
            <div className="flex-shrink-0 w-1/4 text-center px-4 md:block">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">{properties.length}+</div>
                <div className="text-sm text-gray-600 font-medium">Active Properties</div>
                <div className="text-xs text-gray-500">Verified listings</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">{agents.length}+</div>
                <div className="text-sm text-gray-600 font-medium">Verified Agents</div>
                <div className="text-xs text-gray-500">Professional partners</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">20+</div>
                <div className="text-sm text-gray-600 font-medium">Lagos Areas</div>
                <div className="text-xs text-gray-500">Complete coverage</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-600 font-medium">Trust & Safety</div>
                <div className="text-xs text-gray-500">Fully verified</div>
              </div>
            </div>
            {/* Second set for seamless loop */}
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">{properties.length}+</div>
                <div className="text-sm text-gray-600 font-medium">Active Properties</div>
                <div className="text-xs text-gray-500">Verified listings</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">{agents.length}+</div>
                <div className="text-sm text-gray-600 font-medium">Verified Agents</div>
                <div className="text-xs text-gray-500">Professional partners</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">20+</div>
                <div className="text-sm text-gray-600 font-medium">Lagos Areas</div>
                <div className="text-xs text-gray-500">Complete coverage</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold font-heading text-gray-900 mb-1">100%</div>
                <div className="text-sm text-gray-600 font-medium">Trust & Safety</div>
                <div className="text-xs text-gray-500">Fully verified</div>
              </div>
            </div>
          </div>
          
          {/* Mobile Stats Grid - 2 cards visible at a time */}
          <div className="md:hidden overflow-hidden">
            <div className="flex space-x-6 pb-4 animate-very-slow-infinite-slide-spaced" style={{ width: 'max-content' }}>
              {/* Card 1 - Active Properties */}
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">{properties.length}+</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Active Properties</div>
                  <div className="text-sm text-gray-500">Verified listings</div>
                </div>
              </div>
              
              {/* Card 2 - Verified Agents */}
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">{agents.length}+</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Verified Agents</div>
                  <div className="text-sm text-gray-500">Professional partners</div>
                </div>
              </div>
              
              {/* Card 3 - Lagos Areas */}
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">20+</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Lagos Areas</div>
                  <div className="text-sm text-gray-500">Complete coverage</div>
                </div>
              </div>
              
              {/* Card 4 - Trust & Safety */}
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">100%</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Trust & Safety</div>
                  <div className="text-sm text-gray-500">Fully verified</div>
                </div>
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">{properties.length}+</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Active Properties</div>
                  <div className="text-sm text-gray-500">Verified listings</div>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">{agents.length}+</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Verified Agents</div>
                  <div className="text-sm text-gray-500">Professional partners</div>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">20+</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Lagos Areas</div>
                  <div className="text-sm text-gray-500">Complete coverage</div>
                </div>
              </div>
              
              <div className="flex-shrink-0 w-64 text-center">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors duration-300 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold font-heading text-gray-900 mb-2">100%</div>
                  <div className="text-base text-gray-600 font-medium mb-1">Trust & Safety</div>
                  <div className="text-sm text-gray-500">Fully verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section id="featured-properties" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => {
              const agent = getAgentForProperty(property.agentId);
              return agent ? (
                <PropertyCard key={property.id} property={property} agent={agent} clientViewCounts={clientViewCounts} onUpdateViewCounts={onUpdateViewCounts} />
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* All Properties */}
      <section id="all-properties" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">
              All Properties {filteredProperties.length > 0 && `(${filteredProperties.length})`}
            </h2>
          </div>
          
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map(property => {
                const agent = getAgentForProperty(property.agentId);
                return agent ? (
                  <PropertyCard key={property.id} property={property} agent={agent} clientViewCounts={clientViewCounts} onUpdateViewCounts={onUpdateViewCounts} />
                ) : null;
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
            <defs>
              <pattern id="safety-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" className="text-blue-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#safety-pattern)" />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🛡️</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
              Your Safety is Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              We've built comprehensive safety measures to protect you throughout your rental journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Card 1 - Verified Agents */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
                  Verified Agents
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  Every agent undergoes rigorous verification including ID checks, phone verification, and background screening before listing
                </p>
                
                {/* Verification Steps */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Identity Verification</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Phone Number Confirmed</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Background Screening</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 2 - Always Inspect */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">👁️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                  Always Inspect First
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  Never make payments without physically visiting the property. We provide safety tips and inspection checklists
                </p>
                
                {/* Safety Tips */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Physical Inspection Required</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Bring a Friend/Family</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>Check All Facilities</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card 3 - Direct Contact */}
            <div className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">📞</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                  Secure Communication
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  Direct WhatsApp communication with verified agents. No middlemen, no hidden fees, transparent conversations
                </p>
                
                {/* Communication Features */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>Direct WhatsApp Contact</span>
                  </div>
                  <div className="flex items-center text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>No Hidden Middlemen</span>
                  </div>
                  <div className="flex items-center text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>Transparent Pricing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-16 p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help or Have Concerns?</h3>
                <p className="text-gray-600">Our support team is here to ensure your safety throughout the rental process</p>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => onNavigate?.('contact')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Report Issue
                </button>
                <button className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  Safety Tips
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;