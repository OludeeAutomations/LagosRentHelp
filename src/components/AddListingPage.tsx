import React, { useState } from 'react';
import { Upload, UserCheck, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import SubscriptionModal from './SubscriptionModal';
import { Agent, Property } from '../types';

interface AddListingPageProps {
  currentAgent: Agent | null;
  onAgentRegister: (agent: Omit<Agent, 'id' | 'registeredAt'>) => void;
  onAddListing: (listing: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateAgent: (agent: Agent) => void;
}

const AddListingPage: React.FC<AddListingPageProps> = ({
  currentAgent,
  onAgentRegister,
  onAddListing,
  onUpdateAgent
}) => {
  const [showRegistration, setShowRegistration] = useState(!currentAgent);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [agentForm, setAgentForm] = useState({
    name: '',
    whatsappNumber: '',
    email: ''
  });
  const [listingForm, setListingForm] = useState({
    title: '',
    propertyType: 'Single Room',
    location: '',
    price: '',
    description: '',
    photos: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleAgentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newAgent = {
        ...agentForm,
        listings: [],
        freeListingsUsed: 0
      };
      
      onAgentRegister(newAgent);
      setShowRegistration(false);
      setSubmitMessage('Registration successful! You can now add listings.');
    } catch (error) {
      setSubmitMessage('Registration failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAgent) return;

    // Check free listing limit
    if (currentAgent.freeListingsUsed >= 2 && !currentAgent.subscriptionPlan) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newListing = {
        ...listingForm,
        price: parseInt(listingForm.price),
        agentId: currentAgent.id,
        photos: listingForm.photos.length > 0 ? listingForm.photos : [
          'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]
      };
      
      onAddListing(newListing);
      
      // Update agent's free listings used
      const updatedAgent = {
        ...currentAgent,
        freeListingsUsed: currentAgent.freeListingsUsed + 1
      };
      onUpdateAgent(updatedAgent);
      
      // Reset form
      setListingForm({
        title: '',
        propertyType: 'Single Room',
        location: '',
        price: '',
        description: '',
        photos: []
      });
      
      setSubmitMessage('Listing added successfully!');
    } catch (error) {
      setSubmitMessage('Failed to add listing. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload to a service like Cloudinary
      // For demo, we'll use placeholder images
      const newPhotos = [
        'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
      ];
      setListingForm(prev => ({ ...prev, photos: newPhotos }));
    }
  };

  const BackgroundSVG = () => (
    <div className="absolute inset-0 opacity-5 overflow-hidden">
      <svg className="animate-float w-full h-full" viewBox="0 0 800 600" fill="currentColor">
        <g>
          <rect x="100" y="200" width="80" height="120" className="text-blue-300" />
          <rect x="200" y="180" width="80" height="140" className="text-blue-400" />
          <rect x="300" y="190" width="80" height="130" className="text-blue-300" />
          <rect x="400" y="170" width="80" height="150" className="text-blue-400" />
          <rect x="500" y="185" width="80" height="135" className="text-blue-300" />
          <rect x="600" y="175" width="80" height="145" className="text-blue-400" />
          
          <polygon points="140,200 160,180 180,200" className="text-blue-500" />
          <polygon points="240,180 260,160 280,180" className="text-blue-500" />
          <polygon points="340,190 360,170 380,190" className="text-blue-500" />
          <polygon points="440,170 460,150 480,170" className="text-blue-500" />
          <polygon points="540,185 560,165 580,185" className="text-blue-500" />
          <polygon points="640,175 660,155 680,175" className="text-blue-500" />
        </g>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/gettyimages-923379128-612x612.jpg)'
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-sky-900/80"></div>
      </div>
      
      <BackgroundSVG />
      
      <div className="relative z-10 pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {showRegistration ? (
            <div className="bg-white rounded-2xl shadow-card p-8 animate-fade-in">
              <div className="text-center mb-8">
                <UserCheck className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Join as an Agent</h2>
                <p className="text-gray-600">Register to start listing your properties</p>
              </div>
              
              <form onSubmit={handleAgentRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={agentForm.name}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={agentForm.whatsappNumber}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+234XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={agentForm.email}
                    onChange={(e) => setAgentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register as Agent'}
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Free Trial Benefits:</p>
                    <p className="text-sm text-green-700">• 2 free property listings</p>
                    <p className="text-sm text-green-700">• Direct WhatsApp integration</p>
                    <p className="text-sm text-green-700">• Professional profile page</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-8 animate-fade-in">
              <div className="text-center mb-8">
                <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Listing</h2>
                <p className="text-gray-600">Create a professional property listing</p>
                
                {currentAgent && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>Free listings used:</strong> {currentAgent.freeListingsUsed}/2
                      {currentAgent.subscriptionPlan && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {currentAgent.subscriptionPlan.toUpperCase()} PLAN
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleAddListing} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={listingForm.title}
                    onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Modern Self-Contain Apartment in Lekki"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type *
                    </label>
                    <select
                      required
                      value={listingForm.propertyType}
                      onChange={(e) => setListingForm(prev => ({ ...prev, propertyType: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Single Room">Single Room</option>
                      <option value="Self-Contain">Self-Contain</option>
                      <option value="Mini Flat">Mini Flat</option>
                      <option value="One Bedroom">One Bedroom</option>
                      <option value="Two Bedroom">Two Bedroom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Rent (₦) *
                    </label>
                    <input
                      type="number"
                      required
                      value={listingForm.price}
                      onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="350000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={listingForm.location}
                    onChange={(e) => setListingForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lekki Phase 1, Lagos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={listingForm.description}
                    onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the property features, amenities, and nearby facilities..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Photos (3-5 photos)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photos"
                    />
                    <label htmlFor="photos" className="cursor-pointer">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">Upload Property Photos</p>
                      <p className="text-sm text-gray-600">Drag and drop or click to browse</p>
                      <p className="text-xs text-gray-500 mt-2">
                        For demo purposes, sample photos will be added automatically
                      </p>
                    </label>
                  </div>
                  
                  {listingForm.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {listingForm.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </form>
              
              {submitMessage && (
                <div className={`mt-6 p-4 rounded-xl ${
                  submitMessage.includes('successful') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {submitMessage.includes('successful') ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <p className={`text-sm font-medium ${
                      submitMessage.includes('successful') ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {submitMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={(plan) => {
            setShowSubscriptionModal(false);
            if (currentAgent) {
              const updatedAgent = {
                ...currentAgent,
                subscriptionPlan: plan.id,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              };
              onUpdateAgent(updatedAgent);
            }
          }}
        />
      )}
    </div>
  );
};

export default AddListingPage;