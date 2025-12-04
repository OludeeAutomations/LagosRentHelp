import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Search,
  Info,
  Star,
  User,
  LogIn,
  LogOut,
  Shield,
  Building,
  Heart,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, agent, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Building },
    { name: "Features", href: "/features", icon: Star },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Navigation Link Component
  const NavLink: React.FC<{
    item: { name: string; href: string; icon: React.ElementType };
    isMobile?: boolean;
    onClick?: () => void;
  }> = ({ item, isMobile = false, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.href;

    return (
      <Link
        key={item.href} // Use href as unique key since it should be unique
        to={item.href}
        onClick={onClick}
        className={`flex items-center space-x-${
          isMobile ? "3" : "1"
        } px-3 py-2 rounded-md ${
          isMobile ? "text-base" : "text-sm"
        } font-medium transition-colors ${
          isActive
            ? "text-[#129B36] bg-[#129B36]/10"
            : "text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50"
        }`}>
        <Icon
          className={`h-${isMobile ? "5" : "4"} w-${isMobile ? "5" : "4"}`}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  // User Profile Dialog Component
  const UserProfileDialog: React.FC<{ user: any; agent: any }> = ({
    user,
    agent,
  }) => (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>User Profile</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#129B36] text-white text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
            <p className="text-gray-500">{user.phone}</p>
            <p className="text-sm text-[#129B36] font-medium capitalize">
              {user.role}
            </p>
            {agent && (
              <p className="text-sm text-gray-500 capitalize">
                Verification: {agent.verificationStatus}
              </p>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Member since:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          {user.lastLogin && (
            <p className="text-sm">
              <strong>Last login:</strong>{" "}
              {new Date(user.lastLogin).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </DialogContent>
  );

  // User Info Component
  const UserInfo: React.FC<{ user: any; agent: any; isMobile?: boolean }> = ({
    user,
    agent,
    isMobile = false,
  }) => (
    <div
      className={`flex items-center space-x-${isMobile ? "3" : "2"} ${
        isMobile ? "px-3 py-2" : ""
      }`}>
      <Avatar className={`${isMobile ? "h-8 w-8" : "h-10 w-10"}`}>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="bg-[#129B36] text-white">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p
          className={`${
            isMobile ? "text-sm" : "text-sm"
          } font-medium text-gray-900 truncate`}>
          {user.name}
        </p>
        <p
          className={`${
            isMobile ? "text-xs" : "text-sm"
          } text-gray-500 truncate`}>
          {user.email}
        </p>
        {agent && (
          <p
            className={`${
              isMobile ? "text-xs" : "text-xs"
            } text-[#129B36] font-medium capitalize`}>
            {agent.verificationStatus} Agent
          </p>
        )}
      </div>
    </div>
  );

  // Action Button Component
  const ActionButton: React.FC<{
    to?: string;
    onClick?: () => void;
    icon: React.ElementType;
    label: string;
    variant?: "link" | "button";
    className?: string;
  }> = ({
    to,
    onClick,
    icon: Icon,
    label,
    variant = "link",
    className = "",
  }) => {
    const baseClasses =
      "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors";

    if (variant === "button") {
      return (
        <Link
          to={to || "#"}
          onClick={onClick}
          className={`flex items-center justify-center w-full bg-[#129B36] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#41614F] transition-colors ${className}`}>
          {label}
        </Link>
      );
    }

    const content = (
      <>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </>
    );

    if (to) {
      return (
        <Link
          to={to}
          onClick={onClick}
          className={`${baseClasses} ${className}`}>
          {content}
        </Link>
      );
    }

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} w-full text-left ${className}`}>
        {content}
      </button>
    );
  };

  // Desktop User Actions
  const DesktopUserActions = () => {
    if (!user) {
      return (
        <div className="hidden md:flex items-center space-x-4">
          <ActionButton
            to="/login"
            icon={LogIn}
            label="Login"
            className="!space-x-2 !text-sm"
          />
          <ActionButton
            to="/register"
            icon={LogIn}
            label="Sign Up"
            variant="button"
          />
        </div>
      );
    }

    return (
      <div className="hidden md:flex items-center space-x-4">
        <ActionButton
          to="/dashboard/favorites"
          icon={Heart}
          label="Favorites"
          className="!space-x-2 !text-sm"
        />

        {agent ? (
          <ActionButton
            to="/agent-dashboard"
            icon={Shield}
            label="Agent Dashboard"
            className="!space-x-2 !text-sm"
          />
        ) : (
          <ActionButton
            to="/agent-signup"
            icon={Building}
            label="Become Agent"
            className="!space-x-2 !text-sm"
          />
        )}

        <Popover>
          <PopoverTrigger>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[#129B36] text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <UserInfo user={user} agent={agent} />
            <Separator className="my-3" />
            <div className="space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm font-normal">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </DialogTrigger>
                <UserProfileDialog user={user} agent={agent} />
              </Dialog>

              <Link to="/settings">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-normal">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>

              <Separator className="my-3" />

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Mobile Menu Content
  const MobileMenuContent = () => {
    if (!user) {
      return (
        <>
          <ActionButton
            to="/login"
            icon={LogIn}
            label="Login"
            onClick={closeMenu}
          />
          <ActionButton
            to="/register"
            icon={LogIn}
            label="Sign Up"
            variant="button"
            onClick={closeMenu}
          />
        </>
      );
    }

    return (
      <>
        <div className="px-3 py-2">
          <UserInfo user={user} agent={agent} isMobile />
        </div>

        <ActionButton
          to="/dashboard/favorites"
          icon={Heart}
          label="Favorites"
          onClick={closeMenu}
        />

        {agent ? (
          <ActionButton
            to="/agent-dashboard"
            icon={Shield}
            label="Agent Dashboard"
            onClick={closeMenu}
          />
        ) : (
          <ActionButton
            to="/agent-signup"
            icon={Building}
            label="Become Agent"
            onClick={closeMenu}
          />
        )}

        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
              <User className="h-5 w-5" />
              <span>View Profile</span>
            </button>
          </DialogTrigger>
          <UserProfileDialog user={user} agent={agent} />
        </Dialog>

        <ActionButton
          to="/settings"
          icon={Settings}
          label="Settings"
          onClick={closeMenu}
        />

        <ActionButton onClick={handleLogout} icon={LogOut} label="Logout" />
      </>
    );
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/icon.png" alt="LagosRentHelp Logo" className="w-14" />
            <span className="text-xl font-bold text-[#0E0E0E] block">
              LagosRentHelp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <DesktopUserActions />

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-100 focus:outline-none">
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200">
              <div className="py-4 space-y-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isMobile
                    onClick={closeMenu}
                  />
                ))}

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <MobileMenuContent />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
