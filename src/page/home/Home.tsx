import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Shield,
  MessageCircle,
  CheckCircle,
  Home as HomeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import PropertySections from "@/components/common/PropertySections";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { properties, fetchProperties, loading } = usePropertyStore();
  const { user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fallback if video doesn't load within 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded && !videoError) {
        setVideoError(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [videoLoaded, videoError]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };
  const propertyTypes = [
    "1-bedroom",
    "2-bedroom",
    "3-bedroom",
    "duplex",
    "studio",
    "mini-flat",
    "short-let",
  ];
  console.log("Properties in Home component:", properties);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Filter properties by type
  const rentProperties = properties.filter(
    (property) => property.listingType === "rent"
  );

  const shortLetProperties = properties.filter(
    (property) => property.listingType === "short-let"
  );

  const handleFavorite = async (propertyId: string) => {
    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
        toast.success("Removed from favorites");
      } else {
        newFavorites.add(propertyId);
        toast.success("Added to favorites");
      }
      return newFavorites;
    });

    // Here you would typically call your API to update favorites
    // await propertyService.toggleFavorite(propertyId);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("location", searchTerm);
    if (selectedType) params.set("type", selectedType);
    if (priceRange) {
      switch (priceRange) {
        case "under-200k":
          params.set("maxPrice", "200000");
          break;
        case "200k-400k":
          params.set("minPrice", "200000");
          params.set("maxPrice", "400000");
          break;
        case "400k-600k":
          params.set("minPrice", "400000");
          params.set("maxPrice", "600000");
          break;
        case "over-600k":
          params.set("minPrice", "600000");
          break;
      }
    }

    navigate(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/search?type=${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Video Background */}
      <section className="relative py-20 h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata" // Better for performance
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1643389-pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1920"
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
            onCanPlayThrough={handleVideoLoad}>
            <source
              src="https://res.cloudinary.com/dsv4iggkz/video/upload/q_auto:low,w_1280,h_720,c_fill,f_mp4/v1755875417/Newly_Renovated_Room_Parlour_Self_Contain_TO_LET_In_Igbogbo_Baiyeku_Ikorodu_-_200k_Per_Annum._1_wxrz1s.mp4"
              type="video/mp4"
            />
            <source
              src="https://res.cloudinary.com/dsv4iggkz/video/upload/q_auto:low,w_1280,h_720,c_fill,f_webm/v1755875417/Newly_Renovated_Room_Parlour_Self_Contain_TO_LET_In_Igbogbo_Baiyeku_Ikorodu_-_200k_Per_Annum._1_wxrz1s.webm"
              type="video/webm"
            />
            {/* Fallback text for unsupported browsers */}
            Your browser does not support the video tag.
          </video>

          {/* Fallback background if video doesn't load */}
          {(videoError || !videoLoaded) && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1643389-pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=1920)",
              }}
            />
          )}

          {/* Loading state */}
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-white">Loading video...</div>
            </div>
          )}

          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/50 bg-opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}>
              Find Your Perfect Home in Lagos
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              The ultimate platform connecting property owners with tenants for
              both short-term stays and long-term rentals.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document
                    .getElementById("featured-properties")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="bg-white text-[#129B36] px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-2xl">
                Browse Listings
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearchBar(!showSearchBar)}
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#129B36] px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300">
                Search Properties
              </motion.button>
            </div>

            {/* Expandable Search Bar */}
            {showSearchBar && (
              <motion.div
                className="mt-8 max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-[#7F8080]" />
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-[#7F8080] focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm"
                    />
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm">
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                        className="text-[#0E0E0E]">
                        {type
                          .split("-")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </option>
                    ))}
                  </select>

                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent backdrop-blur-sm">
                    <option value="">Any Price</option>
                    <option value="under-200k" className="text-[#0E0E0E]">
                      Under ₦200k
                    </option>
                    <option value="200k-400k" className="text-[#0E0E0E]">
                      ₦200k - ₦400k
                    </option>
                    <option value="400k-600k" className="text-[#0E0E0E]">
                      ₦400k - ₦600k
                    </option>
                    <option value="over-600k" className="text-[#0E0E0E]">
                      Over ₦600k
                    </option>
                  </select>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSearch}
                    className="w-full flex items-center justify-center space-x-2 bg-white text-[#129B36] py-3 rounded-xl font-semibold">
                    <Filter className="h-5 w-5" />
                    <span>Search</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div
              className="text-center p-6 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}>
              <div className="w-12 h-12 bg-[#129B36]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="h-6 w-6 text-[#129B36]" />
              </div>
              <div className="text-2xl font-bold text-[#0E0E0E] mb-1">
                {properties.length}+
              </div>
              <div className="text-sm text-[#7F8080]">Active Properties</div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="w-12 h-12 bg-[#129B36]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-[#129B36]" />
              </div>
              <div className="text-2xl font-bold text-[#0E0E0E] mb-1">50+</div>
              <div className="text-sm text-[#7F8080]">Verified Agents</div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="w-12 h-12 bg-[#129B36]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-[#129B36]" />
              </div>
              <div className="text-2xl font-bold text-[#0E0E0E] mb-1">20+</div>
              <div className="text-sm text-[#7F8080]">Lagos Areas</div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="w-12 h-12 bg-[#129B36]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-[#129B36]" />
              </div>
              <div className="text-2xl font-bold text-[#0E0E0E] mb-1">100%</div>
              <div className="text-sm text-[#7F8080]">Trust & Safety</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#0E0E0E]">
            Browse by Category
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {propertyTypes.map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(type)}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-[#0E0E0E] hover:border-[#129B36] hover:text-[#129B36] transition-all duration-300">
                {type
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Property Sections */}
      <section id="featured-properties" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <PropertySections
            allProperties={properties}
            rentProperties={rentProperties}
            shortLetProperties={shortLetProperties}
            loading={loading}
            onFavorite={handleFavorite}
            favorites={favorites}
          />
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 bg-gradient-to-br from-[#129B36]/10 via-[#41614F]/10 to-[#129B36]/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0E0E0E] mb-4">
              Your Safety is Our Priority
            </h2>
            <p className="text-xl text-[#7F8080] max-w-2xl mx-auto">
              We've built comprehensive safety measures to protect you
              throughout your rental journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}>
              <div className="w-16 h-16 bg-[#129B36]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-[#129B36]" />
              </div>
              <h3 className="text-xl font-bold text-[#0E0E0E] mb-4 text-center">
                Verified Agents
              </h3>
              <p className="text-[#7F8080] text-center">
                Every agent undergoes rigorous verification including ID checks
                and background screening
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}>
              <div className="w-16 h-16 bg-[#129B36]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HomeIcon className="h-8 w-8 text-[#129B36]" />
              </div>
              <h3 className="text-xl font-bold text-[#0E0E0E] mb-4 text-center">
                Property Inspection
              </h3>
              <p className="text-[#7F8080] text-center">
                We encourage physical property inspections before any payments
                are made
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}>
              <div className="w-16 h-16 bg-[#129B36]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-[#129B36]" />
              </div>
              <h3 className="text-xl font-bold text-[#0E0E0E] mb-4 text-center">
                Secure Communication
              </h3>
              <p className="text-[#7F8080] text-center">
                Direct communication with verified agents through our secure
                messaging platform
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#129B36] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied tenants who found their perfect home
            through our platform
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/search")}
            className="bg-white text-[#129B36] px-8 py-4 rounded-xl font-semibold text-lg">
            Find Your Next Apartment
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Home;
