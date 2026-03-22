import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import HeaderMobileMenu from "./header/HeaderMobileMenu";
import HeaderNavLink from "./header/HeaderNavLink";
import HeaderActionButton from "./header/HeaderActionButton";
import HeaderUserMenu from "./header/HeaderUserMenu";
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
  );
};

export default Header;
