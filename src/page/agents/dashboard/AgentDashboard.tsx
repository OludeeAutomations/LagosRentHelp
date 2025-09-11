import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Users,
  Eye,
  MessageCircle,
  BarChart3,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Link } from "react-router-dom";
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
import { agentService } from "@/services/agentService";
import { leadService } from "@/services/leadService";
import { AgentProfileResponse } from "@/types";

const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState<AgentProfileResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData(user.id);
    }
  }, [user?.id]);

  const loadDashboardData = async (agentId: string) => {
    setIsLoading(true);
    try {
      // Get profile with agent, user, properties, stats
      const profileResponse = await agentService.getProfile(agentId);
      setAgentData(profileResponse.data);

      // Get leads
      const leadsResponse = await leadService.getAll({
        agentId,
        limit: 5,
        page: 1,
      });
      setRecentLeads(leadsResponse.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (user?.id) {
      await loadDashboardData(user.id);
      toast.success("Dashboard refreshed");
    }
  };

  if (!agentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading agent data...</p>
      </div>
    );
  }

  const { agent, properties, stats } = agentData;

  // Trial days left
  const daysLeftInTrial = agent?.trialExpiresAt
    ? Math.ceil(
        (new Date(agent.trialExpiresAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div title="Dashboard">
      {" "}
      {/* Add this wrapper */}
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Home className="h-8 w-8 text-primary" />
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{properties.length}</div>
                <div className="text-muted-foreground">Total Listings</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="h-8 w-8 text-blue-500" />
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <div className="text-muted-foreground">Total Views</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-purple-500" />
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
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
                  {stats.conversionRate}%
                </div>
                <div className="text-muted-foreground">Conversion Rate</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-8 w-8 text-red-500" />
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{daysLeftInTrial}</div>
                <div className="text-muted-foreground">Trial Days Left</div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
      {/* Refresh Button */}
      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
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
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads yet</p>
                  <p className="text-sm">
                    Leads will appear here when users contact you
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {lead.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lead.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.property}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(lead.date).toLocaleDateString()}
                        </p>
                        <Badge
                          variant={
                            lead.status === "new"
                              ? "default"
                              : lead.status === "contacted"
                              ? "secondary"
                              : "outline"
                          }
                          className="mt-1 capitalize">
                          {lead.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {lead.type.replace("_", " ")}
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
                  className="h-auto py-6 flex-col gap-2">
                  <Link to="/create-listing">
                    <Plus className="h-8 w-8 text-primary" />
                    <span>Create Listing</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2">
                  <Link to="/agent-dashboard/messages">
                    <MessageCircle className="h-8 w-8 text-blue-500" />
                    <span>View Messages</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2">
                  <Link to="/agent-dashboard/analytics">
                    <FileText className="h-8 w-8 text-purple-500" />
                    <span>View Analytics</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>Manage your property listings</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                  ))}
                </div>
              ) : properties.length === 0 ? ( // Changed from agentProperties to properties
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No listings yet</p>
                  <p className="text-sm mb-4">
                    Create your first listing to get started
                  </p>
                  <Button asChild>
                    <Link to="/create-listing">Create Listing</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map(
                    (
                      property // Changed from agentProperties to properties
                    ) => (
                      <div
                        key={property._id}
                        className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{property.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property.location}
                          </p>
                          <p className="text-sm">
                            ₦{property.price.toLocaleString()}
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
                    )
                  )}
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
      {/* Verification Status */}
      {agent.verificationStatus === "pending" && (
        <Alert className="mb-6 bg-yellow-100 border-yellow-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification in Progress</AlertTitle>
          <AlertDescription>
            Your agent verification is currently being reviewed.
          </AlertDescription>
        </Alert>
      )}
      {agent.verificationStatus === "verified" && (
        <Alert className="mb-6 bg-green-100 border-green-300">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Verified Agent</AlertTitle>
          <AlertDescription>
            Congratulations! Your agent profile has been verified.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AgentDashboard;
