import React from 'react';
import { Shield, Users, MapPin, Phone, Star, CheckCircle } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/gettyimages-691802402-612x612.jpg)'
          }}
        />
        
        {/* Dark Overlay for Better Contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        {/* Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About LagosRentals</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Connecting Lagos residents with verified agents and quality affordable housing
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            We're on a mission to make finding affordable, quality housing in Lagos State as easy as possible. 
            Our platform connects genuine property seekers with verified agents, ensuring transparent transactions 
            and reducing the stress of house hunting in Nigeria's commercial capital.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Agents</h3>
              <p className="text-gray-600">All our agents are thoroughly vetted to ensure genuine listings and professional service.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lagos Coverage</h3>
              <p className="text-gray-600">Comprehensive coverage across all Lagos State local government areas.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Contact</h3>
              <p className="text-gray-600">Connect directly with property agents via WhatsApp for immediate response.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LagosRentals?</h2>
            <p className="text-lg text-gray-600">We offer unique features designed specifically for the Lagos rental market</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Affordable Focus</h3>
              </div>
              <p className="text-gray-700">Specializing in budget-friendly options including single rooms, self-contain apartments, and mini flats.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Mobile Optimized</h3>
              </div>
              <p className="text-gray-700">Designed for Nigerian mobile users with fast loading times and data-friendly interfaces.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Agent Verification</h3>
              </div>
              <p className="text-gray-700">Multi-step verification process ensures only legitimate agents can list properties on our platform.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Free Trial</h3>
              </div>
              <p className="text-gray-700">New agents get 2 free listings to test our platform before subscribing to a plan.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">WhatsApp Integration</h3>
              </div>
              <p className="text-gray-700">Seamless communication through WhatsApp, Nigeria's most popular messaging platform.</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Safety First</h3>
              </div>
              <p className="text-gray-700">Clear safety warnings and tips to help users avoid rental scams and fraudulent listings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl text-gray-300">Making a difference in Lagos housing market</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-gray-300">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-gray-300">Verified Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20</div>
              <div className="text-gray-300">Lagos Areas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-gray-300">Happy Tenants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Commitment</h2>
          <div className="bg-white rounded-2xl shadow-card p-8">
            <div className="mb-6">
              <Star className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Building Trust in Lagos Real Estate</h3>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              We understand the challenges of finding reliable accommodation in Lagos. That's why we've built 
              a platform that prioritizes transparency, affordability, and genuine connections between property 
              seekers and verified agents.
            </p>
            <p className="text-gray-600">
              Every listing on our platform comes with a commitment to authenticity and our promise that you're 
              dealing with verified, professional agents who have your best interests at heart.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;