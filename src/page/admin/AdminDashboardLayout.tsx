import {
  Bell,
  Briefcase,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserCog,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { loadReadNotificationIds, saveReadNotificationIds } from "@/lib/dashboardNotifications";
import { getDisplayProfileImage } from "@/lib/profileImage";
import {
  adminVerificationService,
  type LandlordVerificationApplication,
} from "@/services/adminVerificationService";
import { useAuthStore } from "@/stores/authStore";

type AdminNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

type NotificationTab = "new" | "history";

const baseNavigation: AdminNavigationItem[] = [
  { label: "Landlord Verification", href: "/admin/verifications", icon: ShieldCheck },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<NotificationTab>("new");
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationApplications, setNotificationApplications] = useState<LandlordVerificationApplication[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const pendingApplications = notificationApplications.filter((application) => application.verificationStatus === "pending");
  const pendingReviews = pendingApplications.length;

  const notificationId = (application: LandlordVerificationApplication) =>
    `${application.userId}:${application.verificationStatus}:${application.reviewedAt || application.submittedAt}`;
  const newApplications = pendingApplications.filter((application) => !readNotificationIds.has(notificationId(application)));
  const historyApplications = notificationApplications.filter(
    (application) => application.verificationStatus !== "pending" || readNotificationIds.has(notificationId(application)),
  );
  const visibleApplications = notificationTab === "new" ? newApplications : historyApplications;

  const navigation: AdminNavigationItem[] = user?.role === "super_admin"
    ? [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
        { label: "Landlords", href: "/admin/landlords", icon: Briefcase },
        ...baseNavigation,
        { label: "Administrators", href: "/admin/accounts", icon: UserCog },
      ]
    : baseNavigation;

  const pageHeader = location.pathname === "/admin"
    ? { title: "Dashboard", description: "Platform analytics and landlord activity" }
    : location.pathname === "/admin/landlords"
      ? { title: "Landlords", description: "View onboarded landlords and their portfolios" }
      : location.pathname === "/admin/accounts"
        ? { title: "Administrator Access", description: "Manage trusted review staff" }
        : location.pathname === "/admin/settings"
          ? { title: "Settings", description: "Manage your password and account security" }
          : { title: "Landlord Verification", description: "Review identity and property ownership evidence" };

  const initials = (user?.name || "Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);
    try {
      setNotificationApplications(await adminVerificationService.getApplications());
    } catch {
      setNotificationApplications([]);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications, location.pathname]);

  useEffect(() => {
    setReadNotificationIds(loadReadNotificationIds("admin", user?._id));
  }, [user?._id]);

  const markNotificationsRead = (applications: LandlordVerificationApplication[]) => {
    if (!applications.length) return;
    setReadNotificationIds((current) => {
      const next = new Set(current);
      applications.forEach((application) => next.add(notificationId(application)));
      saveReadNotificationIds("admin", user?._id, next);
      return next;
    });
  };

  const changeNotificationOpen = (open: boolean) => {
    setNotificationOpen(open);
    if (open) {
      setNotificationTab("new");
      void loadNotifications();
    }
  };

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const SidebarContent = () => (
    <>
      <Link to={user?.role === "super_admin" ? "/admin" : "/admin/verifications"} className="flex items-center gap-3 border-b px-6 py-5">
        <img src="/icon.png" alt="" className="h-10 w-10" />
        <div>
          <p className="font-bold text-gray-950">LagosRentHelp</p>
          <p className="text-xs text-gray-500">Admin portal</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#129B36] text-white"
                  : "text-gray-600 hover:bg-green-50 hover:text-[#129B36]"
              }`}>
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 flex-1">{item.label}</span>
              {item.href === "/admin/verifications" && pendingReviews > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-white text-[#129B36]" : "bg-amber-100 text-amber-700"}`}>
                  {pendingReviews}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t p-4">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <ExternalLink className="h-5 w-5" strokeWidth={1.8} />
          View website
        </Link>
        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="h-5 w-5" strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-white lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="flex h-full w-72 flex-col bg-white" onClick={(event) => event.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:h-20 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle admin menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">{pageHeader.title}</h1>
              <p className="text-sm text-gray-500">{pageHeader.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Popover open={notificationOpen} onOpenChange={changeNotificationOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Open admin notifications" aria-expanded={notificationOpen} className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {!notificationLoading && newApplications.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                      {newApplications.length > 9 ? "9+" : newApplications.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,360px)] p-0">
                <div className="border-b px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-gray-950">Notifications</h2>
                    {!notificationLoading && <span className="text-xs font-medium text-gray-500">{newApplications.length} new</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">Landlord verification activity</p>
                </div>
                <div className="grid grid-cols-2 border-b bg-gray-50 p-1.5" role="tablist" aria-label="Notification sections">
                  <button type="button" role="tab" aria-selected={notificationTab === "new"} onClick={() => setNotificationTab("new")} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${notificationTab === "new" ? "bg-white text-[#129B36] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>New ({newApplications.length})</button>
                  <button type="button" role="tab" aria-selected={notificationTab === "history"} onClick={() => setNotificationTab("history")} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${notificationTab === "history" ? "bg-white text-[#129B36] shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>History ({historyApplications.length})</button>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {notificationLoading ? (
                    <p className="px-3 py-8 text-center text-sm text-gray-500">Loading notifications...</p>
                  ) : visibleApplications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-[#129B36]" />
                      <p className="text-sm font-medium text-gray-900">{notificationTab === "new" ? "No new notifications" : "No notification history"}</p>
                      <p className="mt-1 text-xs text-gray-500">{notificationTab === "new" ? "You are all caught up." : "Reviewed or previously checked notifications will appear here."}</p>
                    </div>
                  ) : (
                    visibleApplications.slice(0, 8).map((application) => {
                      const NoticeIcon = application.verificationStatus === "verified" ? CheckCircle2 : application.verificationStatus === "rejected" ? XCircle : Clock3;
                      const iconClass = application.verificationStatus === "verified" ? "bg-green-50 text-[#129B36]" : application.verificationStatus === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600";
                      const message = application.verificationStatus === "verified" ? `${application.name} was approved as a verified landlord.` : application.verificationStatus === "rejected" ? `${application.name}'s verification application was rejected.` : `Ownership verification submitted by ${application.name}`;
                      const activityDate = application.reviewedAt || application.submittedAt;

                      return (
                        <Link key={notificationId(application)} to="/admin/verifications" onClick={() => { markNotificationsRead([application]); setNotificationOpen(false); }} className="flex gap-3 rounded-lg p-3 hover:bg-gray-50">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}><NoticeIcon className="h-4 w-4" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2"><span className="block truncate text-sm font-medium text-gray-900">{application.businessName || application.name}</span><span className="text-[10px] font-semibold uppercase text-gray-400">{application.verificationStatus}</span></span>
                            <span className="mt-0.5 block text-xs leading-5 text-gray-500">{message}</span>
                            <span className="mt-1 block text-[11px] text-gray-400">{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(activityDate))}</span>
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
                {notificationTab === "new" && newApplications.length > 0 && (
                  <button type="button" onClick={() => { markNotificationsRead(newApplications); setNotificationTab("history"); }} className="block w-full border-t px-5 py-3 text-center text-sm font-medium text-[#129B36] hover:bg-green-50">
                    Mark all as read
                  </button>
                )}
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user ? getDisplayProfileImage(user) || undefined : undefined} alt={user?.name || "Administrator"} referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-[#129B36] text-sm text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden max-w-44 text-left sm:block">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="truncate text-xs capitalize text-gray-500">{user?.role?.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
