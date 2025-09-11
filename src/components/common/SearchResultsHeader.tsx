/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Grid, List } from "lucide-react";

interface SearchResultsHeaderProps {
  resultsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  filters: any;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  resultsCount,
  viewMode,
  onViewModeChange,
  filters,
}) => {
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value && value !== ""
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#0E0E0E]">
            {resultsCount} {resultsCount === 1 ? "Property" : "Properties"}{" "}
            Found
          </h3>
          <p className="text-[#7F8080] text-sm">
            {filters.location && `in ${filters.location}`}
            {activeFiltersCount > 0 &&
              ` • ${activeFiltersCount} filter${
                activeFiltersCount !== 1 ? "s" : ""
              } applied`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg ${
              viewMode === "grid"
                ? "bg-[#129B36] text-white"
                : "bg-gray-100 text-[#7F8080]"
            }`}>
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg ${
              viewMode === "list"
                ? "bg-[#129B36] text-white"
                : "bg-gray-100 text-[#7F8080]"
            }`}>
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsHeader;
