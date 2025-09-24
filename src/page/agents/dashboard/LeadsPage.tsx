// src/pages/agent/LeadsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  User,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
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
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  propertyId: string;
  message: string;
  status: "new" | "contacted" | "interested" | "not_interested" | "closed";
  type: "email" | "phone" | "whatsapp";
  date: string;
}

const LeadsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    // Simulate loading leads
    const loadLeads = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from your API
        const mockLeads: Lead[] = [
          {
            id: "1",
            name: "Chinedu Okoro",
            email: "chinedu@email.com",
            phone: "+234 812 345 6789",
            property: "Luxury 3-Bedroom Apartment in Lekki",
            propertyId: "prop1",
            message:
              "I'm interested in viewing this property. When is it available?",
            status: "new",
            type: "email",
            date: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            name: "Amina Yusuf",
            email: "amina@email.com",
            phone: "+234 813 456 7890",
            property: "2-Bedroom Flat in Victoria Island",
            propertyId: "prop2",
            message: "Please call me to discuss the rental terms.",
            status: "contacted",
            type: "phone",
            date: "2024-01-14T15:45:00Z",
          },
          {
            id: "3",
            name: "Tunde Adewale",
            email: "tunde@email.com",
            phone: "+234 814 567 8901",
            property: "Studio Apartment in Ikeja",
            propertyId: "prop3",
            message: "WhatsApp me the exact location please.",
            status: "interested",
            type: "whatsapp",
            date: "2024-01-13T09:15:00Z",
          },
        ];
        setLeads(mockLeads);
      } catch (error) {
        toast.error("Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadLeads();
    }
  }, [user?.id]);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesType = typeFilter === "all" || lead.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const updateLeadStatus = async (
    leadId: string,
    newStatus: Lead["status"]
  ) => {
    try {
      // In a real app, you would update via API
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
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
        return "outline";
      case "not_interested":
        return "destructive";
      case "closed":
        return "default";
      default:
        return "outline";
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

  if (loading) {
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
          Manage and track your property inquiries ({filteredLeads.length}{" "}
          total)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search leads..."
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
                  <SelectItem value="not_interested">Not Interested</SelectItem>
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
              <label className="text-sm font-medium mb-2 block">Sort By</label>
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

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Leads Found</h3>
            <p className="text-muted-foreground">
              {leads.length === 0
                ? "You haven't received any leads yet."
                : "No leads match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{lead.name}</h3>
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status.replace("_", " ")}
                      </Badge>
                      <div className="flex items-center text-muted-foreground">
                        {getTypeIcon(lead.type)}
                        <span className="ml-1 text-sm capitalize">
                          {lead.type}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Property
                        </p>
                        <p className="font-medium">{lead.property}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium">{lead.email}</p>
                        <p className="text-sm">{lead.phone}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground">Message</p>
                      <p className="text-sm">{lead.message}</p>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(lead.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Select
                      value={lead.status}
                      onValueChange={(value: Lead["status"]) =>
                        updateLeadStatus(lead.id, value)
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
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
