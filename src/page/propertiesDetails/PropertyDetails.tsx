/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bath,
  Bed,
  Heart,
  MapPin,
  Share2,
  Square,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyMap from "@/components/common/PropertyMap";
import { useAmenities } from "@/hooks/useAmenities";
import { useAuthStore } from "@/stores/authStore";
import { useLeadStore } from "@/stores/leadStore";
import { usePropertyStore } from "@/stores/propertyStore";
import { Property } from "@/types";
import PropertyContactCard from "./components/PropertyContactCard";
import PropertyContactModal from "./components/PropertyContactModal";
import PropertyFeatureIcon from "./components/PropertyFeatureIcon";
import PropertyImageGallery from "./components/PropertyImageGallery";
import PropertyImageModal from "./components/PropertyImageModal";
import { usePropertyImageGallery } from "./hooks/usePropertyImageGallery";
import { ListingContact } from "./types";

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userFavorites, toggleFavorite, getPropertyById } = usePropertyStore();
  const { user } = useAuthStore();
  const { createLead, checkContactStatus } = useLeadStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const propertyWithContact = property as (Property & { agent?: ListingContact }) | null;

  const amenities = useAmenities(property?.amenities);
  const contact: ListingContact | null =
    (typeof property?.contactUserId === "object"
      ? (property.contactUserId as ListingContact)
      : null) ||
    propertyWithContact?.agent ||
    (typeof property?.agentId === "object"
      ? (property.agentId as unknown as ListingContact)
      : null);
  const contactId =
    contact?._id ||
    (typeof property?.contactUserId === "string" ? property.contactUserId : null) ||
    contact?.agentId ||
    (typeof property?.agentId === "string" ? property.agentId : null);

  const gallery = usePropertyImageGallery({
    imageCount: property?.images?.length || 0,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const data = await getPropertyById(id);
        if (data) {
          setProperty(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, getPropertyById]);

  useEffect(() => {
    if (user && contactId) {
      checkContactStatus(contactId);
    }
  }, [user, contactId, checkContactStatus]);

  const isFavorite = userFavorites.includes(property?._id || "");

  const handleWhatsAppClick = async () => {
    if (!user) {
      toast.error("Please login to contact the listing owner");
      navigate("/login");
      return;
    }

    const whatsapp = contact?.whatsapp || contact?.whatsappNumber;
    if (!whatsapp) {
      toast.error("WhatsApp number not available");
      return;
    }

    createLead({
      agentId: contactId,
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
      toast.error("Please login to contact the listing owner");
      navigate("/login");
      return;
    }

    if (!contact?.phone) {
      toast.error("Phone number not available");
      return;
    }

    createLead({
      agentId: contactId,
      type: "phone",
      propertyId: property?._id,
    }).catch(console.error);

    window.location.href = `tel:${contact.phone}`;
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }

    if (property?._id) {
      toggleFavorite(property._id);
    }
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
      return;
    }

    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const downloadImage = () => {
    if (!property?.images?.[gallery.activeImageIndex]) return;

    const link = document.createElement("a");
    link.href = property.images[gallery.activeImageIndex];
    link.download = `property-${property.title}-${gallery.activeImageIndex + 1}.jpg`;
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

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/properties")}>Browse Properties</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <PropertyImageGallery
          activeImageIndex={gallery.activeImageIndex}
          onImageChange={gallery.setActiveImageIndex}
          onOpenModal={gallery.openImageModal}
          property={property}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    N{property.price.toLocaleString()}
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
                  <span className="font-medium">{property.bathrooms} Baths</span>
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
                  {amenities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-gray-700 capitalize">
                      <PropertyFeatureIcon feature={item} />
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
                    <div className="p-4">
                      <h4 className="font-semibold mb-2 text-gray-900">Address</h4>
                      <p className="text-gray-600">{property.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <PropertyContactCard
              contact={contact}
              onCall={handlePhoneCall}
              onChat={handleWhatsAppClick}
              onOpen={() => setShowContactModal(true)}
            />

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
                  <span className="font-medium capitalize">{property.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant={property.status === "available" ? "default" : "secondary"}
                    className="capitalize">
                    {property.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PropertyContactModal
        contact={contact}
        isOpen={showContactModal}
        onCall={handlePhoneCall}
        onChat={handleWhatsAppClick}
        onClose={() => setShowContactModal(false)}
      />

      <PropertyImageModal
        activeImageIndex={gallery.activeImageIndex}
        imageRef={gallery.imageRef}
        images={property.images || []}
        isFullscreen={gallery.isFullscreen}
        isOpen={gallery.showImageModal}
        modalRef={gallery.modalRef}
        rotation={gallery.rotation}
        zoomLevel={gallery.zoomLevel}
        onClose={gallery.closeImageModal}
        onDownload={downloadImage}
        onNext={gallery.showNextImage}
        onPrevious={gallery.showPreviousImage}
        onReset={gallery.resetImage}
        onRotate={gallery.rotateImage}
        onSelectImage={(index) => {
          gallery.setActiveImageIndex(index);
          gallery.resetImage();
        }}
        onToggleFullscreen={gallery.toggleFullscreen}
        onZoomIn={gallery.handleZoomIn}
        onZoomOut={gallery.handleZoomOut}
        setZoomLevel={gallery.setZoomLevel}
      />
    </div>
  );
};

export default PropertyDetails;
