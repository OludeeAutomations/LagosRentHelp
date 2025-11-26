import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Plus,
  Users,
  BarChart3,
  Settings,
  Menu,
  Shield,
  Bell,
  Building,
  HomeIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAgentStore } from "@/stores/agentStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { canAgentListProperties } from "@/utils/agentUtils";
import { ModalProvider } from "@/provider/ModalProvider";

interface AgentDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  showHeader?: boolean;
}

const AgentDashboardLayout: React.FC<AgentDashboardLayoutProps> = ({
  children,
  title,
  showHeader = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, agent } = useAuthStore();
  const { fetchAgentProfile, loading, error } = useAgentStore();
  const location = useLocation();

  useEffect(() => {
    if (user?._id) {
      fetchAgentProfile();
    }
  }, [user?._id, fetchAgentProfile]);

  const getSubscriptionStatus = () => {
    if (!agent) return "Loading...";

    if (agent.verificationStatus !== "verified") {
      return "Not Verified";
    }

    if (agent.freeListingWeeks && agent.freeListingWeeks > 0) {
      return `Free Weeks: ${agent.freeListingWeeks}`;
    }

    if (
      agent.subscription?.status === "trial" &&
      agent.subscription.trialEndsAt
    ) {
      const daysLeft = Math.ceil(
        (new Date(agent.subscription.trialEndsAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );
      return `Trial: ${daysLeft} days left`;
    }

    if (agent.subscription?.status === "active") {
      return "Active Subscription";
    }

    // ✅ Grace period display - FIXED: Check both verifiedAt locations
    const verifiedAt =
      agent.verifiedAt || (agent as any).dojahResponse?.verifiedAt;
    if (verifiedAt) {
      const verifiedDate = new Date(verifiedAt);
      const daysSinceVerification = Math.floor(
        (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceVerification < 7) {
        const daysLeft = 7 - daysSinceVerification;
        return `Grace Period: ${daysLeft} days left`;
      }
    }

    return "Subscription Required";
  };

  const canCreateListing = agent && canAgentListProperties(agent);

  const agentNavigationItems = [
    { icon: Home, label: "Overview", href: "/agent-dashboard" },
    { icon: Plus, label: "Create Listing", href: "/create-listing" },
    { icon: Building, label: "My Listings", href: "/agent-dashboard/listings" },
    // { icon: Users, label: "Leads", href: "/agent-dashboard/leads" },
    // { icon: BarChart3, label: "Analytics", href: "#" },
    { icon: Settings, label: "Settings", href: "/agent-dashboard/settings" },
  ];

  // Navigation item component with consistent restrictions
  interface NavigationItemProps {
    item: {
      icon: React.ElementType;
      label: string;
      href: string;
    };
    isMobile?: boolean;
  }

  const NavigationItem: React.FC<NavigationItemProps> = ({
    item,
    isMobile = false,
  }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;
    const isDisabled = item.href === "/create-listing" && !canCreateListing;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        e.preventDefault();
        toast.info(
          agent?.verificationStatus !== "verified"
            ? "Please verify your account first"
            : "Please subscribe to create listings"
        );
        if (isMobile) {
          setIsSidebarOpen(false);
        }
      } else if (isMobile) {
        setIsSidebarOpen(false);
      }
    };

    return (
      <Link
        to={isDisabled ? "#" : item.href}
        onClick={handleClick}
        className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground"
            : isDisabled
            ? "text-muted-foreground opacity-50 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}>
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
        {isDisabled && <span className="text-xs ml-2">🔒</span>}
      </Link>
    );
  };

  // 🔄 Handle Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading agent profile</p>
          <Button onClick={() => fetchAgentProfile()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-background">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/agent-dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                Agent Portal
              </span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || "Agent"}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {getSubscriptionStatus()}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Badge
                variant={
                  agent?.verificationStatus === "verified"
                    ? "default"
                    : agent?.verificationStatus === "pending"
                    ? "secondary"
                    : "destructive"
                }>
                {agent?.verificationStatus?.toUpperCase() || "UNKNOWN"}
              </Badge>
              {agent?.verificationStatus === "verified" && (
                <Shield className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {agentNavigationItems.map((item, index) => (
              <NavigationItem key={index} item={item} isMobile={false} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/agent-dashboard/notifications">
                <Bell className="h-5 w-5 mr-3" />
                Notifications
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="w-full justify-start text-destructive">
              <Link to="/">
                <HomeIcon className="h-5 w-5 mr-3" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  Agent Portal
                </span>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || "Agent"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {getSubscriptionStatus()}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={
                    agent?.verificationStatus === "verified"
                      ? "default"
                      : agent?.verificationStatus === "pending"
                      ? "secondary"
                      : "destructive"
                  }>
                  {agent?.verificationStatus?.toUpperCase() || "UNKNOWN"}
                </Badge>
                {agent?.verificationStatus === "verified" && (
                  <Shield className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {agentNavigationItems.map((item, index) => (
                <NavigationItem key={index} item={item} isMobile={true} />
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link
                  to="/agent-dashboard/notifications"
                  onClick={() => setIsSidebarOpen(false)}>
                  <Bell className="h-5 w-5 mr-3" />
                  Notifications
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="w-full justify-start text-destructive">
                <Link to="/" onClick={() => setIsSidebarOpen(false)}>
                  <HomeIcon className="h-5 w-5 mr-3" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        {showHeader && (
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}>
                  <Menu className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-semibold text-foreground">
                  {title}
                </h1>
              </div>

              <div className="flex items-center space-x-10">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="relative">
                  <Link to="/agent-dashboard/notifications">
                    <Bell className="h-5 w-5" />
                  </Link>
                </Button>
                <Avatar>
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6">
          <ModalProvider>{children}</ModalProvider>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboardLayout;
