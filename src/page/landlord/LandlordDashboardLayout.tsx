import {
  AlertCircle,
  Bell,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  ExternalLink,
  FilePlus2,
  FileStack,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  BadgeCheck,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDisplayProfileImage } from "@/lib/profileImage";
import { landlordService } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";

type LandlordNotice = {
  id: string;
  title: string;
  message: string;
  href: string;
  tone: "success" | "warning" | "danger";
};

const navigation = [
  { label: "Dashboard", href: "/landlord", icon: LayoutDashboard, exact: true },
  { label: "My Listings", href: "/landlord/listings", icon: FileStack, exact: true },
  { label: "Add Listing", href: "/landlord/listings/new", icon: FilePlus2 },
  { label: "Leads", href: "/landlord/leads", icon: UsersRound },
  { label: "Subscription", href: "/landlord/subscription", icon: BadgeCheck },
  { label: "Profile", href: "/landlord/profile", icon: CircleUserRound },
  { label: "Settings", href: "/landlord/settings", icon: Settings },
];

const LandlordDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notices, setNotices] = useState<LandlordNotice[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  const pageHeader = location.pathname === "/landlord/listings/new"
    ? { title: "Add New Listing", description: "Create and publish a new property listing" }
    : location.pathname === "/landlord/listings"
      ? { title: "My Listings", description: "Manage all your submitted properties" }
      : location.pathname === "/landlord/profile"
        ? { title: "Profile", description: "Manage your landlord and contact information" }
        : location.pathname === "/landlord/leads"
          ? { title: "Leads", description: "View genuine renter enquiries for your properties" }
          : location.pathname === "/landlord/subscription"
            ? { title: "Subscription", description: "Review your current LagosRentHelp access" }
            : location.pathname === "/landlord/settings"
              ? { title: "Settings", description: "Manage your password and account security" }
              : { title: "Dashboard", description: "Manage your properties and listings" };

  const initials = (user?.name || "Landlord")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  useEffect(() => {
    let active = true;

    const loadNotices = async () => {
      setNoticesLoading(true);
      try {
        const profile = await landlordService.getProfile();
        if (!active) return;

        const next: LandlordNotice[] = [];
        if (profile?.verificationStatus === "pending") {
          next.push({
            id: "verification-pending",
            title: "Verification pending",
            message: "Your landlord profile is awaiting administrator review.",
            href: "/landlord/profile",
            tone: "warning",
          });
        } else if (profile?.verificationStatus === "rejected") {
          next.push({
            id: "verification-rejected",
            title: "Profile needs attention",
            message: "Review your landlord details and submit the required corrections.",
            href: "/landlord/profile",
            tone: "danger",
          });
        } else if (profile?.verificationStatus === "verified") {
          next.push({
            id: "verification-approved",
            title: "Profile verified",
            message: "Your landlord account has been successfully verified.",
            href: "/landlord/profile",
            tone: "success",
          });
        }

        setNotices(next);
      } catch {
        if (active) setNotices([]);
      } finally {
        if (active) setNoticesLoading(false);
      }
    };

    void loadNotices();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const signOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const SidebarContent = () => (
    <>
      <Link to="/landlord" className="flex items-center gap-3 border-b px-6 py-5">
        <img src="/icon.png" alt="" className="h-10 w-10" />
        <div>
          <p className="font-bold text-gray-950">LagosRentHelp</p>
          <p className="text-xs text-gray-500">Landlord portal</p>
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t p-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100">
          <ExternalLink className="h-5 w-5" strokeWidth={1.8} />
          View website
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle dashboard menu">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">{pageHeader.title}</h1>
              <p className="text-sm text-gray-500">{pageHeader.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open notifications" className="rounded-full">
                  <Bell className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,380px)] p-0">
                <div className="border-b px-5 py-4">
                  <h2 className="font-semibold text-gray-950">Notifications</h2>
                  <p className="text-xs text-gray-500">Recent account and listing updates</p>
                </div>
                <div className="max-h-80 overflow-y-auto p-2">
                  {noticesLoading ? (
                    <p className="px-3 py-8 text-center text-sm text-gray-500">Loading notifications...</p>
                  ) : notices.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-[#129B36]" />
                      <p className="text-sm font-medium text-gray-900">You are all caught up</p>
                      <p className="mt-1 text-xs text-gray-500">There are no new updates right now.</p>
                    </div>
                  ) : (
                    notices.map((notice) => {
                      const NoticeIcon = notice.tone === "success"
                        ? CheckCircle2
                        : notice.tone === "danger"
                          ? AlertCircle
                          : Clock3;
                      const iconClass = notice.tone === "success"
                        ? "bg-green-50 text-[#129B36]"
                        : notice.tone === "danger"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600";

                      return (
                        <Link key={notice.id} to={notice.href} className="flex gap-3 rounded-lg px-3 py-3 hover:bg-gray-50">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                            <NoticeIcon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900">{notice.title}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-gray-500">{notice.message}</span>
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Link to="/landlord/profile" className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user ? getDisplayProfileImage(user) || undefined : undefined} alt={user?.name || "Landlord"} referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-[#129B36] text-sm text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs capitalize text-gray-500">Landlord</p>
              </div>
            </Link>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LandlordDashboardLayout;
