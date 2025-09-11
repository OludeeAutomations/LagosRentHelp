// src/pages/agents/AgentContactPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Shield,
  User,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { useAgentStore } from "@/stores/agentStore";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AgentContactPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agentProfile, fetchAgentById, loading, error } = useAgentStore();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);

  // Extract data from agentProfile
  const agent = agentProfile?.agent;
  const userInfo = agentProfile?.user;
  const agentProperties = agentProfile?.properties || [];
  const agentStats = agentProfile?.stats;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (agentId) {
          await fetchAgentById(agentId);
        }
      } catch (error) {
        console.error("Failed to load agent data:", error);
        toast.error("Failed to load agent information");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [agentId, fetchAgentById]);

  const handleWhatsAppClick = () => {
    if (!agent) return;

    const message = `Hello, I'm interested in your properties. I found you on LagosRentHelp.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${agent.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCallClick = () => {
    if (!agent) return;
    window.open(`tel:${agent.whatsappNumber}`, "_self");
  };

  const handleEmailClick = () => {
    if (!userInfo || !user) return;
    window.open(
      `mailto:${userInfo.email}?subject=Property Inquiry from LagosRentHelp`,
      "_self"
    );
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent || !userInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Agent Not Found</CardTitle>
            <CardDescription>
              {error ||
                "The agent you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Contact {userInfo.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>About {userInfo.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Agent Bio */}
                  {agent.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Professional Bio</h3>
                      <p className="text-muted-foreground">{agent.bio}</p>
                    </div>
                  )}

                  {/* Verification Status */}
                  <div>
                    <h3 className="font-semibold mb-2">Verification Status</h3>
                    <Badge
                      variant={
                        agent.verificationStatus === "verified"
                          ? "default"
                          : agent.verificationStatus === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="capitalize">
                      {agent.verificationStatus}
                      {agent.verificationStatus === "verified" && (
                        <Shield className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                    {agent.verificationStatus === "verified" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        This agent has been verified by our team
                      </p>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{agent.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{agent.whatsappNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{userInfo.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Stats */}
                  <div>
                    <h3 className="font-semibold mb-2">Agent Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">
                          {agentProperties.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Properties
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">
                          {agentStats?.totalLeads || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Leads
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Contact Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Agent Profile */}
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mr-4">
                      {agent.idPhoto ? (
                        <img
                          src={agent.idPhoto}
                          alt={userInfo.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{userInfo.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Real Estate Agent
                      </p>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleWhatsAppClick}>
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Message
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleCallClick}>
                    <Phone className="h-4 w-4" />
                    Call Agent
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleEmailClick}
                    disabled={!user}>
                    <Mail className="h-4 w-4" />
                    {user ? "Send Email" : "Login to Email"}
                  </Button>

                  {/* Verification Badge */}
                  {agent.verificationStatus === "verified" && (
                    <div className="flex items-center justify-center mt-4 text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Verified Agent</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Agent's Properties */}
        {agentProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle>
                  Agent's Properties ({agentProperties.length})
                </CardTitle>
                <CardDescription>
                  Properties listed by {userInfo.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agentProperties.slice(0, 4).map((property) => (
                    <div key={property._id} className="border rounded-lg p-4">
                      <h4 className="font-semibold">{property.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {property.location}
                      </p>
                      <p className="font-bold text-primary mt-2">
                        ₦{property.price.toLocaleString()}
                        {property.listingType === "rent" && "/month"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        asChild>
                        <Link to={`/properties/${property._id}`}>
                          View Property
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
                {agentProperties.length > 4 && (
                  <div className="text-center mt-6">
                    <Button variant="outline" asChild>
                      <Link to={`/agents/${agent.id}/properties`}>
                        View All Properties
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AgentContactPage;
