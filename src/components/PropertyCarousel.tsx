import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from './PropertyCard';
import { Property, Agent, ClientViewCount } from '../types';

interface PropertyCarouselProps {
  properties: Property[];
  agents: Agent[];
  clientViewCounts: ClientViewCount[];
  onUpdateViewCounts: (viewCounts: ClientViewCount[]) => void;
  title: string;
  itemsPerPage?: number;
}

const PropertyCarousel: React.FC<PropertyCarouselProps> = ({
  properties,
  agents,
  clientViewCounts,
  onUpdateViewCounts,
  title,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const getAgentForProperty = (agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  };

  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentPage + 1} of {totalPages}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={prevPage}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={totalPages <= 1}
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextPage}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={totalPages <= 1}
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {currentProperties.map(property => {
          const agent = getAgentForProperty(property.agentId);
          return agent ? (
            <PropertyCard 
              key={property.id} 
              property={property} 
              agent={agent}
              clientViewCounts={clientViewCounts}
              onUpdateViewCounts={onUpdateViewCounts}
            />
          ) : null;
        })}
      </div>

      {/* Page indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentPage ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyCarousel;