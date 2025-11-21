// components/EditListing.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePropertyStore } from "@/stores/propertyStore";
import { useAuthStore } from "@/stores/authStore";
import { Property } from "@/types";
import CreateListing from "./CreatList";
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

  // Helper function to compare IDs (handles string vs ObjectId)
  const compareIds = (id1: any, id2: any): boolean => {
    if (!id1 || !id2) return false;

    // Convert both to string for comparison
    const str1 = typeof id1 === "object" ? id1.toString() : String(id1);
    const str2 = typeof id2 === "object" ? id2.toString() : String(id2);

    return str1 === str2;
  };

  useEffect(() => {
    const loadProperty = async () => {
      console.log("loadProperty called with id:", id);

      if (!id) {
        console.log("No ID provided");
        toast.error("Invalid property ID");
        navigate("/agent-dashboard");
        return;
      }

      if (!agent) {
        console.log("No agent found");
        toast.error("Please log in as an agent");
        navigate("/login");
        return;
      }

      console.log("AGENT FROM STORE:", agent);
      console.log("AGENT ID:", agent._id);
      console.log("AGENT ID TYPE:", typeof agent._id);

      try {
        setIsLoading(true);
        console.log("Starting property load from API...");

        // Fetch property from API
        const foundProperty = await getPropertyById(id);
        console.log("Fetched property from API:", foundProperty);

        if (!foundProperty) {
          throw new Error("Property not found");
        }

        // Detailed string comparison
        const propertyAgentIdStr = String(foundProperty.agent?.agentId);
        const currentAgentIdStr = String(agent._id);
        console.log("Property agent.agentId as string:", propertyAgentIdStr);
        console.log("Current agent ID as string:", currentAgentIdStr);
        console.log(
          "String comparison:",
          propertyAgentIdStr === currentAgentIdStr
        );

        // Use the helper function for comparison
        const idsMatch = compareIds(foundProperty.agent?.agentId, agent._id);
        console.log("Helper function comparison:", idsMatch);
        console.log("=== END CHECK ===");

        // Check if the property has an agent assigned
        if (!foundProperty.agent || !foundProperty.agent.agentId) {
          console.log("Property has no agent profile assigned");
          setIsAuthorized(false);
          toast.error("This property has no agent profile assigned");
          return;
        }

        // FIXED: Use the helper function to compare IDs
        if (!idsMatch) {
          console.log(
            "Ownership check failed - agent doesn't own this property"
          );
          setIsAuthorized(false);
          toast.error("You don't have permission to edit this property");
          return;
        }

        console.log("Property loaded successfully:", foundProperty);
        setProperty(foundProperty);
        setIsAuthorized(true);
      } catch (error: any) {
        console.error("Error loading property:", error);
        toast.error(error.message || "Failed to load property");
        navigate("/agent-dashboard");
      } finally {
        console.log("Loading complete");
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, agent, navigate, getPropertyById]);

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
  console.log("Rendering CreateListing with property:", property);
  return <CreateListing editMode={true} property={property} />;
};

export default EditListing;
