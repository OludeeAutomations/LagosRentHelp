import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  KeyRound,
  ListChecks,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSummaryBanner from "@/components/common/DashboardSummaryDecoration";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  adminDashboardService,
  type AdminRentedListing,
  type AdminLandlordSummary,
} from "@/services/adminDashboardService";
import type { VerificationStatus } from "@/services/adminVerificationService";

const PAGE_SIZE = 10;
const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  verified: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};
const formatNumber = (value: number) => new Intl.NumberFormat("en-NG").format(value);
const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value))
  : "Not available";
const formatPrice = (value: number) => new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
}).format(value);

const AdminLandlordsPage = () => {
  const [landlords, setLandlords] = useState<AdminLandlordSummary[]>([]);
  const [selectedLandlord, setSelectedLandlord] = useState<AdminLandlordSummary | null>(null);
  const [rentedListings, setRentedListings] = useState<AdminRentedListing[]>([]);
  const [rentedListingsLoading, setRentedListingsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadLandlords = useCallback(async () => {
    setLoading(true);
    try {
      setLandlords(await adminDashboardService.getLandlords());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load landlords.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLandlords();
  }, [loadLandlords]);

  const filteredLandlords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return landlords.filter((landlord) => {
      const matchesStatus = status === "all" || landlord.verificationStatus === status;
      const matchesSearch = !term || [
        landlord.name,
        landlord.businessName,
        landlord.email,
        landlord.phone,
        landlord.whatsappNumber,
        landlord.localGovernment,
        landlord.state,
      ].some((value) => value.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [landlords, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredLandlords.length / PAGE_SIZE));
  const visibleLandlords = filteredLandlords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const verifiedCount = landlords.filter((item) => item.verificationStatus === "verified").length;
  const listingCount = landlords.reduce((sum, item) => sum + item.listingCount, 0);
  const rentedCount = landlords.reduce((sum, item) => sum + item.rentedListings, 0);

  const openLandlordDetails = async (landlord: AdminLandlordSummary) => {
    setSelectedLandlord(landlord);
    setRentedListings([]);
    setRentedListingsLoading(true);
    try {
      setRentedListings(await adminDashboardService.getLandlordRentedListings(landlord.userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load rented properties.");
    } finally {
      setRentedListingsLoading(false);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <DashboardSummaryBanner
        eyebrow="Landlord directory"
        title="Onboarded landlord overview"
        description="Review every landlord's profile, verification standing, location, and property portfolio."
        items={[
          { label: "Total landlords", value: loading ? "—" : landlords.length, icon: Briefcase },
          { label: "Verified", value: loading ? "—" : verifiedCount, icon: BadgeCheck },
          { label: "Combined listings", value: loading ? "—" : listingCount, icon: ListChecks },
          { label: "Rented records", value: loading ? "—" : rentedCount, icon: KeyRound },
        ]}
        action={
          <Button variant="outline" onClick={() => void loadLandlords()} disabled={loading} className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
            <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh data
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle>Onboarded landlords</CardTitle><p className="mt-1 text-sm text-gray-500">Contact, verification, location, and portfolio details for every landlord.</p></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input className="pl-9" placeholder="Search landlord, business, email or location" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <select aria-label="Filter landlords by verification status" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as VerificationStatus | "all")}>
              <option value="all">All verification statuses</option><option value="verified">Verified</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-gray-500">Loading landlord directory...</p>
          ) : visibleLandlords.length === 0 ? (
            <div className="py-16 text-center"><UserRound className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 font-medium text-gray-800">No landlords found</p><p className="mt-1 text-sm text-gray-500">Try changing the search or status filter.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3 font-medium">Landlord</th><th className="px-4 py-3 font-medium">Contact</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">Verification</th><th className="px-4 py-3 text-center font-medium">Listings</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead>
                <tbody className="divide-y">
                  {visibleLandlords.map((landlord) => {
                    const initials = landlord.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={landlord.userId} className="hover:bg-gray-50/70">
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 shrink-0"><AvatarImage src={landlord.avatarUrl || undefined} alt={landlord.name} className="object-cover" /><AvatarFallback className="bg-green-100 font-semibold text-[#0e7d2b]">{initials || "L"}</AvatarFallback></Avatar><div className="min-w-0"><div className="flex max-w-64 flex-wrap items-center gap-1.5"><p className="max-w-52 truncate font-semibold text-gray-950">{landlord.businessName || landlord.name}</p><Badge variant="outline" className={landlord.rentedListings > 0 ? "border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-700" : "border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-500"}><KeyRound className="mr-1 h-3 w-3" />{landlord.rentedListings} rented</Badge></div><p className="max-w-52 truncate text-xs text-gray-500">{landlord.name}</p></div></div></td>
                        <td className="px-4 py-4"><p className="max-w-52 truncate text-gray-700">{landlord.email}</p><p className="text-xs text-gray-500">{landlord.whatsappNumber || landlord.phone || "No phone"}</p></td>
                        <td className="px-4 py-4 text-gray-600">{[landlord.localGovernment, landlord.state].filter(Boolean).join(", ") || "Not provided"}</td>
                        <td className="px-4 py-4"><Badge variant="outline" className={`capitalize ${statusStyles[landlord.verificationStatus]}`}>{landlord.verificationStatus}</Badge></td>
                        <td className="px-4 py-4 text-center"><span className="inline-flex min-w-9 justify-center rounded-full bg-gray-100 px-2.5 py-1 font-semibold">{landlord.listingCount}</span></td>
                        <td className="px-4 py-4 text-gray-500">{formatDate(landlord.joinedAt)}</td>
                        <td className="px-5 py-4 text-right"><Button variant="outline" size="sm" onClick={() => void openLandlordDetails(landlord)}>View details</Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-gray-500">Showing {filteredLandlords.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLandlords.length)} of {filteredLandlords.length}</p>
            <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="h-4 w-4" /> Previous</Button><span className="px-2 text-xs font-medium text-gray-600">Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next <ChevronRight className="h-4 w-4" /></Button></div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedLandlord)} onOpenChange={(open) => { if (!open) { setSelectedLandlord(null); setRentedListings([]); } }}>
        {selectedLandlord && (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader><div className="flex items-center gap-3 pr-8"><Avatar className="h-12 w-12 shrink-0"><AvatarImage src={selectedLandlord.avatarUrl || undefined} alt={selectedLandlord.name} className="object-cover" /><AvatarFallback className="bg-green-100 font-semibold text-[#0e7d2b]">{selectedLandlord.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "L"}</AvatarFallback></Avatar><div><div className="flex flex-wrap items-center gap-3"><DialogTitle>{selectedLandlord.businessName || selectedLandlord.name}</DialogTitle><Badge variant="outline" className={`capitalize ${statusStyles[selectedLandlord.verificationStatus]}`}>{selectedLandlord.verificationStatus}</Badge></div><DialogDescription>Onboarded {formatDate(selectedLandlord.joinedAt)}</DialogDescription></div></div></DialogHeader>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-green-50 p-4"><Building2 className="h-5 w-5 text-green-600" /><p className="mt-2 text-2xl font-bold text-green-800">{selectedLandlord.listingCount}</p><p className="text-xs text-green-700">Total listings</p></div>
              <div className="rounded-xl bg-blue-50 p-4"><Eye className="h-5 w-5 text-blue-600" /><p className="mt-2 text-2xl font-bold text-blue-800">{formatNumber(selectedLandlord.totalViews)}</p><p className="text-xs text-blue-700">Total views</p></div>
              <div className="rounded-xl bg-rose-50 p-4"><Heart className="h-5 w-5 text-rose-600" /><p className="mt-2 text-2xl font-bold text-rose-800">{formatNumber(selectedLandlord.totalLikes)}</p><p className="text-xs text-rose-700">Total likes</p></div>
              <div className="rounded-xl bg-slate-100 p-4"><BadgeCheck className="h-5 w-5 text-slate-600" /><p className="mt-2 text-2xl font-bold text-slate-800">{selectedLandlord.availableListings}</p><p className="text-xs text-slate-600">Available</p></div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <section className="rounded-xl border p-5"><h3 className="font-semibold text-gray-950">Landlord details</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex gap-3"><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><dt className="text-xs text-gray-500">Full name</dt><dd className="font-medium">{selectedLandlord.name}</dd></div></div><div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div className="min-w-0"><dt className="text-xs text-gray-500">Email</dt><dd className="break-all font-medium">{selectedLandlord.email}</dd></div></div><div className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><dt className="text-xs text-gray-500">Phone / WhatsApp</dt><dd className="font-medium">{selectedLandlord.whatsappNumber || selectedLandlord.phone || "Not provided"}</dd></div></div></dl></section>
              <section className="rounded-xl border p-5"><h3 className="font-semibold text-gray-950">Location & activity</h3><dl className="mt-4 space-y-3 text-sm"><div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><div><dt className="text-xs text-gray-500">Residential address</dt><dd className="font-medium">{selectedLandlord.residentialAddress || "Not provided"}</dd><dd className="text-gray-500">{[selectedLandlord.localGovernment, selectedLandlord.state].filter(Boolean).join(", ")}</dd></div></div><div><dt className="text-xs text-gray-500">Latest listing</dt><dd className="font-medium">{formatDate(selectedLandlord.latestListingAt)}</dd></div><div><dt className="text-xs text-gray-500">Verification submitted</dt><dd className="font-medium">{formatDate(selectedLandlord.submittedAt)}</dd></div></dl></section>
            </div>

            <section className="rounded-xl border p-5"><h3 className="font-semibold text-gray-950">Portfolio breakdown</h3><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Available</p><p className="text-lg font-semibold">{selectedLandlord.availableListings}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Rented</p><p className="text-lg font-semibold">{selectedLandlord.rentedListings}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Other status</p><p className="text-lg font-semibold">{Math.max(0, selectedLandlord.listingCount - selectedLandlord.availableListings - selectedLandlord.rentedListings)}</p></div></div>{selectedLandlord.bio && <div className="mt-4 border-t pt-4"><p className="text-xs text-gray-500">Business bio</p><p className="mt-1 text-sm leading-6 text-gray-700">{selectedLandlord.bio}</p></div>}{selectedLandlord.verificationNote && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"><strong>Verification note:</strong> {selectedLandlord.verificationNote}</div>}</section>

            <section className="rounded-xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <div><h3 className="flex items-center gap-2 font-semibold text-gray-950"><KeyRound className="h-4 w-4 text-amber-600" />Rented property records</h3><p className="mt-1 text-xs text-gray-500">Homes this landlord has marked as rented.</p></div>
                <Badge variant="secondary">{selectedLandlord.rentedListings} total</Badge>
              </div>
              {rentedListingsLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading rented properties...</div>
              ) : rentedListings.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No rented properties recorded for this landlord.</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {rentedListings.map((listing) => (
                    <article key={listing.id} className="flex gap-3 rounded-xl border bg-gray-50/70 p-3">
                      <img src={listing.imageUrl || "/placeholder.svg"} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0"><h4 className="truncate font-semibold text-gray-950">{listing.title}</h4><p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500"><MapPin className="h-3 w-3 shrink-0" />{listing.location}</p><p className="mt-1 text-xs font-semibold text-gray-700">{formatPrice(listing.totalPackagePrice || listing.price)}</p><p className="mt-1 text-[11px] text-gray-400">Marked rented {formatDate(listing.markedRentedAt)}</p></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
};

export default AdminLandlordsPage;
