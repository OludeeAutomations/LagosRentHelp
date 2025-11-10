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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/icon.png" alt="" className=" w-14" />

            <span className="text-xl font-bold text-[#0E0E0E] block">
              LagosRentHelp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={`${item.name}-${item.href}`}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#129B36] bg-[#129B36]/10"
                      : "text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50"
                  }`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/dashboard/favorites"
                  className="flex items-center space-x-2 text-[#0E0E0E] hover:text-[#129B36] transition-colors">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">Favorites</span>
                </Link>

                {agent ? (
                  <Link
                    to="/agent-dashboard"
                    className="flex items-center space-x-2 text-[#0E0E0E] hover:text-[#129B36] transition-colors">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Agent Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/agent-signup"
                    className="flex items-center space-x-2 text-[#0E0E0E] hover:text-[#129B36] transition-colors">
                    <Building className="h-5 w-5" />
                    <span className="text-sm font-medium">Become Agent</span>
                  </Link>
                )}

                {/* Profile Popover */}
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
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-[#129B36] text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        {agent && (
                          <p className="text-xs text-[#129B36] font-medium capitalize">
                            {agent.verificationStatus} Agent
                          </p>
                        )}
                      </div>
                    </div>

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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>User Profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.name}
                                />
                                <AvatarFallback className="bg-[#129B36] text-white text-lg">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {user.name}
                                </h3>
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
                                  {new Date(
                                    user.lastLogin
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Link to="/dashboard/settings">
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
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-[#0E0E0E] hover:text-[#129B36] transition-colors">
                  <LogIn className="h-5 w-5" />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-[#129B36] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#41614F] transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

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
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive
                          ? "text-[#129B36] bg-[#129B36]/10"
                          : "text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50"
                      }`}>
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  {user ? (
                    <>
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-[#129B36] text-white text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/dashboard/favorites"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                        <Heart className="h-5 w-5" />
                        <span>Favorites</span>
                      </Link>

                      {agent ? (
                        <Link
                          to="/agent-dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                          <Shield className="h-5 w-5" />
                          <span>Agent Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          to="/agent-signup"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                          <Building className="h-5 w-5" />
                          <span>Become Agent</span>
                        </Link>
                      )}

                      <Link
                        to="/dashboard/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                        <LogIn className="h-5 w-5" />
                        <span>Login</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center w-full bg-[#129B36] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#41614F] transition-colors">
                        Sign Up
                      </Link>
                    </>
                  )}
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
