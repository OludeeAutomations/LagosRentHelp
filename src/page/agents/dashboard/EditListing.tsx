// components/EditListing.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Property } from "@/types";
import CreateListing from "./CreatList"; // Fixed import name
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
  const { properties, fetchProperty } = usePropertyStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
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

        // First, try to find property in store
        let foundProperty = properties.find((p) => p._id === id);

        // If not in store, fetch from API using the store method
        if (!foundProperty) {
          foundProperty = await fetchProperty(id);
        }

        if (!foundProperty) {
          throw new Error("Property not found");
        }

        // Check if the agent owns this property
        if (foundProperty.agentId !== agent._id) {
          setIsAuthorized(false);
          toast.error("You don't have permission to edit this property");
          return;
        }

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
  }, [id, agent, properties, navigate, fetchProperty]);

  // Show loading state
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

  // Show unauthorized message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to edit this property. You can only edit
              properties that you own.
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

  // Show property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Property Not Found</CardTitle>
            <CardDescription>
              The property you're trying to edit doesn't exist or may have been
              removed.
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

  // Render the CreateListing component in edit mode
  return <CreateListing editMode={true} property={property} />;
};

export default EditListing;
