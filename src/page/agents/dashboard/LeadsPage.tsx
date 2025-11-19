// src/pages/agent/LeadsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  User,
  Search,
  Filter,
  CheckCircle,
  Clock,
  RefreshCw, // Add this import
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLeadStore } from "@/stores/leadStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const LeadsPage: React.FC = () => {
  const { user, agent } = useAuthStore();
  const {
    leads,
    fetchAgentLeads,
    updateLead,
    loading: leadsLoading,
  } = useLeadStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user?._id && agent) {
      loadLeads(user._id);
    }
  }, [user?._id, agent]);

  const loadLeads = async (agentId: string) => {
    try {
      if (agent) {
        await fetchAgentLeads(agentId, { limit: 100, page: 1 });
      }
    } catch (error) {
      toast.error("Failed to load leads");
    }
  };

  // Filter leads based on search and active tab
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.propertyId?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lead.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.userId?.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesType = typeFilter === "all" || lead.type === typeFilter;

    // Tab filtering
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "contacted" && lead.status === "contacted") ||
      (activeTab === "new" && (!lead.status || lead.status === "new")) ||
      (activeTab === "interested" && lead.status === "interested") ||
      (activeTab === "converted" && lead.status === "closed");

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  // Get contacted leads count for badge
  const contactedLeadsCount = leads.filter(
    (lead) => lead.status === "contacted"
  ).length;
  const newLeadsCount = leads.filter(
    (lead) => !lead.status || lead.status === "new"
  ).length;
  const interestedLeadsCount = leads.filter(
    (lead) => lead.status === "interested"
  ).length;
  const convertedLeadsCount = leads.filter(
    (lead) => lead.status === "closed"
  ).length;

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateLead(leadId, { status: newStatus });
      toast.success("Lead status updated");
    } catch (error) {
      toast.error("Failed to update lead status");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "interested":
        return "default";
      case "not_interested":
        return "destructive";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "contacted":
        return <Clock className="h-3 w-3 mr-1" />;
      case "closed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "whatsapp":
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const handleContactLead = (
    lead: any,
    method: "email" | "phone" | "whatsapp"
  ) => {
    switch (method) {
      case "email":
        if (lead.userId?.email) {
          const subject = `Follow up: ${
            lead.propertyId?.title || "Property Inquiry"
          }`;
          const body = `Hello ${
            lead.userId.name
          },\n\nI'm following up on your inquiry about ${
            lead.propertyId?.title || "the property"
          }.\n\nBest regards,\n${agent?.name || "Agent"}`;
          window.open(
            `mailto:${lead.userId.email}?subject=${encodeURIComponent(
              subject
            )}&body=${encodeURIComponent(body)}`,
            "_blank"
          );
        } else {
          toast.error("No email available for this lead");
        }
        break;
      case "phone":
        if (lead.userId?.phone) {
          window.open(`tel:${lead.userId.phone}`, "_blank");
        } else {
          toast.error("No phone number available for this lead");
        }
        break;
      case "whatsapp":
        if (lead.userId?.phone) {
          const message = `Hello ${
            lead.userId.name
          }, I'm following up on your inquiry about ${
            lead.propertyId?.title || "the property"
          }`;
          const encodedMessage = encodeURIComponent(message);
          window.open(
            `https://wa.me/${lead.userId.phone.replace(
              /\D/g,
              ""
            )}?text=${encodedMessage}`,
            "_blank"
          );
        } else {
          toast.error("No phone number available for WhatsApp");
        }
        break;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setActiveTab("all");
  };

  // Move renderLeadsList function inside the component but before the return
  const renderLeadsList = (leadsToRender: any[]) => {
    if (leadsToRender.length === 0) {
      return null; // Empty state is handled above
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {leadsToRender.length} of {leads.length} leads
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => user?._id && loadLeads(user._id)}
            disabled={leadsLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${leadsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {leadsToRender.map((lead) => (
          <Card key={lead._id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {lead.userId?.name || "Unknown User"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getStatusBadgeVariant(lead.status || "new")}>
                        {getStatusIcon(lead.status || "new")}
                        {(lead.status || "new").replace("_", " ")}
                      </Badge>
                      <div className="flex items-center text-muted-foreground">
                        {getTypeIcon(lead.type)}
                        <span className="ml-1 text-sm capitalize">
                          {lead.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Property</p>
                      <p className="font-medium">
                        {lead.propertyId?.title || "General Inquiry"}
                      </p>
                      {lead.propertyId?.price && (
                        <p className="text-sm text-muted-foreground">
                          ₦{lead.propertyId.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">
                        {lead.userId?.email || "No email"}
                      </p>
                      <p className="text-sm">
                        {lead.userId?.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="text-sm">{lead.message}</p>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(lead.timestamp).toLocaleDateString()} at{" "}
                    {new Date(lead.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Select
                    value={lead.status || "new"}
                    onValueChange={(value) =>
                      handleUpdateLeadStatus(lead._id, value)
                    }>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not_interested">
                        Not Interested
                      </SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactLead(lead, "email")}
                      title="Send Email">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactLead(lead, "phone")}
                      title="Call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactLead(lead, "whatsapp")}
                      title="WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Rest of the component JSX
  if (leadsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Leads Management</h1>
        <p className="text-muted-foreground">
          Manage and track your property inquiries ({leads.length} total leads)
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="relative">
            All Leads
            {leads.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {leads.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="new" className="relative">
            New
            {newLeadsCount > 0 && (
              <Badge variant="default" className="ml-2 h-5 w-5 p-0 text-xs">
                {newLeadsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contacted" className="relative">
            Contacted
            {contactedLeadsCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {contactedLeadsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="interested" className="relative">
            Interested
            {interestedLeadsCount > 0 && (
              <Badge variant="default" className="ml-2 h-5 w-5 p-0 text-xs">
                {interestedLeadsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="converted" className="relative">
            Converted
            {convertedLeadsCount > 0 && (
              <Badge variant="outline" className="ml-2 h-5 w-5 p-0 text-xs">
                {convertedLeadsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs">
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search by name, property, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not_interested">
                      Not Interested
                    </SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sort By
                </label>
                <Select defaultValue="newest">
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Leads Tab */}
        <TabsContent value="all" className="space-y-4">
          {renderLeadsList(filteredLeads)}
        </TabsContent>

        {/* New Leads Tab */}
        <TabsContent value="new" className="space-y-4">
          {renderLeadsList(filteredLeads)}
        </TabsContent>

        {/* Contacted Leads Tab */}
        <TabsContent value="contacted" className="space-y-4">
          {renderLeadsList(filteredLeads)}
        </TabsContent>

        {/* Interested Leads Tab */}
        <TabsContent value="interested" className="space-y-4">
          {renderLeadsList(filteredLeads)}
        </TabsContent>

        {/* Converted Leads Tab */}
        <TabsContent value="converted" className="space-y-4">
          {renderLeadsList(filteredLeads)}
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredLeads.length === 0 && !leadsLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Leads Found</h3>
            <p className="text-muted-foreground mb-4">
              {leads.length === 0
                ? "You haven't received any leads yet. They will appear here when users contact you."
                : "No leads match your current search and filter criteria."}
            </p>
            {(searchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              activeTab !== "all") && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeadsPage;
