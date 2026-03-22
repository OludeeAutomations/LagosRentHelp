import React from "react";
import { Eye, Home, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types";

interface PropertyImageGalleryProps {
  activeImageIndex: number;
  onImageChange: (index: number) => void;
  onOpenModal: (index: number) => void;
  property: Property;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  activeImageIndex,
  onImageChange,
  onOpenModal,
  property,
}) => {
  return (
    <div className="mb-8">
      <div
        className="relative h-80 md:h-96 rounded-xl overflow-hidden mb-4 border border-gray-200 bg-black cursor-zoom-in"
        onClick={() => onOpenModal(activeImageIndex)}>
        {property.images?.length > 0 ? (
          <img
            src={property.images[activeImageIndex]}
            alt={property.title}
            className="w-full h-full object-contain md:object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Home className="h-16 w-16 text-gray-400" />
          </div>
        )}

        <div className="absolute bottom-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            <Eye className="h-3 w-3 mr-1" /> {property.views} views
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          <Button
            variant="secondary"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(activeImageIndex);
            }}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Full View
          </Button>
        </div>
      </div>

      {property.images?.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {property.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => onImageChange(idx)}
              className={`h-16 rounded-md overflow-hidden border-2 transition-all group cursor-pointer ${
                idx === activeImageIndex
                  ? "border-green-500 opacity-100"
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
              }`}>
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(idx);
                }}>
                <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;
