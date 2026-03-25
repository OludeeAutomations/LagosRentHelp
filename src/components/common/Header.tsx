import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { User as UserIcon, LogIn, Heart, Building2, Shield, Settings, LogOut } from "lucide-react";
import HeaderMobileMenu from "./header/HeaderMobileMenu";
import HeaderNavLink from "./header/HeaderNavLink";
import HeaderActionButton from "./header/HeaderActionButton";
import HeaderUserMenu from "./header/HeaderUserMenu";
import HeaderUserInfo from "./header/HeaderUserInfo";
import HeaderUserProfileDialog from "./header/HeaderUserProfileDialog";
import { headerNavigation } from "./header/headerConfig";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

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

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img src="/icon.png" alt="LagosRentHelp Logo" className="w-14" />
              <span className="text-xl font-bold text-[#0E0E0E]">LagosRentHelp</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {headerNavigation.map((item) => (
                <HeaderNavLink
                  key={item.href}
                  item={item}
                  isActive={location.pathname === item.href}
                />
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {!user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <HeaderActionButton
                    to="/login"
                    icon={undefined}
                    label="Login"
                    className="!space-x-2 !text-sm"
                  />
                  <HeaderActionButton
                    to="/register"
                    icon={undefined}
                    label="Sign Up"
                    variant="button"
                  />
                </div>
              ) : (
                <HeaderUserMenu
                  user={user}
                  getInitials={getInitials}
                  onLogout={handleLogout}
                />
              )}

              <HeaderMobileMenu
                isOpen={isMenuOpen}
                user={user}
                navigation={headerNavigation}
                pathname={location.pathname}
                getInitials={getInitials}
                onToggle={toggleMenu}
                onClose={closeMenu}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 sticky top-[80px] z-40">
          <div className="px-4 py-4 space-y-4">
            {headerNavigation.map((item) => (
              <HeaderNavLink
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
                isMobile
                onClick={closeMenu}
              />
            ))}

            <div className="pt-4 border-t border-gray-200 space-y-4">
                {!user ? (
                  <>
                    <HeaderActionButton
                      to="/login"
                      icon={LogIn}
                      label="Login"
                      onClick={closeMenu}
                    />
                    <HeaderActionButton
                      to="/register"
                      icon={LogIn}
                      label="Sign Up"
                      variant="button"
                      onClick={closeMenu}
                    />
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2">
                      <HeaderUserInfo
                        user={user}
                        getInitials={getInitials}
                        isMobile
                      />
                    </div>

                    <HeaderActionButton
                      to="/dashboard/favorites"
                      icon={Heart}
                      label="Favorites"
                      onClick={closeMenu}
                    />

                    {(user.role === "admin" || user.role === "super_admin") && (
                      <HeaderActionButton
                        to="/admin/properties"
                        icon={Building2}
                        label="Manage Properties"
                        onClick={closeMenu}
                      />
                    )}

                    {user.role === "super_admin" && (
                      <HeaderActionButton
                        to="/admin/accounts"
                        icon={Shield}
                        label="Admin Accounts"
                        onClick={closeMenu}
                      />
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-50 transition-colors">
                          <UserIcon className="h-5 w-5" />
                          <span>View Profile</span>
                        </button>
                      </DialogTrigger>
                      <HeaderUserProfileDialog
                        user={user}
                        getInitials={getInitials}
                      />
                    </Dialog>

                    <HeaderActionButton
                      to="/settings"
                      icon={Settings}
                      label="Settings"
                      onClick={closeMenu}
                    />

                    <HeaderActionButton
                      onClick={handleLogout}
                      icon={LogOut}
                      label="Logout"
                    />
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
