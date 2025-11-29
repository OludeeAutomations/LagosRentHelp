// src/page/favorites/FavoritesPage.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ApartmentCard from "@/components/common/ApartmentCard";
import { Property } from "@/types";
import { userService } from "@/services/userService";
import SearchFilters from "@/components/common/SearchFilters";
import PropertyCategories from "@/components/common/PropertyCategories";
import SearchResultsHeader from "@/components/common/SearchResultsHeader";
import { Skeleton } from "@/components/ui/skeleton";

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [filters, setFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    category: "",
  });

  // Fetch favorites from backend
useEffect(() => {
  const loadFavorites = async () => {
    setLoading(true);
    try {
      const response = await userService.fetchFavorites();

      // Extract the actual array from `response.data`
      const favoritesArray = Array.isArray(response?.data)
        ? response.data
        : [];

      setFavorites(favoritesArray);
    } catch (error) {
      console.error(error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  loadFavorites();
}, []);


  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      category: "",
    });
    setSelectedCategory("");
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    // Update UI immediately
    setFavorites((prev) => prev.filter((p) => p._id !== propertyId));

    // TODO: Call backend to remove from favorites
    try {
      await userService.removeFromFavorites(propertyId);
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  // Apply filters
  const filteredFavorites = favorites.filter((property) => {
    if (selectedCategory && property.type !== selectedCategory) return false;
    if (
      filters.location &&
      !property.location.toLowerCase().includes(filters.location.toLowerCase())
    )
      return false;
    if (filters.type && property.type !== filters.type) return false;
    if (filters.minPrice && property.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && property.price > Number(filters.maxPrice)) return false;
    if (filters.bedrooms && property.bedrooms < Number(filters.bedrooms)) return false;
    if (filters.bathrooms && property.bathrooms < Number(filters.bathrooms)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#0E0E0E] mb-2">My Favorites</h1>
          <p className="text-[#7F8080]">
            Browse and manage your favorite properties.
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <PropertyCategories
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </motion.div>

          {/* Favorites List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Results Header */}
            <SearchResultsHeader
              resultsCount={filteredFavorites.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filters={filters}
            />

            {/* Favorites Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredFavorites.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No favorites found</h3>
                <p className="text-gray-500">
                  Add properties to your favorites to see them here.
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredFavorites.map((property) => (
                  <ApartmentCard
                    key={property._id}
                    property={property}
                    onFavorite={handleRemoveFavorite}
                    isFavorite={true}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
