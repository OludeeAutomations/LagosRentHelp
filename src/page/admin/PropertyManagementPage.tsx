import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { propertyService } from "@/services/propertyService";
import { Property } from "@/types";

const extractProperties = (payload: any): Property[] => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const getApprovalBadgeVariant = (
  approvalStatus?: Property["approvalStatus"],
) => {
  if (approvalStatus === "approved") return "default";
  if (approvalStatus === "rejected") return "destructive";
  return "secondary";
};

const PropertyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const canManage = user?.role === "admin" || user?.role === "super_admin";
  const canApprove = user?.role === "super_admin";

  const loadProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getManageAll();
      setProperties(extractProperties(response.data || response));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load managed properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!canManage) {
      navigate("/");
      return;
    }

    loadProperties();
  }, [user, canManage, navigate]);

  const handleApproval = async (
    propertyId: string,
    approvalStatus: "approved" | "rejected",
  ) => {
    const approvalNote =
      approvalStatus === "rejected"
        ? window.prompt("Why is this property being rejected?", "") || undefined
        : undefined;

    if (approvalStatus === "rejected" && !approvalNote) {
      toast.error("Please add a rejection reason");
      return;
    }

    setActionId(propertyId);
    try {
      await propertyService.updateApproval(propertyId, {
        approvalStatus,
        approvalNote,
      });
      toast.success(`Property ${approvalStatus}`);
      await loadProperties();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to mark property as ${approvalStatus}`);
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (propertyId: string) => {
    setActionId(propertyId);
    try {
      await propertyService.deactivate(propertyId);
      toast.success("Property marked as rented");
      await loadProperties();
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark property as rented");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    setActionId(propertyId);
    try {
      await propertyService.delete(propertyId);
      toast.success("Property deleted");
      await loadProperties();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete property");
    } finally {
      setActionId(null);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Properties
            </h1>
            <p className="text-gray-600 mt-2">
              Upload, review, and maintain assigned properties.
            </p>
          </div>

          <Button asChild>
            <Link to="/admin/properties/new">Add Property</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Management Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-500">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="text-sm text-gray-500">
                No managed properties found yet.
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => {
                  const owner =
                    typeof property.ownerId === "object"
                      ? property.ownerId?.name
                      : property.ownerId;
                  const contact =
                    typeof property.contactUserId === "object"
                      ? property.contactUserId?.name
                      : property.contactUserId;

                  return (
                    <div
                      key={property._id}
                      className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                              {property.title}
                            </h2>
                            <Badge
                              variant={getApprovalBadgeVariant(
                                property.approvalStatus,
                              )}
                              className="capitalize">
                              {property.approvalStatus || "approved"}
                            </Badge>
                            <Badge
                              variant={
                                property.status === "available"
                                  ? "outline"
                                  : "secondary"
                              }
                              className="capitalize">
                              {property.status || "available"}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600">
                            {property.location}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>Owner: {owner || "Unassigned"}</span>
                            <span>Contact: {contact || "Not set"}</span>
                          </div>
                          {property.approvalNote && (
                            <p className="text-sm text-amber-700">
                              Approval note: {property.approvalNote}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" asChild>
                            <Link to={`/properties/${property._id}`}>View</Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to={`/admin/properties/${property._id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          {property.status !== "rented" && (
                            <Button
                              variant="outline"
                              onClick={() => handleDeactivate(property._id)}
                              disabled={actionId === property._id}>
                              Mark Rented
                            </Button>
                          )}

                          {canApprove && (
                            <>
                              <Button
                                onClick={() =>
                                  handleApproval(property._id, "approved")
                                }
                                disabled={actionId === property._id}>
                                Approve
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  handleApproval(property._id, "rejected")
                                }
                                disabled={actionId === property._id}>
                                Reject
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(property._id)}
                                disabled={actionId === property._id}>
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyManagementPage;
