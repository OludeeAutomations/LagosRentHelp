/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import SearchFilters from "@/components/common/SearchFilters";
import SearchResultsHeader from "@/components/common/SearchResultsHeader";
import PropertiesGrid from "@/components/common/PropertiesGrid";
import PropertyCategories from "@/components/common/PropertyCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search } from "lucide-react";
import type { PropertyFilters } from "@/services/propertyService";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, fetchProperties, loading, error, pagination } = usePropertyStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );

  // Extract filters from URL params
  const currentFilters = {
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    category: searchParams.get("category") || "",
  };

  const queryKey = searchParams.toString();
  const queryFilters = useMemo<PropertyFilters>(() => {
    const params = new URLSearchParams(queryKey);
    const listingType = params.get("listingType");
    return {
      page: Math.max(1, Number(params.get("page")) || 1),
      limit: 24,
      location: params.get("location") || undefined,
      type: params.get("type") || undefined,
      category: params.get("category") || undefined,
      listingType: listingType === "rent" || listingType === "short-let" ? listingType : undefined,
      minPrice: Number(params.get("minPrice")) || undefined,
      maxPrice: Number(params.get("maxPrice")) || undefined,
      bedrooms: Number(params.get("bedrooms")) || undefined,
      bathrooms: Number(params.get("bathrooms")) || undefined,
      sortBy: "newest",
    };
  }, [queryKey]);

  useEffect(() => {
    void fetchProperties(queryFilters);
  }, [fetchProperties, queryFilters]);

  useEffect(() => {
    // Update selected category when URL params change
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams();

    // Add all filters to URL params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params);
  };

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams);

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    // Remove other filters when selecting a category
    params.delete("type");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("bedrooms");
    params.delete("bathrooms");
    params.delete("page");

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const filteredProperties = properties;

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Error Loading Properties
              </h3>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={() => void fetchProperties(queryFilters)}
                className="mt-4 bg-[#129B36] text-white px-4 py-2 rounded-md">
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8">
          <h1 className="text-3xl font-bold text-[#0E0E0E] mb-4">
            {selectedCategory
              ? `${selectedCategory.replace("-", " ")} Properties`
              : "All Properties"}
          </h1>
          <p className="text-[#7F8080]">
            {selectedCategory
              ? `Browse our selection of ${selectedCategory.replace(
                  "-",
                  " "
                )} properties in Lagos`
              : "Browse through our curated selection of properties in Lagos"}
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8">
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
            className="lg:col-span-1">
            <SearchFilters
              filters={currentFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </motion.div>

          {/* Properties List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3">
            {/* Results Header */}
            <SearchResultsHeader
              resultsCount={pagination.total}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filters={currentFilters}
            />

            {/* Properties Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">
                    No properties found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {Object.values(currentFilters).some((filter) => filter)
                      ? "Try adjusting your search criteria"
                      : "No properties are currently available. Check back later."}
                  </p>
                  {Object.values(currentFilters).some((filter) => filter) && (
                    <button
                      onClick={clearFilters}
                      className="bg-[#129B36] text-white px-4 py-2 rounded-md">
                      Clear Filters
                    </button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <PropertiesGrid
                  properties={filteredProperties}
                  viewMode={viewMode}
                />
                {pagination.pages > 1 && (
                  <nav aria-label="Property result pages" className="mt-8 flex items-center justify-center gap-3">
                    <button type="button" disabled={pagination.page <= 1 || loading} onClick={() => changePage(pagination.page - 1)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                    <span className="text-sm text-gray-600">Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong></span>
                    <button type="button" disabled={pagination.page >= pagination.pages || loading} onClick={() => changePage(pagination.page + 1)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                  </nav>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
