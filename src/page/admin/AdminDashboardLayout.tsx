import {
  Bell,
  ExternalLink,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [pendingApplications, setPendingApplications] = useState<LandlordVerificationApplication[]>([]);
  const pendingReviews = pendingApplications.length;

  const navigation: AdminNavigationItem[] = user?.role === "super_admin"
    ? [...baseNavigation, { label: "Administrators", href: "/admin/accounts", icon: UserCog }]
    : baseNavigation;

  const pageHeader = location.pathname === "/admin/accounts"
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
      setPendingApplications(await adminVerificationService.getApplications("pending"));
    } catch {
      setPendingApplications([]);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications, location.pathname]);

  const changeNotificationOpen = (open: boolean) => {
    setNotificationOpen(open);
    if (open) void loadNotifications();
  };

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const SidebarContent = () => (
    <>
      <Link to="/admin/verifications" className="flex items-center gap-3 border-b px-6 py-5">
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
                <Button variant="ghost" size="icon" aria-label="Open admin notifications" className="rounded-full">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,360px)] p-0">
                <div className="border-b px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-gray-950">Notifications</h2>
                    {!notificationLoading && <span className="text-xs font-medium text-gray-500">{pendingReviews} pending</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">Landlord verification activity</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {notificationLoading ? (
                    <p className="px-3 py-8 text-center text-sm text-gray-500">Loading notifications...</p>
                  ) : pendingApplications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-[#129B36]" />
                      <p className="text-sm font-medium text-gray-900">No pending reviews</p>
                      <p className="mt-1 text-xs text-gray-500">You are all caught up.</p>
                    </div>
                  ) : (
                    pendingApplications.slice(0, 5).map((application) => (
                      <Link
                        key={application.userId}
                        to="/admin/verifications"
                        onClick={() => setNotificationOpen(false)}
                        className="flex gap-3 rounded-lg p-3 hover:bg-gray-50">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#129B36]">
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-gray-900">{application.businessName || application.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-gray-500">Ownership verification submitted by {application.name}</span>
                          <span className="mt-1 block text-[11px] text-gray-400">
                            {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(application.submittedAt))}
                          </span>
                        </span>
                      </Link>
                    ))
                  )}
                </div>
                {pendingApplications.length > 5 && (
                  <Link to="/admin/verifications" onClick={() => setNotificationOpen(false)} className="block border-t px-5 py-3 text-center text-sm font-medium text-[#129B36] hover:bg-green-50">
                    View all {pendingReviews} applications
                  </Link>
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
