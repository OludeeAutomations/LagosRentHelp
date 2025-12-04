/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
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
  ShowerHead,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { useLeadStore } from "@/stores/leadStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { createLead, checkContactStatus } = useLeadStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const amenities = useAmenities(property?.amenities);

  // ✅ FIX: Get Agent Info directly from the property object
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

  // Handle keyboard shortcuts for image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return;

      switch (e.key) {
        case "Escape":
          closeImageModal();
          break;
        case "ArrowLeft":
          showPreviousImage();
          break;
        case "ArrowRight":
          showNextImage();
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetImage();
          }
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal]);

  const isFavorite = userFavorites.includes(property?._id || "");

  const handleWhatsAppClick = async () => {
    if (!user) {
      toast.error("Please login to contact agent");
      navigate("/login");
      return;
    }

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

  // Image Modal Functions
  const openImageModal = (index: number) => {
    setActiveImageIndex(index);
    setShowImageModal(true);
    setZoomLevel(1);
    setRotation(0);
    setIsFullscreen(false);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    document.body.style.overflow = "auto"; // Restore scrolling
  };

  const showNextImage = () => {
    if (!property?.images) return;
    setActiveImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
    resetImage();
  };

  const showPreviousImage = () => {
    if (!property?.images) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
    resetImage();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetImage = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!modalRef.current) return;

    if (!isFullscreen) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const downloadImage = () => {
    if (!property?.images?.[activeImageIndex]) return;

    const link = document.createElement("a");
    link.href = property.images[activeImageIndex];
    link.download = `property-${property.title}-${activeImageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div
            className="relative h-80 md:h-96 rounded-xl overflow-hidden mb-4 border border-gray-200 bg-black cursor-zoom-in"
            onClick={() => openImageModal(activeImageIndex)}>
            {property.images?.length > 0 ? (
              <img
                src={property.images[activeImageIndex]}
                alt={property.title}
                className="w-full h-full object-contain md:object-cover transition-transform duration-300 hover:scale-105"
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
            <div className="absolute top-4 right-4">
              <Button
                variant="secondary"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageModal(activeImageIndex);
                }}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Full View
              </Button>
            </div>
          </div>

          {property.images?.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-16 rounded-md overflow-hidden border-2 transition-all group cursor-pointer ${
                    idx === activeImageIndex
                      ? "border-green-500 opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
                  }`}>
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageModal(idx);
                    }}>
                    <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Rest of your existing content remains the same */}
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

      {/* Full-screen Image Modal */}
      {showImageModal && property.images && property.images.length > 0 && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeImageModal();
          }}>
          {/* Header with controls */}
          <div className="flex items-center justify-between p-4 bg-black/90 text-white">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeImageModal}
                className="text-white hover:bg-white/20">
                <X className="h-6 w-6" />
              </Button>
              <span className="text-sm font-medium">
                {activeImageIndex + 1} / {property.images.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={downloadImage}
                className="text-white hover:bg-white/20"
                title="Download image (Ctrl+S)">
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
                title="Toggle fullscreen (F)">
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden relative">
            {/* Navigation buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={showPreviousImage}
              className="absolute left-4 text-white hover:bg-white/20 z-10"
              title="Previous image (←)">
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={showNextImage}
              className="absolute right-4 text-white hover:bg-white/20 z-10"
              title="Next image (→)">
              <ChevronRight className="h-8 w-8" />
            </Button>

            {/* Image container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                ref={imageRef}
                src={property.images[activeImageIndex]}
                alt={`Property image ${activeImageIndex + 1}`}
                className="max-w-full max-h-full transition-transform duration-200 cursor-zoom-out"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle zoom on click
                  setZoomLevel((prev) => (prev === 1 ? 2 : 1));
                }}
                onWheel={(e) => {
                  e.preventDefault();
                  if (e.deltaY < 0) {
                    handleZoomIn();
                  } else {
                    handleZoomOut();
                  }
                }}
              />

              {/* Zoom level indicator */}
              {zoomLevel !== 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {Math.round(zoomLevel * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="p-4 bg-black/90 text-white">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="text-white  bg-primary border-white/30 hover:bg-white/20"
                title="Zoom out (Ctrl+-)"
                disabled={zoomLevel <= 0.5}>
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetImage}
                className="text-white bg-primary  border-white/30 hover:bg-white/20"
                title="Reset (Ctrl+0)"
                disabled={zoomLevel === 1 && rotation === 0}>
                <RotateCw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={rotateImage}
                className="text-white bg-primary border-white/30 hover:bg-white/20"
                title="Rotate 90°">
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="text-white bg-primary border-white/30 hover:bg-white/20"
                title="Zoom in (Ctrl++)"
                disabled={zoomLevel >= 5}>
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </Button>
            </div>

            {/* Thumbnail strip */}
            {property.images.length > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-2 overflow-x-auto py-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      resetImage();
                    }}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex
                        ? "border-green-500"
                        : "border-transparent opacity-60 hover:opacity-100"
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

            {/* Keyboard shortcuts help */}
            <div className="mt-2 text-center text-xs text-white/60">
              <span className="hidden md:inline">
                Use ← → to navigate, + - to zoom, F for fullscreen, ESC to close
              </span>
              <span className="md:hidden">
                Pinch to zoom, swipe to navigate
              </span>
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
