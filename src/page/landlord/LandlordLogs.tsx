import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  History,
  KeyRound,
  Loader2,
  MapPin,
  ScrollText,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import DashboardSummaryBanner from "@/components/common/DashboardSummaryDecoration";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { landlordService, type LandlordListing, type LandlordProfile } from "@/services/landlordService";

type ActivityRecord = {
  id: string;
  title: string;
  message: string;
  occurredAt: string;
  tone: "success" | "warning" | "neutral" | "danger";
};

const formatDate = (value?: string | null) => {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const LandlordLogs = () => {
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [listings, setListings] = useState<LandlordListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void Promise.all([
      landlordService.getProfile(),
      landlordService.getMyListings(),
    ])
      .then(([nextProfile, nextListings]) => {
        if (!active) return;
        setProfile(nextProfile);
        setListings(nextListings);
      })
      .catch((error) => {
        if (active) toast.error(error instanceof Error ? error.message : "Could not load activity logs.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rentedListings = useMemo(
    () => listings
      .filter((listing) => listing.status === "rented")
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()),
    [listings],
  );

  const activity = useMemo(() => {
    const records: ActivityRecord[] = [];

    if (profile?.submittedAt) {
      records.push({
        id: `verification-submitted:${profile.submittedAt}`,
        title: "Verification application submitted",
        message: "Your identity and property-ownership information was submitted for administrator review.",
        occurredAt: profile.submittedAt,
        tone: "warning",
      });
    }

    if (profile?.reviewedAt) {
      records.push({
        id: `verification-reviewed:${profile.reviewedAt}`,
        title: profile.verificationStatus === "verified" ? "Landlord profile verified" : "Verification requires attention",
        message: profile.verificationStatus === "verified"
          ? "Your landlord account was approved and listing access was enabled."
          : "Your verification application was not approved. Review your profile or contact support.",
        occurredAt: profile.reviewedAt,
        tone: profile.verificationStatus === "verified" ? "success" : "danger",
      });
    }

    listings.forEach((listing) => {
      records.push({
        id: `listing-created:${listing._id}`,
        title: "Property listing created",
        message: `${listing.title} was added to your property portfolio.`,
        occurredAt: listing.createdAt,
        tone: "neutral",
      });

      if (listing.status === "rented") {
        records.push({
          id: `listing-rented:${listing._id}`,
          title: "Property marked as rented",
          message: `${listing.title} in ${listing.location} is recorded as rented.`,
          occurredAt: listing.updatedAt || listing.createdAt,
          tone: "success",
        });
      }
    });

    return records.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }, [listings, profile]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#129B36]" /></div>;
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <DashboardSummaryBanner
        eyebrow="Permanent records"
        title="Activity and notification logs"
        description="Review your complete account activity even after recent bell notifications have cleared."
        items={[
          { label: "Activity records", value: activity.length, icon: ScrollText },
          { label: "Rented properties", value: rentedListings.length, icon: KeyRound },
          { label: "Total listings", value: listings.length, icon: Building2 },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#129B36]" />
              Complete notification history
            </CardTitle>
            <p className="text-sm text-gray-500">Verification and property activity remains available here after the bell’s seven-day window.</p>
          </CardHeader>
          <CardContent className="p-0">
            {activity.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <BellRing className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 font-medium text-gray-900">No activity recorded yet</p>
                <p className="mt-1 text-sm text-gray-500">Verification and listing events will appear here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {activity.map((record) => {
                  const Icon = record.tone === "success"
                    ? CheckCircle2
                    : record.tone === "danger"
                      ? XCircle
                      : record.tone === "warning"
                        ? Clock3
                        : Building2;
                  const iconClass = record.tone === "success"
                    ? "bg-green-50 text-[#129B36]"
                    : record.tone === "danger"
                      ? "bg-red-50 text-red-600"
                      : record.tone === "warning"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-600";

                  return (
                    <article key={record.id} className="flex gap-4 px-5 py-5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconClass}`}><Icon className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-950">{record.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-gray-600">{record.message}</p>
                        <p className="mt-1.5 text-xs text-gray-400">{formatDate(record.occurredAt)}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#129B36]" />
              Rented property records
            </CardTitle>
            <p className="text-sm text-gray-500">Properties you have marked as rented.</p>
          </CardHeader>
          <CardContent className="p-0">
            {rentedListings.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <BadgeCheck className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 font-medium text-gray-900">No rented properties yet</p>
                <p className="mt-1 text-sm text-gray-500">Listings marked as rented will be recorded here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {rentedListings.map((listing) => (
                  <article key={listing._id} className="p-5">
                    <div className="flex gap-3">
                      <img src={listing.images[0] || "/placeholder.svg"} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate font-semibold text-gray-950">{listing.title}</h3>
                          <Badge variant="secondary">Rented</Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-gray-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{listing.location}</p>
                        <p className="mt-1 text-xs font-medium text-gray-700">{formatPrice(listing.totalPackagePrice || listing.price)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                      <p className="text-xs text-gray-400">Marked rented {formatDate(listing.updatedAt || listing.createdAt)}</p>
                      <Button asChild variant="outline" size="sm"><Link to={`/landlord/listings/${listing._id}/edit`}>View</Link></Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default LandlordLogs;
