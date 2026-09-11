// src/components/property/ApartmentCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Square, Heart, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { propertyService } from "@/services/propertyService";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Property } from "@/types";
import { useAmenities } from "@/hooks/useAmenities";

interface ApartmentCardProps {
  property: Property;
  showActions?: boolean;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
}

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
    totalPackagePrice,
    location,
    bedrooms,
    bathrooms,
    area,
    images,
    amenities: rawAmenities,
    listingType,
    isFeatured,
    status,
    views,
    matchScore,
    matchReasons,
  } = property;

  const mainImage = images?.[0] || "/placeholder.svg";
  const amenities = useAmenities(rawAmenities);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasPackagePrice = totalPackagePrice > 0;
  const displayPrice = hasPackagePrice ? totalPackagePrice : price;
  const priceLabel = hasPackagePrice
    ? "Total package"
    : listingType === "short-let"
      ? "Per night"
      : "Annual rent";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      propertyService.toggleFavorite(_id);
      onFavorite(_id);
    }
  };

  return (
    <Card className="group h-full gap-0 overflow-hidden border-green-100 py-0 transition-all duration-300 hover:border-green-300 hover:shadow-lg">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={mainImage}
          alt={title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1.5">
          {isFeatured && (
            <Badge className="bg-green-600 text-white border-0">Featured</Badge>
          )}
          {typeof matchScore === "number" && (
            <Badge className="border-0 bg-[#129B36] text-white">{matchScore}% match</Badge>
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

      <CardHeader className="gap-0 px-5 pb-3 pt-5">
        <div className="flex flex-col gap-2 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between">
          <h3 className="min-w-0 text-lg font-semibold leading-6 text-gray-900 line-clamp-2">
            {title}
          </h3>
          <div className="shrink-0 min-[360px]:text-right">
            <div className="text-base font-bold text-green-600">
              {formatPrice(displayPrice)}
            </div>
            <div className="text-xs text-gray-500">{priceLabel}</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 mt-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-5 pb-4">
        {matchReasons && matchReasons.length > 0 && (
          <p className="mb-3 line-clamp-2 text-xs font-medium text-green-700">
            {matchReasons.slice(0, 3).join(" · ")}
          </p>
        )}
        {/* Property Features */}
        <div className="mb-3 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-white text-gray-700 border-gray-300">
            <Eye className="h-3 w-3" />
            {views || 0} views
          </Badge>
        </div>
        {/* Rental Period for Short-lets */}
        {listingType === "short-let" && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Minimum 2 nights</span>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="mt-auto grid grid-cols-1 gap-2 px-5 pb-5 pt-0 min-[340px]:grid-cols-2">
          <Button
            variant="outline"
            asChild
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
            <Link to={`/properties/${_id}`}>View Details</Link>
          </Button>
          <Button
            asChild
            className="w-full bg-green-600 text-white hover:bg-green-700">
            <Link to={`/properties/${_id}`}>View Contact</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApartmentCard;
