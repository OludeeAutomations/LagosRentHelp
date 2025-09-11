import React from "motion/react";
import { motion } from "framer-motion";

interface PropertyCategoriesProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const categories = [
  { id: "", label: "All", icon: "🏠" },
  { id: "1-bedroom", label: "1 Bedroom", icon: "🛏️" },
  { id: "2-bedroom", label: "2 Bedroom", icon: "🛏️🛏️" },
  { id: "3-bedroom", label: "3 Bedroom", icon: "🛏️🛏️🛏️" },
  { id: "duplex", label: "Duplex", icon: "🏘️" },
  { id: "studio", label: "Studio", icon: "🎨" },
  { id: "mini-flat", label: "Mini Flat", icon: "🔑" },
  { id: "short-let", label: "Short Let", icon: "🏨" },
];

const PropertyCategories: React.FC<PropertyCategoriesProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategorySelect(category.id)}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id
              ? "bg-[#129B36] text-white"
              : "bg-white text-[#0E0E0E] border border-gray-200 hover:border-[#129B36]"
          }`}>
          <span className="mr-2">{category.icon}</span>
          {category.label}
        </motion.button>
      ))}
    </div>
  );
};

export default PropertyCategories;
