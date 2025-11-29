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
import { useLeadStore } from "@/stores/leadStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@/types";
import { useAmenities } from "@/hooks/useAmenities";
import PropertyMap from "@/components/common/PropertyMap";

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userFavorites, toggleFavorite, getPropertyById } = usePropertyStore();
  const { user } = useAuthStore();
  const {
    createLead,
    checkContactStatus,
    loading: leadLoading,
  } = useLeadStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const amenities = useAmenities(property?.amenities);

  // ✅ FIX: Get Agent Info directly from the property object
  // Your API returns property.agent, so we use that.
  const agent =
    property?.agent ||
    (typeof property?.agentId === "object" ? property.agentId : null);
  const agentId =
    agent?._id ||
    agent?.agentId ||
    (typeof property?.agentId === "string" ? property?.agentId : null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getPropertyById(id);
        if (data) setProperty(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id, getPropertyById]);

  useEffect(() => {
    if (user && agentId) {
      checkContactStatus(agentId);
    }
  }, [user, agentId, checkContactStatus]);

  const isFavorite = userFavorites.includes(property?._id || "");

  const handleWhatsAppClick = async () => {
    if (!user) {
      toast.error("Please login to contact agent");
      navigate("/login");
      return;
    }

    // Use whatsapp property from your API response
    const whatsapp = agent?.whatsapp || agent?.whatsappNumber;

    if (!whatsapp) {
      toast.error("Agent WhatsApp number not available");
      return;
    }

    createLead({
      agentId: agentId,
      type: "whatsapp",
      propertyId: property?._id,
    }).catch(console.error);

    const message = `Hello, I'm interested in your property: ${property?.title}`;
    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handlePhoneCall = async () => {
    if (!user) {
      toast.error("Please login to contact agent");
      navigate("/login");
      return;
    }

    if (!agent?.phone) {
      toast.error("Agent phone number not available");
      return;
    }

    createLead({
      agentId: agentId,
      type: "phone",
      propertyId: property?._id,
    }).catch(console.error);

    window.location.href = `tel:${agent.phone}`;
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }
    if (property?._id) toggleFavorite(property._id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this property: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-96 w-full rounded-xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!property)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/properties")}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-red-500" : ""}>
              <Heart
                className="h-5 w-5"
                fill={isFavorite ? "currentColor" : "none"}
              />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Images */}
        <div className="mb-8">
          <div className="relative h-80 md:h-96 rounded-xl overflow-hidden mb-4 border border-gray-200 bg-black">
            {property.images?.length > 0 ? (
              <img
                src={property.images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-contain md:object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                <Eye className="h-3 w-3 mr-1" /> {property.views} views
              </Badge>
            </div>
          </div>

          {property.images?.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-16 rounded-md overflow-hidden border-2 transition-all ${
                    idx === activeImageIndex
                      ? "border-green-500 opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}>
                  <img
                    src={img}
                    alt=""
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
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" /> {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    ₦{property.price.toLocaleString()}
                  </div>
                  <span className="text-gray-500 capitalize">
                    /{property.listingType === "rent" ? "year" : "day"}
                  </span>
                </div>
              </div>

              <div className="flex gap-6 border-y border-gray-100 py-4 my-6">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{property.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">
                    {property.bathrooms} Baths
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{property.area} sq ft</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="description" className="mb-8">
              <TabsList className="w-full justify-start bg-gray-100 p-1">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="pt-4 text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </TabsContent>

              <TabsContent value="features" className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-700 capitalize">
                      {item === "wifi" ? (
                        <Wifi className="h-4 w-4 text-blue-500" />
                      ) : item.includes("pool") ? (
                        <ShowerHead className="h-4 w-4 text-cyan-500" />
                      ) : item === "parking" ? (
                        <Car className="h-4 w-4 text-green-500" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                      {item.replace(/_/g, " ")}
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
                </Card>{" "}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="flex items-center gap-4 mb-6 cursor-pointer"
                  onClick={() => setShowAgentModal(true)}>
                  <div className="relative">
                    {agent?.photo ? (
                      <img
                        src={agent.photo}
                        alt={agent.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-green-500"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-green-300">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {agent?.verificationStatus === "verified" && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <Badge
                          variant="default"
                          className="h-4 w-4 p-0 rounded-full bg-green-500 border-2 border-white"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg hover:underline decoration-green-500 underline-offset-4">
                      {agent?.name || "Agent"}
                    </h3>
                    <p className="text-sm text-gray-500">View Profile</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleWhatsAppClick}
                    disabled={!agent?.whatsapp && !agent?.whatsappNumber}>
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={handlePhoneCall}
                    disabled={!agent?.phone}>
                    <Phone className="mr-2 h-4 w-4" /> Call Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Listed</span>
                  <span className="font-medium">
                    {property.createdAt
                      ? new Date(property.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">
                    {property.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant={
                      property.status === "available" ? "default" : "secondary"
                    }
                    className="capitalize">
                    {property.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Agent Modal */}
      {showAgentModal && agent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowAgentModal(false)}>
          <div
            className="bg-white rounded-xl max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAgentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              ✕
            </button>

            <div className="text-center">
              <img
                src={agent.photo || "/placeholder-user.jpg"}
                alt={agent.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-100"
              />
              <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
              {agent.verificationStatus === "verified" && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-4">
                  Verified Agent
                </Badge>
              )}

              <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">State</span>
                  <span className="font-medium capitalize">
                    {agent.state || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">City</span>
                  <span className="font-medium capitalize">
                    {agent.city || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleWhatsAppClick}
                  className="bg-green-600 hover:bg-green-700">
                  WhatsApp
                </Button>
                <Button onClick={handlePhoneCall} variant="outline">
                  Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for Amenities
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default PropertyDetails;
