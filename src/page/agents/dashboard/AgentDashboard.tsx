/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Users,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  Clock,
  Home,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAgentStore } from "@/stores/agentStore";
import { useLeadStore } from "@/stores/leadStore";
import { Link, useNavigate } from "react-router-dom";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { canAgentListProperties } from "@/utils/agentUtils";

const AgentDashboard: React.FC = () => {
  const { user, agent } = useAuthStore();
  const { fetchAgentProfile, loading: isLoading, error } = useAgentStore();
  const { leads, fetchAgentLeads, loading: leadsLoading } = useLeadStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  // Local state to prevent premature redirection during hydration
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const canCreateListing = agent && canAgentListProperties(agent);
  const navigate = useNavigate();

  // ✅ FIX 1: Dedicated Auth Check Effect
  // This runs immediately on mount/refresh
  useEffect(() => {
    // If we have a user, mark checked.
    // If no user, redirect immediately.
    if (!user) {
      navigate("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, [user, navigate]);

  // ✅ FIX 2: Fetch Agent Profile only if User exists
  useEffect(() => {
    if (user?._id && !agent) {
      fetchAgentProfile();
    }
  }, [user?._id, agent, fetchAgentProfile]);

  // ✅ FIX 3: Load Data
  useEffect(() => {
    if (user?._id) {
      loadRecentLeads(user._id);
      loadAgentProperties(user._id);
    }
  }, [user?._id]);

  const loadRecentLeads = async (agentId: string) => {
    try {
      await fetchAgentLeads(agentId, { limit: 5, page: 1 });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load leads";
      toast.error(errorMessage);
    }
  };

  const loadAgentProperties = async (agentId: string) => {
    try {
      if (agent?.listings) {
        setAgentProperties(agent.listings);
      }
    } catch (error: unknown) {
      console.error("Failed to load properties:", error);
      setAgentProperties([]);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchAgentProfile();
      if (user?._id) {
        await loadRecentLeads(user._id);
        await loadAgentProperties(user._id);
      }
      toast.success("Dashboard refreshed");
    } catch {
      toast.error("Failed to refresh dashboard");
    }
  };

  const getDaysLeft = () => {
    if (
      agent?.subscription?.status === "trial" &&
      agent.subscription.trialEndsAt
    ) {
      return Math.ceil(
        (new Date(agent.subscription.trialEndsAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
    }

    const verifiedAt =
      agent?.verifiedAt || (agent as any)?.dojahResponse?.verifiedAt;
    if (verifiedAt) {
      const verifiedDate = new Date(verifiedAt);
      const daysSinceVerification = Math.floor(
        (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceVerification < 7) {
        return 7 - daysSinceVerification;
      }
    }

    return 0;
  };

  const daysLeft = getDaysLeft();

  // ✅ FIX 4: Protect against rendering if user is not logged in
  if (!user) {
    return null; // Don't render anything while redirecting
  }

  // ✅ FIX 5: Show simple loading state while checking agent profile
  if (!isAuthChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Status Alert */}
      {agent && agent.verificationStatus && (
        <Alert
          className={`mb-6 ${
            agent.verificationStatus === "verified"
              ? "bg-green-100 border-green-300"
              : agent.verificationStatus === "pending"
              ? "bg-yellow-100 border-yellow-300"
              : "bg-red-100 border-red-300"
          }`}>
          {agent.verificationStatus === "verified" ? (
            <CheckCircle className="h-4 w-4 text-green-700" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-700" />
          )}
          <AlertTitle>
            {agent.verificationStatus === "verified"
              ? "Verified Agent"
              : agent.verificationStatus === "pending"
              ? "Verification in Progress"
              : "Verification Required"}
          </AlertTitle>
          <AlertDescription>
            {agent.verificationStatus === "verified" ? (
              "Congratulations! Your agent profile has been verified."
            ) : agent.verificationStatus === "pending" ? (
              <>
                Your agent verification is currently being reviewed.
                {agent.subscription?.status === "pending_verification" && (
                  <span className="block mt-1">
                    You'll get 2 weeks free listing after verification.
                  </span>
                )}
              </>
            ) : (
              <p>
                Please complete your agent verification to access all features.
                <Link
                  to="/agent-dashboard/settings"
                  className="underline text-sm font-bold ml-1">
                  Go to Settings
                </Link>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Home className="h-8 w-8 text-primary" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{agentProperties.length}</div>
            <div className="text-muted-foreground">Total Listings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{agent?.totalViews || 0}</div>
            <div className="text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-purple-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{agent?.totalLeads || 0}</div>
            <div className="text-muted-foreground">Total Leads</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">
              {agent?.responseRate || 0}%
            </div>
            <div className="text-muted-foreground">Response Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-red-500" />
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{daysLeft}</div>
            <div className="text-muted-foreground">
              {agent?.subscription?.status === "trial"
                ? "Trial Days Left"
                : "Grace Period Days"}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || leadsLoading}
          className="flex items-center gap-2">
          <RefreshCw
            className={`h-4 w-4 ${
              isLoading || leadsLoading ? "animate-spin" : ""
            }`}
          />
          Refresh Data
        </Button>
      </div>

      {/* Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          {/* <TabsTrigger value="leads">Leads</TabsTrigger> */}
          {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/agent-dashboard/leads">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads yet</p>
                  <p className="text-sm">
                    Leads will appear here when users contact you
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead._id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {lead.userId?.name || "Unknown User"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lead.userId?.email || "No email"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.propertyId?.title || "General Inquiry"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ₦
                          {lead.propertyId?.price?.toLocaleString() ||
                            "Price not set"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </p>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {lead.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          Via {lead.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2"
                  disabled={!canCreateListing}>
                  <Link to={canCreateListing ? "/create-listing" : "#"}>
                    <Plus className="h-8 w-8 text-primary" />
                    <span>Create Listing</span>
                    {!canCreateListing && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {agent && agent.verificationStatus !== "verified"
                          ? "Verify your account first"
                          : "Subscription required"}
                      </span>
                    )}
                  </Link>
                </Button>
                {/* <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2">
                  <Link to="/agent-dashboard/analytics">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <span>View Analytics</span>
                  </Link>
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... Listings and other tabs remain same ... */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>Manage your property listings</CardDescription>
            </CardHeader>
            <CardContent>
              {agentProperties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No listings yet</p>
                  <p className="text-sm mb-4">
                    Create your first listing to get started
                  </p>
                  <Button asChild disabled={!canCreateListing}>
                    <Link to={canCreateListing ? "/create-listing" : "#"}>
                      Create Listing
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentProperties.map((property) => (
                    <div
                      key={property._id}
                      className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{property.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {property.location}
                        </p>
                        <p className="text-sm">
                          ₦{property.price?.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          property.status === "available"
                            ? "default"
                            : "secondary"
                        }>
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>Track and manage your leads</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed lead management features coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>View your performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Required Alert */}
      {agent &&
        agent.verificationStatus === "verified" &&
        !canCreateListing && (
          <Alert className="mb-6 bg-orange-100 border-orange-300">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Subscription Required</AlertTitle>
            <AlertDescription>
              Your free trial has ended. Please subscribe to continue creating
              listings.
              {agent.freeListingWeeks > 0 && (
                <span className="block mt-1">
                  You have {agent.freeListingWeeks} free week(s) from referrals
                  available.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
};

export default AgentDashboard;
