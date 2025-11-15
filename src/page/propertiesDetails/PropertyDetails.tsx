/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  User,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  ArrowLeft,
  Eye,
  Home,
  Car,
  Wifi,
  Utensils,
  Snowflake,
  Tv,
  ShowerHead,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAgentStore } from "@/stores/agentStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, Agent } from "@/types"; // Make sure to import Agent type
import { useAmenities } from "@/hooks/useAmenities";
import PropertyMap from "@/components/common/PropertyMap";

// Type guard to check if agentId is an object
const isAgentObject = (agentId: any): agentId is Agent => {
  return agentId && typeof agentId === "object" && "name" in agentId;
};

// Type guard to check if agentId is a string
const isAgentString = (agentId: any): agentId is string => {
  return typeof agentId === "string";
};

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, toggleFavorite, userFavorites, getPropertyById } =
    usePropertyStore();
  const { user } = useAuthStore();
  const { agents } = useAgentStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const amenities = useAmenities(property?.amenities);

  // Get the agent information safely
  const getAgentInfo = () => {
    if (!property) return null;

    if (isAgentObject(property.agentId)) {
      // agentId is already an Agent object
      return property.agentId;
    } else if (isAgentString(property.agentId)) {
      // agentId is a string ID, find the agent in the agents store
      const agentId = property.agentId;
      return agents.find((a) => a.id === agentId || a._id === agentId);
    }

    return null;
  };

  const agent = getAgentInfo();

  useEffect(() => {
    console.log("URL ID:", id);

    const fetchProperty = async () => {
      if (!id) {
        console.error("No ID found in URL");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        console.log("Property not in store, fetching from API...");
        const propertyData = await getPropertyById(id);
        if (propertyData) {
          console.log("Fetched property from API:", propertyData);
          setProperty(propertyData);
        } else {
          console.error("Failed to fetch property from API");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, properties, getPropertyById]);

  // Check if this property is favorited
  const isFavorite = userFavorites.includes(property?._id || "");

  // Handle WhatsApp message
  const handleWhatsAppClick = () => {
    const whatsappNumber = agent?.whatsappNumber;
    if (!whatsappNumber) {
      toast.error("Agent WhatsApp number not available");
      return;
    }

    const message = `Hello, I'm interested in your property: ${property?.title}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Handle phone call
  const handlePhoneCall = () => {
    const phoneNumber = agent?.phone;
    if (!phoneNumber) {
      toast.error("Agent phone number not available");
      return;
    }
    window.location.href = `tel:${phoneNumber}`;
  };

  // Toggle favorite status
  const handleToggleFavorite = () => {
    console.log("Adding to properties");
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }

    const propertyId = property?._id;
    if (propertyId) {
      toggleFavorite(propertyId);
    }
  };

  // Share property
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-xl mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-32 mb-6" />

              <div className="flex gap-4 mb-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>

              <Skeleton className="h-32 w-full" />
            </div>

            <div className="lg:col-span-1">
              <Skeleton className="h-64 mb-6" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Property Not Found</CardTitle>
            <CardDescription className="text-gray-600">
              The property you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/properties")}
              className="bg-green-600 hover:bg-green-700 text-white">
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-gray-600 hover:bg-gray-100">
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={`text-gray-600 hover:bg-gray-100 ${
                isFavorite ? "text-red-500" : ""
              }`}>
              <Heart
                className="h-5 w-5"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Property Images */}
        <div className="mb-8">
          <div className="relative h-80 md:h-96 rounded-xl overflow-hidden mb-4 border border-gray-200">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}

            <div className="absolute bottom-4 right-4">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-white text-gray-700 border-gray-300">
                <Eye className="h-3 w-3" />
                {property.views || 0} views
              </Badge>
            </div>
          </div>

          {property.images && property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((image: string, index: number) => (
                <button
                  key={index}
                  className={`h-20 rounded-md overflow-hidden border-2 ${
                    index === activeImageIndex
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200"
                  }`}
                  onClick={() => setActiveImageIndex(index)}>
                  <img
                    src={image}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-4">
                ₦{property.price.toLocaleString()}
                {property.listingType === "rent" && (
                  <span className="text-lg font-normal text-gray-600">
                    /month
                  </span>
                )}
                {property.listingType === "short-let" && (
                  <span className="text-lg font-normal text-gray-600">
                    /night
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <Bed className="h-5 w-5 mr-2 text-gray-500" />
                  <span>
                    {property.bedrooms}{" "}
                    {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Bath className="h-5 w-5 mr-2 text-gray-500" />
                  <span>
                    {property.bathrooms}{" "}
                    {property.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Square className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{property.area} sq ft</span>
                </div>
              </div>
            </div>

            {/* Property Details Tabs */}
            <Tabs defaultValue="description" className="mb-8">
              <TabsList className="bg-gray-100">
                <TabsTrigger
                  value="description"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="features"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Features
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                  Location
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-4">
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              </TabsContent>

              <TabsContent value="features" className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700">
                      {amenity === "parking" && (
                        <Car className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      {amenity === "wifi" && (
                        <Wifi className="h-4 w-4 mr-2 text-blue-500" />
                      )}
                      {amenity === "kitchen" && (
                        <Utensils className="h-4 w-4 mr-2 text-orange-500" />
                      )}
                      {amenity === "ac" && (
                        <Snowflake className="h-4 w-4 mr-2 text-cyan-500" />
                      )}
                      {amenity === "hot_water" && (
                        <ShowerHead className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      {amenity === "tv" && (
                        <Tv className="h-4 w-4 mr-2 text-purple-500" />
                      )}
                      <span className="capitalize">
                        {amenity.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location" className="pt-4">
                <Card className="border-gray-200 p-0">
                  <CardContent className="p-0">
                    <PropertyMap
                      address={property.location}
                      height="400px"
                      showStreetViewButton={true}
                    />
                    <div className=" p-4">
                      <h4 className="font-semibold mb-2 text-gray-900">
                        Address
                      </h4>
                      <p className="text-gray-600">{property.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Agent Card */}
            <Card className="sticky top-24 mb-6 border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative">
                    {agent?.idPhoto ? (
                      <img
                        src={agent.idPhoto}
                        alt={agent.name || "Agent"}
                        className="h-16 w-16 rounded-full object-cover cursor-pointer border-2 border-green-500"
                        onClick={() => setShowAgentModal(true)}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-green-300">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">
                      {agent?.name || "Property Agent"}
                    </h3>
                    <p className="text-sm text-gray-600">Real Estate Agent</p>
                    {agent?.verificationStatus === "verified" && (
                      <Badge className="mt-1 bg-green-100 text-green-800 border-0">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleWhatsAppClick}
                    disabled={!user || !agent?.whatsappNumber}>
                    <MessageCircle className="h-4 w-4" />
                    Chat on WhatsApp
                  </Button>

                  <Button
                    onClick={handlePhoneCall}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    disabled={!user || !agent?.phone}>
                    <Phone className="h-4 w-4" />
                    Call Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Details Card */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span className="capitalize text-gray-900">
                    {property.type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Listing Type</span>
                  <span className="capitalize text-gray-900">
                    {property.listingType === "short-let"
                      ? "Short Let"
                      : property.listingType}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="text-gray-900">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bathrooms</span>
                  <span className="text-gray-900">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Area</span>
                  <span className="text-gray-900">{property.area} sq ft</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    className={`capitalize ${
                      property.status === "available"
                        ? "bg-green-100 text-green-800 border-0"
                        : "bg-gray-100 text-gray-800 border-0"
                    }`}>
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Listed</span>
                  <span className="text-gray-900">
                    {property.createdAt
                      ? new Date(property.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Agent Modal */}
      {showAgentModal && agent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Agent Profile
              </h3>
              <button
                onClick={() => setShowAgentModal(false)}
                className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="text-center mb-6">
              {agent.idPhoto ? (
                <img
                  src={agent.idPhoto}
                  alt={agent.name || "Agent"}
                  className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-2 border-green-500"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 border-2 border-green-300">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}

              <h4 className="text-lg font-semibold text-gray-900">
                {agent.name || "Property Agent"}
              </h4>
              <p className="text-gray-600">Real Estate Agent</p>

              {agent.verificationStatus === "verified" && (
                <Badge className="mt-2 bg-green-100 text-green-800 border-0">
                  Verified Agent
                </Badge>
              )}
            </div>

            {agent.bio && (
              <div className="mb-6">
                <h5 className="font-semibold mb-2 text-gray-900">About</h5>
                <p className="text-gray-600">{agent.bio}</p>
              </div>
            )}

            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Address</span>
                <span className="text-gray-900">
                  {agent.address || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">WhatsApp</span>
                <span className="text-gray-900">
                  {agent.whatsappNumber || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge
                  className={`capitalize ${
                    agent.verificationStatus === "verified"
                      ? "bg-green-100 text-green-800 border-0"
                      : agent.verificationStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-0"
                      : "bg-red-100 text-red-800 border-0"
                  }`}>
                  {agent.verificationStatus}
                </Badge>
              </div>
            </div>

            <Button
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppClick}
              disabled={!agent.whatsappNumber}>
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
