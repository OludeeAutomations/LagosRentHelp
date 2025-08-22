import React from 'react';
import { MapPin, Phone, AlertTriangle, Clock, CheckCircle, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Property, Agent, ClientViewCount } from '../types';
import { 
  getClientId, 
  canViewAgentContact, 
  recordClientView, 
  sendWhatsAppNotification,
  shouldSendUpgradeNotification,
  isInTrial,
  isTrialExpired 
} from '../utils/trialLogic';

interface PropertyCardProps {
  property: Property;
  agent: Agent;
  clientViewCounts: ClientViewCount[];
  onUpdateViewCounts: (viewCounts: ClientViewCount[]) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  agent, 
  clientViewCounts, 
  onUpdateViewCounts 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [modalImageIndex, setModalImageIndex] = React.useState(0);

  // Auto-slide images every 5 seconds
  React.useEffect(() => {
    if (property.photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % property.photos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [property.photos.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsAppClick = () => {
    const clientId = getClientId();
    
    // Check if agent's trial has expired
    if (isTrialExpired(agent) && agent.status === 'trial_expired') {
      alert('This agent is currently under review. Please check back later.');
      return;
    }
    
    // Check if client can view this agent's contact (max 2 views for trial agents)
    if (isInTrial(agent) && !canViewAgentContact(clientId, agent.id, clientViewCounts)) {
      alert('This agent is currently under review. Please check back later.');
      return;
    }
    
    // Record the view if agent is in trial
    if (isInTrial(agent)) {
      const updatedViewCounts = recordClientView(clientId, agent.id, clientViewCounts);
      onUpdateViewCounts(updatedViewCounts);
      
      // Check if we should send upgrade notification to agent
      const clientViews = updatedViewCounts.find(
        vc => vc.clientId === clientId && vc.agentId === agent.id
      );
      
      if (clientViews && clientViews.count === 2) {
        // This client just hit the limit, send notification to agent
        sendWhatsAppNotification(agent);
      }
    }
    
    // Proceed with WhatsApp contact
    const message = encodeURIComponent(
      `Hi ${agent.name}, I'm interested in your property: ${property.title} located in ${property.location}. Can we discuss?`
    );
    const whatsappUrl = `https://wa.me/${agent.whatsappNumber.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleImageClick = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % property.photos.length);
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + property.photos.length) % property.photos.length);
  };

  const getAgentStatusBadge = () => {
    if (agent.status === 'active') return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>;
    if (agent.status === 'trial') return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">New Agent</span>;
    return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Under Review</span>;
  };

  return (
    <>
      <div className="property-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in hover:shadow-xl hover:border-gray-300 transition-all duration-300">
        <div className="relative group">
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <img
              src={property.photos[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-opacity duration-500 cursor-pointer"
              onClick={() => handleImageClick(currentImageIndex)}
            />
            
            {/* Image overlay with zoom icon */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center cursor-pointer"
                 onClick={() => handleImageClick(currentImageIndex)}>
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Image indicators */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {property.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Image counter */}
            {property.photos.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1}/{property.photos.length}
              </div>
            )}
          </div>
          
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            {formatPrice(property.price)}/yr
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {property.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Agent:</span>
              <p className="font-medium text-gray-900">{agent.name}</p>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </div>
        
        <button
          onClick={handleWhatsAppClick}
          className="w-full btn-primary flex items-center justify-center space-x-2 mb-3"
        >
          <span>📞 View Agent's Contact</span>
        </button>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <p className="text-xs text-orange-800">
              <strong>⚠️ Always inspect the property in person before making payment. We only list verified agents.</strong>
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Navigation buttons */}
            {property.photos.length > 1 && (
              <>
                <button
                  onClick={prevModalImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextModalImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Main image */}
            <img
              src={property.photos[modalImageIndex]}
              alt={property.title}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {modalImageIndex + 1} of {property.photos.length}
            </div>
            
            {/* Image indicators */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {property.photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setModalImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === modalImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyCard;