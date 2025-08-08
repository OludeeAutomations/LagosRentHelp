import React, { useState } from 'react';
import { Search, Filter, Star, TrendingUp } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Property, Agent } from '../types';

interface HomePageProps {
  properties: Property[];
  agents: Agent[];
}

const HomePage: React.FC<HomePageProps> = ({ properties, agents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    '/gettyimages-642239446-612x612.jpg',
    '/gettyimages-691802402-612x612.jpg'
  ];

  // Auto-advance slideshow
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Animated Background */}
      <section className="hero-section relative overflow-hidden">
        {/* Background Images Slideshow */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`
            }}
          />
        ))}
        
        {/* Dark Overlay for Better Contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        
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
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <section className="bg-white py-8 px-4 shadow-lg stats-container">
        <div className="max-w-6xl mx-auto">
          <div className="flex animate-very-slow-infinite-slide-spaced">
            {/* First set of stats */}
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-blue-600 mb-1">{properties.length}+</div>
              <div className="text-gray-600 text-sm md:text-base">Properties</div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-green-600 mb-1">{agents.length}+</div>
              <div className="text-gray-600 text-sm md:text-base">Agents</div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-purple-600 mb-1">20+</div>
              <div className="text-gray-600 text-sm md:text-base">Lagos Areas</div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-orange-600 mb-1">100%</div>
              <div className="text-gray-600 text-sm md:text-base">Verified</div>
            </div>
            {/* Second set for seamless loop */}
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-blue-600 mb-1">{properties.length}+</div>
              <div className="text-gray-600 text-sm md:text-base">Properties</div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-green-600 mb-1">{agents.length}+</div>
              <div className="text-gray-600 text-sm md:text-base">Agents</div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-purple-600 mb-1">20+</div>
              <div className="text-gray-600 text-sm md:text-base">Lagos Areas</div>
            </div>
            <div className="flex-shrink-0 w-1/4 text-center px-8">
              <div className="text-2xl md:text-3xl font-bold font-heading text-orange-600 mb-1">100%</div>
              <div className="text-gray-600 text-sm md:text-base">Verified</div>
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
                <PropertyCard key={property.id} property={property} agent={agent} />
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
                  <PropertyCard key={property.id} property={property} agent={agent} />
                ) : null;
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Safety is Our Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Agents</h3>
              <p className="text-sm text-gray-600">All agents undergo thorough verification before listing</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Always Inspect</h3>
              <p className="text-sm text-gray-600">Visit properties in person before making any payments</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Direct Contact</h3>
              <p className="text-sm text-gray-600">Communicate directly with agents via WhatsApp</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;