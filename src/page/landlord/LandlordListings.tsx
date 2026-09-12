import { useEffect, useState } from "react";
import { FileSearch2, FileStack, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifyListingVerificationRequired } from "@/lib/listingAccess";
import { landlordService, type LandlordProfile } from "@/services/landlordService";
import type { Property } from "@/types";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const LandlordListings = () => {
  const [listings, setListings] = useState<Property[]>([]);
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      landlordService.getMyListings(),
      landlordService.getProfile(),
    ])
      .then(([nextListings, nextProfile]) => {
        setListings(nextListings);
        setProfile(nextProfile);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load listings."))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (listing: Property) => {
    const status = listing.status === "rented" ? "available" : "rented";
    try {
      await landlordService.updateListingStatus(listing._id, status);
      setListings((items) => items.map((item) => item._id === listing._id ? { ...item, status } : item));
      toast.success(`Listing marked ${status}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    }
  };

  const remove = async (listing: Property) => {
    if (!window.confirm(`Delete “${listing.title}”? This cannot be undone.`)) return;
    try {
      await landlordService.deleteListing(listing._id);
      setListings((items) => items.filter((item) => item._id !== listing._id));
      toast.success("Listing deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><FileStack className="h-5 w-5 text-[#129B36]" strokeWidth={1.8} />Properties</CardTitle>
          {profile?.verificationStatus === "verified" ? (
            <Button asChild className="bg-[#129B36] hover:bg-[#0e7d2b]"><Link to="/landlord/listings/new"><Plus className="mr-2 h-4 w-4" />Add listing</Link></Button>
          ) : (
            <Button type="button" onClick={() => notifyListingVerificationRequired(profile?.verificationStatus)} className="bg-[#129B36] hover:bg-[#0e7d2b]"><Plus className="mr-2 h-4 w-4" />Add listing</Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-12 text-center text-gray-500">Loading listings…</p>
          ) : listings.length === 0 ? (
            <div className="py-16 text-center"><FileSearch2 className="mx-auto mb-3 h-10 w-10 text-gray-400" strokeWidth={1.7} /><p className="font-medium">You have no listings yet.</p></div>
          ) : (
            <div className="divide-y">
              {listings.map((listing) => (
                <div key={listing._id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                  <img src={listing.images[0] || "/placeholder.svg"} alt="" className="h-24 w-full rounded-lg object-cover sm:w-32" />
                  <div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{listing.title}</h3><p className="text-sm text-gray-500">{listing.location} · {formatPrice(listing.totalPackagePrice || listing.price)} total package</p><div className="mt-2 flex gap-2"><Badge variant="secondary" className="capitalize">{listing.status}</Badge></div></div>
                  <div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link to={`/landlord/listings/${listing._id}/edit`}><Pencil className="mr-1.5 h-4 w-4" />Edit</Link></Button><Button size="sm" variant="outline" onClick={() => void changeStatus(listing)}>Mark {listing.status === "rented" ? "available" : "rented"}</Button><Button size="icon" variant="outline" aria-label="Delete listing" onClick={() => void remove(listing)}><Trash2 className="h-4 w-4 text-red-600" /></Button></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default LandlordListings;
