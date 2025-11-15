// src/components/property/ApartmentCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { propertyService } from "@/services/propertyService";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Property } from "@/types"; // Import Agent type
import { useAmenities } from "@/hooks/useAmenities";

interface ApartmentCardProps {
  property: Property;
  showActions?: boolean;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
}

// Define a type for possible agentId structures

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  property,
  showActions = true,
  onFavorite,
  isFavorite = false,
}) => {
  const {
    _id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    images,
    amenities: rawAmenities,
    listingType,
    isFeatured,
    status,
    agentId,
  } = property;

  const mainImage = images?.[0] || "/placeholder-property.jpg";
  const amenities = useAmenities(rawAmenities);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getRentalPeriod = () => {
    switch (listingType) {
      case "rent":
        return "/month";
      case "short-let":
        return "/night";
      default:
        return "";
    }
  };

  const getAgentId = (): string => {
    if (typeof agentId === "string") return agentId;

    // Handle object types safely without 'any'
    if (agentId && typeof agentId === "object") {
      const agentObj = agentId as { id?: string; _id?: string };
      return agentObj.id || agentObj._id || "unknown-agent";
    }

    return "unknown-agent";
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      propertyService.toggleFavorite(_id);
      onFavorite(_id);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border-green-100 hover:border-green-300">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {isFeatured && (
            <Badge className="bg-green-600 text-white border-0">Featured</Badge>
          )}
          <Badge
            variant={listingType === "rent" ? "default" : "secondary"}
            className="capitalize bg-green-100 text-green-800 border-0">
            {listingType === "short-let" ? "Short Let" : listingType}
          </Badge>
          {status && (
            <Badge
              variant={status === "available" ? "default" : "secondary"}
              className="capitalize bg-green-100 text-green-800 border-0">
              {status}
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        {showActions && onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
            onClick={handleFavoriteClick}>
            <Heart
              className={`h-5 w-5 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
          </Button>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
            {title}
          </h3>
          <div className="text-right">
            <div className=" text-xs md:text-sm font-bold text-green-600">
              {formatPrice(price)}
            </div>
            <div className="text-sm text-gray-500">{getRentalPeriod()}</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 mt-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Property Features */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>
                {bedrooms} bed{bedrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>
                {bathrooms} bath{bathrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{area} sq ft</span>
            </div>
          </div>
        </div>

        {/* Amenities Preview */}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {amenities.slice(0, 3).map((amenity, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs capitalize bg-green-50 text-green-700 border-green-200">
                {amenity}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs text-gray-500 border-gray-300">
                +{amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rental Period for Short-lets */}
        {listingType === "short-let" && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Minimum 2 nights</span>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex justify-between pt-0">
          <Button
            variant="outline"
            asChild
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
            <Link to={`/properties/${_id}`}>View Details</Link>
          </Button>
          <Button
            asChild
            className="flex-1 ml-2 bg-green-600 hover:bg-green-700 text-white">
            <Link to={`/agents/${getAgentId()}`}>Contact Agent</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApartmentCard;
