import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BadgeCheck,
  ClipboardList,
  DollarSign,
  Eye,
  Heart,
  KeyRound,
  Lightbulb,
  PieChart,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSummaryDecoration, { DASHBOARD_SUMMARY_CARD_CLASS } from "@/components/common/DashboardSummaryDecoration";
import { landlordService, type LandlordProfile } from "@/services/landlordService";
import type { Property } from "@/types";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

const LandlordDashboard = () => {
  const [listings, setListings] = useState<Property[]>([]);
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [nextListings, nextProfile] = await Promise.all([
        landlordService.getMyListings(),
        landlordService.getProfile(),
      ]);
      setListings(nextListings);
      setProfile(nextProfile);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const counts = useMemo(() => ({
    available: listings.filter((item) => item.status === "available").length,
    rented: listings.filter((item) => item.status === "rented").length,
  }), [listings]);

  const analytics = useMemo(() => {
    const totalViews = listings.reduce((total, listing) => total + (listing.views || 0), 0);
    const totalLikes = listings.reduce((total, listing) => total + (listing.likes || 0), 0);
    const chartListings = [...listings]
      .sort((first, second) => (second.views || 0) - (first.views || 0))
      .slice(0, 6);
    const maxViews = Math.max(...chartListings.map((listing) => listing.views || 0), 1);
    const availableEnd = listings.length ? (counts.available / listings.length) * 100 : 0;
    const available = listings.filter((listing) => listing.status === "available").length;
    const rented = listings.filter((listing) => listing.status === "rented").length;
    const rentListings = listings.filter((listing) => listing.listingType === "rent").length;
    const shortLets = listings.filter((listing) => listing.listingType === "short-let").length;
    const portfolioValue = listings.reduce((total, listing) => total + listing.price, 0);
    const averagePrice = listings.length ? portfolioValue / listings.length : 0;
    const engagementRate = totalViews ? Math.min(100, (totalLikes / totalViews) * 100) : 0;

    return {
      totalViews,
      totalLikes,
      chartListings,
      maxViews,
      availableEnd,
      available,
      rented,
      rentListings,
      shortLets,
      portfolioValue,
      averagePrice,
      engagementRate,
    };
  }, [counts.available, listings]);

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {profile && profile.verificationStatus !== "verified" && (
          <div>
            <p className="mt-1 text-sm text-gray-500">
              Verification:{" "}
              <span
                className={`font-semibold capitalize ${
                  profile.verificationStatus === "rejected"
                    ? "text-red-600"
                    : "text-amber-500"
                }`}>
                {profile.verificationStatus}
              </span>
            </p>
          </div>
        )}
        {profile?.verificationStatus === "verified" ? (
          <Button asChild className="bg-[#129B36] hover:bg-[#0e7d2b] sm:ml-auto"><Link to="/landlord/listings/new"><Plus className="mr-2 h-4 w-4" />Add listing</Link></Button>
        ) : (
          <Button disabled className="sm:ml-auto" title="Ownership verification must be approved first"><Plus className="mr-2 h-4 w-4" />Awaiting verification</Button>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className={DASHBOARD_SUMMARY_CARD_CLASS}><DashboardSummaryDecoration tone="sky" /><CardContent className="relative z-10 flex flex-1 items-center gap-4 p-6"><span className="rounded-xl bg-sky-300/20 p-3 shadow-inner ring-1 ring-sky-100/20"><ClipboardList className="h-7 w-7 text-sky-100" strokeWidth={2} /></span><div><p className="text-2xl font-bold">{listings.length}</p><p className="text-sm text-white/85">Total listings</p></div></CardContent></Card>
        <Card className={DASHBOARD_SUMMARY_CARD_CLASS}><DashboardSummaryDecoration tone="green" /><CardContent className="relative z-10 flex flex-1 items-center gap-4 p-6"><span className="rounded-xl bg-emerald-300/20 p-3 shadow-inner ring-1 ring-emerald-100/20"><BadgeCheck className="h-7 w-7 text-emerald-100" strokeWidth={2} /></span><div><p className="text-2xl font-bold">{counts.available}</p><p className="text-sm text-white/85">Available</p></div></CardContent></Card>
        <Card className={DASHBOARD_SUMMARY_CARD_CLASS}><DashboardSummaryDecoration tone="amber" /><CardContent className="relative z-10 flex flex-1 items-center gap-4 p-6"><span className="rounded-xl bg-amber-300/20 p-3 shadow-inner ring-1 ring-amber-100/20"><KeyRound className="h-7 w-7 text-amber-100" strokeWidth={2} /></span><div><p className="text-2xl font-bold">{counts.rented}</p><p className="text-sm text-white/85">Rented</p></div></CardContent></Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-[#129B36]" />
                Listing performance
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">Views across your top listings</p>
            </div>
            <div className="flex gap-5 text-right">
              <div><p className="flex items-center justify-end gap-1 text-lg font-bold"><Eye className="h-4 w-4 text-[#129B36]" />{analytics.totalViews}</p><p className="text-xs text-gray-500">Views</p></div>
              <div><p className="flex items-center justify-end gap-1 text-lg font-bold"><Heart className="h-4 w-4 text-rose-500" />{analytics.totalLikes}</p><p className="text-xs text-gray-500">Likes</p></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-3 border-b border-l px-3 pb-0 pt-5 sm:gap-5">
              {(analytics.chartListings.length
                ? analytics.chartListings
                : Array.from({ length: 6 }, (_, index) => ({ _id: `empty-${index}`, title: "No data", views: 0 } as Property))
              ).map((listing) => {
                const height = analytics.chartListings.length
                  ? Math.max(8, ((listing.views || 0) / analytics.maxViews) * 100)
                  : 8;
                return (
                  <div key={listing._id} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                    <div className="mb-2 text-center text-xs font-medium text-gray-600">{listing.views || 0}</div>
                    <div
                      className={`w-full rounded-t-md ${analytics.chartListings.length ? "bg-[#129B36]" : "bg-gray-200"}`}
                      style={{ height: `${height}%` }}
                      title={`${listing.title}: ${listing.views || 0} views`}
                    />
                    <p className="mt-2 truncate text-center text-[11px] text-gray-500">
                      {analytics.chartListings.length ? listing.title : "—"}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-[#129B36]" />
              Availability overview
            </CardTitle>
            <p className="text-sm text-gray-500">Current portfolio availability</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
              <div
                className="relative h-40 w-40 shrink-0 rounded-full"
                style={{
                  background: listings.length
                    ? `conic-gradient(#16a34a 0% ${analytics.availableEnd}%, #64748b ${analytics.availableEnd}% 100%)`
                    : "#e5e7eb",
                }}>
                <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-2xl font-bold">{listings.length}</span>
                  <span className="text-xs text-gray-500">Listings</span>
                </div>
              </div>
              <div className="w-full space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-600" />Available</span><strong>{counts.available}</strong></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-500" />Rented</span><strong>{counts.rented}</strong></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-[#129B36]" />
              Portfolio value
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-3xl font-bold">{formatPrice(analytics.portfolioValue)}</p>
              <p className="text-sm text-gray-500">Combined asking price</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Average listing price</p>
              <p className="mt-1 text-xl font-semibold">{formatPrice(analytics.averagePrice)}</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span>Annual rent</span><strong>{analytics.rentListings}</strong></div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#129B36]" style={{ width: `${listings.length ? (analytics.rentListings / listings.length) * 100 : 0}%` }} /></div>
              <div className="flex justify-between text-sm"><span>Short let</span><strong>{analytics.shortLets}</strong></div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${listings.length ? (analytics.shortLets / listings.length) * 100 : 0}%` }} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-[#129B36]" />
              Availability & engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-green-50 p-4"><p className="text-2xl font-bold text-green-700">{analytics.available}</p><p className="text-sm text-green-800">Available</p></div>
              <div className="rounded-lg bg-gray-100 p-4"><p className="text-2xl font-bold text-gray-700">{analytics.rented}</p><p className="text-sm text-gray-600">Rented</p></div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm"><span>Engagement rate</span><strong>{analytics.engagementRate.toFixed(1)}%</strong></div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gradient-to-r from-[#129B36] to-green-400" style={{ width: `${analytics.engagementRate}%` }} /></div>
              <p className="mt-2 text-xs text-gray-500">Likes compared with total listing views.</p>
            </div>
            <div className="flex justify-between border-t pt-4 text-sm"><span className="text-gray-500">Average views per listing</span><strong>{listings.length ? Math.round(analytics.totalViews / listings.length) : 0}</strong></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">Calculating your insights…</p>
            ) : listings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-5 text-center">
                <p className="font-medium">Start building your portfolio</p>
                <p className="mt-1 text-sm text-gray-500">Add your first listing to unlock performance insights.</p>
                {profile?.verificationStatus === "verified" ? (
                  <Button asChild variant="link"><Link to="/landlord/listings/new">Create a listing</Link></Button>
                ) : (
                  <p className="mt-3 text-sm font-medium text-amber-700">You can create listings after ownership verification is approved.</p>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-lg bg-green-50 p-4 text-sm"><strong>{counts.available} available listing{counts.available === 1 ? "" : "s"}</strong> visible to renters.</div>
                <div className="rounded-lg bg-slate-100 p-4 text-sm"><strong>{counts.rented} rented listing{counts.rented === 1 ? "" : "s"}</strong> kept in your portfolio history.</div>
                <div className="rounded-lg bg-blue-50 p-4 text-sm">Your portfolio has generated <strong>{analytics.totalViews} views</strong> and <strong>{analytics.totalLikes} likes</strong>.</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default LandlordDashboard;
