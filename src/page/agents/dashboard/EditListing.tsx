// components/EditListing.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Property } from "@/types";
import CreateListing from "./CreatList"; // Typo fixed from 'CreatList'
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { agent } = useAuthStore();
  const { getPropertyById } = usePropertyStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const loadProperty = async () => {
      // 1. Basic Validation
      if (!id) {
        toast.error("Invalid property ID");
        navigate("/agent-dashboard");
        return;
      }

      if (!agent) {
        toast.error("Please log in as an agent");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);

        // 2. Fetch Property
        const foundProperty = await getPropertyById(id);

        if (!foundProperty) {
          throw new Error("Property not found");
        }

        // 3. ✅ Extract existing images
        if (foundProperty.images && foundProperty.images.length > 0) {
          // If images are URLs, use them directly
          // If they're file paths, you might need to prepend a base URL
          const images = foundProperty.images.map((img) => {
            if (typeof img === "string" && img.startsWith("http")) {
              return img;
            }
            // Assuming images are stored as relative paths
            return `${import.meta.env.VITE_API_BASE_URL || ""}/uploads/${img}`;
          });
          setExistingImages(images);
        }

        // 4. ✅ ROBUST ID EXTRACTION
        let propertyOwnerId = foundProperty.agentId;

        // If it's an object (populated), get the _id from it
        if (typeof propertyOwnerId === "object" && propertyOwnerId !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          propertyOwnerId = (propertyOwnerId as any)._id || propertyOwnerId;
        }

        // B: If A failed, check the 'agent' object
        if (!propertyOwnerId && foundProperty.agent) {
          propertyOwnerId =
            foundProperty.agent._id || foundProperty.agent.agentId;
        }

        // 5. ✅ NORMALIZATION
        const ownerIdString = String(propertyOwnerId);
        const currentAgentIdString = String(agent._id);

        console.log("🔒 Authorization Check:", {
          PropertyOwnerID: ownerIdString,
          CurrentAgentID: currentAgentIdString,
          Match: ownerIdString === currentAgentIdString,
        });

        // 6. ✅ COMPARISON
        if (ownerIdString !== currentAgentIdString) {
          setIsAuthorized(false);
          toast.error("You don't have permission to edit this property");
          return;
        }

        // Success
        setProperty(foundProperty);
        setIsAuthorized(true);
      } catch (error: any) {
        console.error("Error loading property:", error);
        toast.error(error.message || "Failed to load property");
        navigate("/agent-dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, agent, navigate, getPropertyById]);

  // --- Render States ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to edit this property.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/agent-dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
            <CardDescription>
              The property you're trying to edit doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/agent-dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CreateListing
      editMode={true}
      property={{
        ...property,
        totalPackagePrice: property.totalPackagePrice || 0,
        amenities: property.amenities || [],
      }}
      existingImages={existingImages}
    />
  );
};

export default EditListing;
