import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../../stores/useStore";

const SearchContainer: React.FC = () => {
  const { setSearchFilters } = useStore();
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const locations = [
    "Lekki",
    "Ikeja",
    "Surulere",
    "Victoria Island",
    "Ikoyi",
    "Yaba",
  ];
  const apartmentTypes = [
    "1-bedroom",
    "2-bedroom",
    "3-bedroom",
    "Duplex",
    "Studio",
    "Short-let",
  ];

  const handleSearch = () => {
    setSearchFilters({ location, type });
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto text-black"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Location</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md"
            value={location}
            onChange={(e) => setLocation(e.target.value)}>
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">
            Apartment Type
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-md"
            value={type}
            onChange={(e) => setType(e.target.value)}>
            <option value="">Select Type</option>
            {apartmentTypes.map((aptType) => (
              <option key={aptType} value={aptType}>
                {aptType}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full md:w-auto bg-primary-green text-white px-6 py-3 rounded-md font-semibold"
            onClick={handleSearch}>
            Search
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchContainer;
