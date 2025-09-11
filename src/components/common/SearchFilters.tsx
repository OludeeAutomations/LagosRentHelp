/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface SearchFiltersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters: any;
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const handleInputChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#0E0E0E]">Filters</h2>
        <button
          onClick={onClearFilters}
          className="text-[#129B36] text-sm hover:underline">
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#7F8080]" />
            <input
              type="text"
              placeholder="Enter location..."
              value={filters.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#129B36] focus:border-transparent"
            />
          </div>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
            Property Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#129B36] focus:border-transparent">
            <option value="">All Types</option>
            <option value="1-bedroom">1 Bedroom</option>
            <option value="2-bedroom">2 Bedroom</option>
            <option value="3-bedroom">3 Bedroom</option>
            <option value="duplex">Duplex</option>
            <option value="studio">Studio</option>
            <option value="mini-flat">Mini Flat</option>
            <option value="short-let">Short Let</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
            Price Range (₦)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleInputChange("minPrice", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#129B36] focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange("maxPrice", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#129B36] focus:border-transparent"
            />
          </div>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms}
            onChange={(e) => handleInputChange("bedrooms", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#129B36] focus:border-transparent">
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Bathrooms Filter */}
        <div>
          <label className="block text-sm font-medium text-[#0E0E0E] mb-2">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms}
            onChange={(e) => handleInputChange("bathrooms", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#129B36] focus:border-transparent">
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilters;
