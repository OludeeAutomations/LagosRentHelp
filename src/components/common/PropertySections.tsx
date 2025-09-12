// src/components/home/PropertySections.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Property } from "@/types";
import ApartmentCard from "./ApartmentCard";

interface PropertySectionsProps {
  allProperties: Property[];
  rentProperties: Property[];
  shortLetProperties: Property[];
  loading?: boolean;
  onFavorite?: (propertyId: string) => void;
  favorites?: Set<string>;
}

const PropertySections: React.FC<PropertySectionsProps> = ({
  allProperties,
  rentProperties,
  shortLetProperties,
  loading = false,
  onFavorite,
  favorites = new Set(),
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const SectionHeader = ({
    title,
    subtitle,
    viewAllLink,
  }: {
    title: string;
    subtitle: string;
    viewAllLink: string;
  }) => (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">{subtitle}</p>
      </div>
      <Button
        variant="outline"
        asChild
        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
        <Link to={viewAllLink}>View All</Link>
      </Button>
    </div>
  );

  const PropertyGrid = ({ properties }: { properties: Property[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <ApartmentCard
          key={property._id}
          property={property}
          onFavorite={onFavorite}
          isFavorite={favorites.has(property._id)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-16">
      {/* All Properties Section */}
      <section className="px-4 md:px-6 lg:px-8">
        <SectionHeader
          title="Featured Properties"
          subtitle="Discover our curated selection of premium properties"
          viewAllLink="/search"
        />
        <PropertyGrid properties={allProperties.slice(0, 8)} />
      </section>

      {/* Rent Properties Section */}
      <section className="px-4 md:px-6 lg:px-8">
        <SectionHeader
          title="Properties for Rent"
          subtitle="Find your perfect long-term rental home"
          viewAllLink="/search?listingType=rent"
        />
        <PropertyGrid properties={rentProperties.slice(0, 4)} />
      </section>

      {/* Short-let Properties Section */}
      <section className="px-4 md:px-6 lg:px-8">
        <SectionHeader
          title="Short-let Apartments"
          subtitle="Perfect for vacations and short stays"
          viewAllLink="/search?listingType=short-let"
        />
        <PropertyGrid properties={shortLetProperties.slice(0, 4)} />
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-green-50 rounded-lg mx-4 md:mx-6 lg:mx-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-900">
          Can't Find What You're Looking For?
        </h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our agents are ready to help you find your dream property. With
          thousands of listings across Lagos, we'll help you find the perfect
          match.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white">
            <Link to="/search">Browse All Properties</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default PropertySections;
