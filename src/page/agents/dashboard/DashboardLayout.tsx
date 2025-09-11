import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Plus,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  MessageCircle,
  Shield,
  Bell,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { agentService } from "@/services/agentService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentProfileResponse } from "@/types";

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
  const [isLoading, setIsLoading] = useState(true);
  const [agentData, setAgentData] = useState<AgentProfileResponse | null>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.id) {
      loadAgentData(user.id);
    }
  }, [user?.id]);

  const loadAgentData = async (agentId: string) => {
    setIsLoading(true);
    try {
      const profileResponse = await agentService.getProfile(agentId);
      setAgentData(profileResponse.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load agent data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const agentNavigationItems = [
    { icon: Home, label: "Overview", href: "/agent-dashboard" },
    { icon: Plus, label: "Create Listing", href: "/create-listing" },
    { icon: Building, label: "My Listings", href: "/agent-dashboard/listings" },
    { icon: Users, label: "Leads", href: "/agent-dashboard/leads" },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "/agent-dashboard/messages",
    },
    { icon: BarChart3, label: "Analytics", href: "/agent-dashboard/analytics" },
    {
      icon: Calendar,
      label: "Appointments",
      href: "/agent-dashboard/appointments",
    },
    {
      icon: DollarSign,
      label: "Commissions",
      href: "/agent-dashboard/commissions",
    },
    { icon: Settings, label: "Settings", href: "/agent-dashboard/settings" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!agentData || !agentData.agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Access Required</h1>
          <p className="text-muted-foreground mb-4">
            Please complete your agent registration to access the dashboard.
          </p>
          <Button asChild>
            <Link to="/agent-onboarding">Complete Registration</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { agent } = agentData;

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
                  Verified Agent
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Badge
                variant={
                  agent.verificationStatus === "verified"
                    ? "default"
                    : agent.verificationStatus === "pending"
                    ? "secondary"
                    : "destructive"
                }>
                {agent.verificationStatus.toUpperCase()}
              </Badge>
              {agent.verificationStatus === "verified" && (
                <Shield className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {agentNavigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={index}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
              className="w-full justify-start text-destructive"
              onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-3" />
              Logout
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
                    Verified Agent
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <Badge
                  variant={
                    agent.verificationStatus === "verified"
                      ? "default"
                      : agent.verificationStatus === "pending"
                      ? "secondary"
                      : "destructive"
                  }>
                  {agent.verificationStatus.toUpperCase()}
                </Badge>
                {agent.verificationStatus === "verified" && (
                  <Shield className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {agentNavigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
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
                className="w-full justify-start text-destructive"
                onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-3" />
                Logout
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

              <div className="flex items-center space-x-4">
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
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AgentDashboardLayout;
