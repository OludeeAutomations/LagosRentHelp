import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, FileSearch2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DashboardSummaryBanner from "@/components/common/DashboardSummaryDecoration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminListingService, type AdminListing } from "@/services/adminListingService";
import { useAuthStore } from "@/stores/authStore";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const PropertyManagementPage = () => {
  const user = useAuthStore((state) => state.user);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      setListings(await adminListingService.getAll());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const counts = useMemo(() => ({
    total: listings.length,
    available: listings.filter((listing) => listing.status === "available").length,
    rented: listings.filter((listing) => listing.status === "rented").length,
    lagosRentHelp: listings.filter((listing) => listing.createdBy === user?._id).length,
  }), [listings, user?._id]);

  const changeStatus = async (listing: AdminListing) => {
    const status = listing.status === "rented" ? "available" : "rented";
    setActionId(listing._id);
    try {
      await adminListingService.updateStatus(listing._id, status);
      setListings((current) => current.map((item) =>
        item._id === listing._id ? { ...item, status } : item,
      ));
      toast.success(`Listing marked ${status}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the listing.");
    } finally {
      setActionId(null);
    }
  };

  const remove = async (listing: AdminListing) => {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return;
    setActionId(listing._id);
    try {
      await adminListingService.delete(listing._id);
      setListings((current) => current.filter((item) => item._id !== listing._id));
      toast.success("Listing deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the listing.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <DashboardSummaryBanner
        eyebrow="LagosRentHelp inventory"
        title="Property listings"
        description="Publish and manage LagosRentHelp properties while retaining oversight of landlord listings."
        items={[
          { label: "All listings", value: loading ? "—" : counts.total, icon: Building2 },
          { label: "LagosRentHelp listings", value: loading ? "—" : counts.lagosRentHelp, icon: Building2 },
          { label: "Available", value: loading ? "—" : counts.available, icon: Building2 },
          { label: "Rented", value: loading ? "—" : counts.rented, icon: Building2 },
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadListings()} disabled={loading} className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button asChild className="bg-white text-[#0e7d2b] hover:bg-green-50">
              <Link to="/admin/properties/new"><Plus /> Add listing</Link>
            </Button>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Listing inventory</CardTitle>
            <p className="mt-1 text-sm text-gray-500">LagosRentHelp listings are labelled separately from landlord-submitted properties.</p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-gray-500">Loading listings…</p>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center">
              <FileSearch2 className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 font-medium">No properties have been listed yet.</p>
              <Button asChild className="mt-4 bg-[#129B36] hover:bg-[#0e7d2b]"><Link to="/admin/properties/new">Create the first listing</Link></Button>
            </div>
          ) : (
            <div className="divide-y">
              {listings.map((listing) => {
                const isLagosRentHelp = listing.createdBy === user?._id;
                return (
                  <div key={listing._id} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center">
                    <img src={listing.images[0] || "/icon.png"} alt="" className="h-28 w-full rounded-lg bg-gray-50 object-cover lg:w-40" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-gray-950">{listing.title}</h3>
                        <Badge className={isLagosRentHelp ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>
                          {isLagosRentHelp ? "LagosRentHelp" : "Landlord"}
                        </Badge>
                        <Badge variant="outline" className="capitalize">{listing.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{listing.location} · {formatPrice(listing.totalPackagePrice || listing.price)} total package</p>
                      <p className="mt-1 text-xs text-gray-400">Published {new Date(listing.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline"><Link to={`/properties/${listing._id}`}>View</Link></Button>
                      <Button asChild size="sm" variant="outline"><Link to={`/admin/properties/${listing._id}/edit`}><Pencil className="mr-1.5 h-4 w-4" />Edit</Link></Button>
                      <Button size="sm" variant="outline" disabled={actionId === listing._id} onClick={() => void changeStatus(listing)}>
                        Mark {listing.status === "rented" ? "available" : "rented"}
                      </Button>
                      <Button size="icon" variant="outline" aria-label={`Delete ${listing.title}`} disabled={actionId === listing._id} onClick={() => void remove(listing)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PropertyManagementPage;
