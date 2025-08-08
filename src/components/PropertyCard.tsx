import React from 'react';
import { MapPin, Phone, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
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
  
  const getAgentStatusBadge = () => {
    if (agent.status === 'active') return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>;
    if (agent.status === 'trial') return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">New Agent</span>;
    return <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Under Review</span>;
  };

  return (
    <div className="property-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in hover:shadow-xl hover:border-gray-300 transition-all duration-300">
      <div className="relative">
        <img
          src={property.photos[0]}
          alt={property.title}
          className="w-full h-48 sm:h-56 object-cover"
        />
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
  );
};

export default PropertyCard;