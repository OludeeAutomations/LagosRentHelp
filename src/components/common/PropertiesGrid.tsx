// src/components/common/PropertiesGrid.tsx
import React from "react";
import { Property } from "@/types";
import ApartmentCard from "./ApartmentCard";

interface PropertiesGridProps {
  properties: Property[];
  viewMode: "grid" | "list";
  onFavorite?: (propertyId: string) => void;
  favorites?: Set<string>;
}

const PropertiesGrid: React.FC<PropertiesGridProps> = ({
  properties,
  viewMode,
  onFavorite,
  favorites = new Set(),
}) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-6">
        {properties.map((property) => (
          <div key={property._id} className="border rounded-lg p-6">
            <ApartmentCard
              property={property}
              showActions={true}
              onFavorite={onFavorite}
              isFavorite={favorites.has(property._id)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
      {properties.map((property) => (
        <ApartmentCard
          key={property._id}
          property={property}
          showActions={true}
          onFavorite={onFavorite}
          isFavorite={favorites.has(property._id)}
        />
      ))}
    </div>
  );
};

export default PropertiesGrid;
