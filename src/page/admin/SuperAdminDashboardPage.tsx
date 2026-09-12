import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Eye,
  Heart,
  ListChecks,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminDashboardService,
  type AdminLandlordSummary,
} from "@/services/adminDashboardService";
import { adminVerificationService } from "@/services/adminVerificationService";

const formatNumber = (value: number) => new Intl.NumberFormat("en-NG").format(value);
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  verified: "border-green-200 bg-green-50 text-green-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
};

const SuperAdminDashboardPage = () => {
  const [landlords, setLandlords] = useState<AdminLandlordSummary[]>([]);
  const [adminCount, setAdminCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [nextLandlords, admins] = await Promise.all([
        adminDashboardService.getLandlords(),
        adminVerificationService.getAdmins(),
      ]);
      setLandlords(nextLandlords);
      setAdminCount(admins.length);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const analytics = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date),
        count: 0,
      };
    });

    landlords.forEach((landlord) => {
      const joined = new Date(landlord.joinedAt);
      const key = `${joined.getFullYear()}-${joined.getMonth()}`;
      const month = months.find((item) => item.key === key);
      if (month) month.count += 1;
    });

    const verified = landlords.filter((item) => item.verificationStatus === "verified").length;
    const pending = landlords.filter((item) => item.verificationStatus === "pending").length;
    const rejected = landlords.filter((item) => item.verificationStatus === "rejected").length;
    const totalListings = landlords.reduce((sum, item) => sum + item.listingCount, 0);
    const availableListings = landlords.reduce((sum, item) => sum + item.availableListings, 0);
    const rentedListings = landlords.reduce((sum, item) => sum + item.rentedListings, 0);
    const totalViews = landlords.reduce((sum, item) => sum + item.totalViews, 0);
    const totalLikes = landlords.reduce((sum, item) => sum + item.totalLikes, 0);
    const maxMonthly = Math.max(...months.map((month) => month.count), 1);
    const verifiedEnd = landlords.length ? (verified / landlords.length) * 100 : 0;
    const pendingEnd = landlords.length ? verifiedEnd + (pending / landlords.length) * 100 : 0;
    const topLandlords = [...landlords]
      .sort((first, second) => second.listingCount - first.listingCount)
      .slice(0, 5);
    const maxListings = Math.max(...topLandlords.map((item) => item.listingCount), 1);

    return {
      months,
      maxMonthly,
      verified,
      pending,
      rejected,
      verifiedEnd,
      pendingEnd,
      totalListings,
      availableListings,
      rentedListings,
      totalViews,
      totalLikes,
      topLandlords,
      maxListings,
    };
  }, [landlords]);

  const summaryCards = [
    { label: "Onboarded landlords", value: landlords.length, icon: UsersRound, color: "bg-green-50 text-[#129B36]" },
    { label: "Verified landlords", value: analytics.verified, icon: BadgeCheck, color: "bg-blue-50 text-blue-600" },
    { label: "Total listings", value: analytics.totalListings, icon: Building2, color: "bg-violet-50 text-violet-600" },
    { label: "Pending reviews", value: analytics.pending, icon: ListChecks, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <section className="mb-7 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b3d25] via-[#116b34] to-[#129B36] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-200">Platform overview</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Super-admin dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-green-50/85">Monitor landlord onboarding, verification health, listings, and marketplace engagement.</p>
          </div>
          <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading} className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
            <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh data
          </Button>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-5 text-sm">
          <span><strong className="text-lg">{adminCount}</strong> administrators</span>
          <span><strong className="text-lg">{formatNumber(analytics.totalViews)}</strong> listing views</span>
          <span><strong className="text-lg">{formatNumber(analytics.totalLikes)}</strong> saved interests</span>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-3xl font-bold text-gray-950">{loading ? "—" : formatNumber(value)}</p></div>
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}><Icon className="h-6 w-6" /></span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-[#129B36]" />Landlord onboarding</CardTitle>
            <p className="text-sm text-gray-500">New landlord profiles created over the last six months</p>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-3 border-b border-l px-3 pt-6 sm:gap-6">
              {analytics.months.map((month) => (
                <div key={month.key} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                  <span className="mb-2 text-center text-xs font-semibold text-gray-600">{month.count}</span>
                  <div className="min-h-2 w-full rounded-t-lg bg-gradient-to-t from-[#0e7d2b] to-[#34c759] transition-all" style={{ height: `${Math.max(4, (month.count / analytics.maxMonthly) * 100)}%` }} title={`${month.count} landlords joined in ${month.label}`} />
                  <span className="mt-2 pb-1 text-center text-xs text-gray-500">{month.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Verification health</CardTitle><p className="text-sm text-gray-500">Status of all onboarded landlords</p></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
              <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: landlords.length ? `conic-gradient(#16a34a 0% ${analytics.verifiedEnd}%, #f59e0b ${analytics.verifiedEnd}% ${analytics.pendingEnd}%, #ef4444 ${analytics.pendingEnd}% 100%)` : "#e5e7eb" }}>
                <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl">{landlords.length}</strong><span className="text-xs text-gray-500">Landlords</span></div>
              </div>
              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-green-600" />Verified</span><strong>{analytics.verified}</strong></div>
                <div className="flex justify-between"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-amber-500" />Pending</span><strong>{analytics.pending}</strong></div>
                <div className="flex justify-between"><span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-red-500" />Rejected</span><strong>{analytics.rejected}</strong></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div><CardTitle className="text-lg">Largest portfolios</CardTitle><p className="mt-1 text-sm text-gray-500">Landlords ranked by listing count</p></div>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/landlords">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topLandlords.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">No landlord portfolios yet.</p> : analytics.topLandlords.map((landlord) => (
              <div key={landlord.userId}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{landlord.businessName || landlord.name}</span><strong>{landlord.listingCount}</strong></div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-[#129B36]" style={{ width: `${(landlord.listingCount / analytics.maxListings) * 100}%` }} /></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Marketplace activity</CardTitle><p className="text-sm text-gray-500">Availability and renter engagement</p></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-50 p-4"><Building2 className="h-5 w-5 text-green-600" /><p className="mt-3 text-2xl font-bold text-green-800">{analytics.availableListings}</p><p className="text-sm text-green-700">Available listings</p></div>
              <div className="rounded-xl bg-slate-100 p-4"><ListChecks className="h-5 w-5 text-slate-600" /><p className="mt-3 text-2xl font-bold text-slate-800">{analytics.rentedListings}</p><p className="text-sm text-slate-600">Rented listings</p></div>
              <div className="rounded-xl bg-blue-50 p-4"><Eye className="h-5 w-5 text-blue-600" /><p className="mt-3 text-2xl font-bold text-blue-800">{formatNumber(analytics.totalViews)}</p><p className="text-sm text-blue-700">Property views</p></div>
              <div className="rounded-xl bg-rose-50 p-4"><Heart className="h-5 w-5 text-rose-600" /><p className="mt-3 text-2xl font-bold text-rose-800">{formatNumber(analytics.totalLikes)}</p><p className="text-sm text-rose-700">Saved interests</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0"><div><CardTitle className="text-lg">Recently onboarded</CardTitle><p className="mt-1 text-sm text-gray-500">The latest landlord profiles on the platform</p></div><Button asChild variant="outline" size="sm"><Link to="/admin/landlords">Landlord directory</Link></Button></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-gray-500"><tr><th className="py-3 pr-4 font-medium">Landlord</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 text-right font-medium">Listings</th><th className="py-3 pl-4 text-right font-medium">Joined</th></tr></thead>
            <tbody className="divide-y">
              {landlords.slice(0, 5).map((landlord) => (
                <tr key={landlord.userId}><td className="py-4 pr-4"><p className="font-semibold text-gray-900">{landlord.businessName || landlord.name}</p><p className="text-xs text-gray-500">{landlord.email}</p></td><td className="px-4 py-4 text-gray-600">{[landlord.localGovernment, landlord.state].filter(Boolean).join(", ") || "Not provided"}</td><td className="px-4 py-4"><Badge variant="outline" className={`capitalize ${statusStyles[landlord.verificationStatus]}`}>{landlord.verificationStatus}</Badge></td><td className="px-4 py-4 text-right font-semibold">{landlord.listingCount}</td><td className="py-4 pl-4 text-right text-gray-500">{formatDate(landlord.joinedAt)}</td></tr>
              ))}
              {!loading && landlords.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-500">No landlords have completed onboarding.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
};

export default SuperAdminDashboardPage;
