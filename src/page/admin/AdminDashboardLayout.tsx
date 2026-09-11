import {
  Bell,
  ExternalLink,
  FilePlus2,
  LogOut,
  Menu,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDisplayProfileImage } from "@/lib/profileImage";
import { adminVerificationService } from "@/services/adminVerificationService";
import { useAuthStore } from "@/stores/authStore";

type AdminNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

const baseNavigation: AdminNavigationItem[] = [
  { label: "Landlord Verification", href: "/admin/verifications", icon: ShieldCheck },
  { label: "Add Property", href: "/admin/properties/new", icon: FilePlus2 },
];

const AdminDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingReviews, setPendingReviews] = useState<number | null>(null);

  const navigation: AdminNavigationItem[] = user?.role === "super_admin"
    ? [...baseNavigation, { label: "Administrators", href: "/admin/accounts", icon: UserCog }]
    : baseNavigation;

  const pageHeader = location.pathname === "/admin/properties/new"
    ? { title: "Add Property", description: "Create and publish a managed property listing" }
    : location.pathname.includes("/edit")
      ? { title: "Edit Property", description: "Update property information and availability" }
      : location.pathname === "/admin/properties"
        ? { title: "Property Management", description: "Review and manage property listings" }
        : location.pathname === "/admin/accounts"
          ? { title: "Administrator Access", description: "Manage trusted review staff" }
          : { title: "Landlord Verification", description: "Review identity and property ownership evidence" };

  const initials = (user?.name || "Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string, exact?: boolean) => {
    if (href === "/admin/properties") {
      return location.pathname === href || location.pathname.endsWith("/edit");
    }
    return exact ? location.pathname === href : location.pathname.startsWith(href);
  };

  useEffect(() => {
    let active = true;
    void adminVerificationService
      .getApplications("pending")
      .then((applications) => {
        if (active) setPendingReviews(applications.length);
      })
      .catch(() => {
        if (active) setPendingReviews(null);
      });
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
              {item.href === "/admin/verifications" && pendingReviews !== null && pendingReviews > 0 && (
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
            <Link to="/admin/verifications" className="flex items-center gap-2 font-bold lg:hidden">
              <img src="/icon.png" alt="" className="h-9 w-9" />
              <span className="hidden sm:inline">Admin Portal</span>
            </Link>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">{pageHeader.title}</h1>
              <p className="text-sm text-gray-500">{pageHeader.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open admin notifications" className="relative rounded-full">
                  <Bell className="h-5 w-5" />
                  {pendingReviews !== null && pendingReviews > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={10} className="w-[min(92vw,360px)] p-0">
                <div className="border-b px-5 py-4">
                  <h2 className="font-semibold text-gray-950">Review queue</h2>
                  <p className="text-xs text-gray-500">Landlord verification activity</p>
                </div>
                <div className="p-3">
                  <Link to="/admin/verifications" className="flex gap-3 rounded-lg p-3 hover:bg-gray-50">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {pendingReviews === null ? "Open landlord reviews" : `${pendingReviews} pending application${pendingReviews === 1 ? "" : "s"}`}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">Review identity and ownership documents.</span>
                    </span>
                  </Link>
                </div>
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
