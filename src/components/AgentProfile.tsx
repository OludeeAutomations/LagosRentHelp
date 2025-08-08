import React from 'react';
import { User, Phone, Mail, Calendar, Award, MapPin, Clock, AlertTriangle } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Agent, Property, ClientViewCount } from '../types';
import { isInTrial, getDaysRemainingInTrial, isTrialExpired } from '../utils/trialLogic';

interface AgentProfileProps {
  agent: Agent;
  properties: Property[];
  allAgents: Agent[];
  clientViewCounts?: ClientViewCount[];
  onUpdateViewCounts?: (viewCounts: ClientViewCount[]) => void;
}

const AgentProfile: React.FC<AgentProfileProps> = ({ 
  agent, 
  properties, 
  allAgents, 
  clientViewCounts = [], 
  onUpdateViewCounts = () => {} 
}) => {
  const agentProperties = properties.filter(property => property.agentId === agent.id);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAgentForProperty = (agentId: string) => {
    return allAgents.find(a => a.id === agentId);
  };
  
  const getStatusDisplay = () => {
    if (agent.status === 'active') return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    if (isInTrial(agent)) return { text: `Trial (${getDaysRemainingInTrial(agent)} days left)`, color: 'text-blue-600', bg: 'bg-blue-100' };
    if (agent.status === 'trial_expired') return { text: 'Trial Expired', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-100' };
  };
  
  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Agent Header */}
      <section className="bg-gradient-primary text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="bg-white bg-opacity-20 p-8 rounded-full">
              <User className="h-16 w-16 text-white" />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{agent.name}</h1>
                <div className={`px-3 py-1 rounded-full ${statusDisplay.bg}`}>
                  <span className={`text-sm font-medium ${statusDisplay.color}`}>
                    {statusDisplay.text}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{agent.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(agent.registeredAt)}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => {
                    const message = encodeURIComponent(`Hi ${agent.name}, I saw your profile on LagosRentals and I'm interested in your properties. Can we discuss?`);
                    const whatsappUrl = `https://wa.me/${agent.whatsappNumber.replace('+', '')}?text=${message}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>Contact via WhatsApp</span>
                </button>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">{agentProperties.length}</div>
                  <div className="text-sm text-blue-200">Active Listings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Stats */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Trial Status Alert */}
          {agent.status === 'trial_expired' && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="text-lg font-bold text-orange-900">Trial Period Expired</h3>
                  <p className="text-orange-800">
                    Your free trial has ended. Upgrade to continue receiving client inquiries and maintain full visibility.
                  </p>
                  <button className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {isInTrial(agent) && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Free Trial Active</h3>
                  <p className="text-blue-800">
                    You have {getDaysRemainingInTrial(agent)} days remaining in your free trial. 
                    Enjoy unlimited listings and full platform access!
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{agentProperties.length}</div>
              <div className="text-gray-600">Total Listings</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {agent.status === 'active' ? '✓' : isInTrial(agent) ? '∞' : '⚠️'}
              </div>
              <div className="text-gray-600">
                {agent.status === 'active' ? 'Active Plan' : isInTrial(agent) ? 'Trial Active' : 'Needs Upgrade'}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Verified</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {new Set(agentProperties.map(p => p.location.split(',')[0])).size}
              </div>
              <div className="text-gray-600">Areas Covered</div>
            </div>
          </div>

          {/* Subscription Status */}
          {agent.subscriptionPlan && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {agent.subscriptionPlan.toUpperCase()} SUBSCRIBER
                    </h3>
                    <p className="text-gray-600">
                      Active until {agent.subscriptionExpiry ? formatDate(agent.subscriptionExpiry) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Remaining Listings</div>
                  <div className="text-2xl font-bold text-green-600">
                    {agent.subscriptionPlan === 'premium' ? '8+' : '4+'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Agent's Properties */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <MapPin className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900">Properties by {agent.name}</h2>
          </div>
          
          {agentProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties listed yet</h3>
              <p className="text-gray-600">This agent hasn't added any properties to their portfolio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agentProperties.map(property => {
                const propertyAgent = getAgentForProperty(property.agentId);
                return propertyAgent ? (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    agent={propertyAgent} 
                    clientViewCounts={clientViewCounts}
                    onUpdateViewCounts={onUpdateViewCounts}
                  />
                ) : null;
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AgentProfile;