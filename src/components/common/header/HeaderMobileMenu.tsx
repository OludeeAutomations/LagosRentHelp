import React from "react";
import {
  LogIn,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  X,
  Heart,
  Building2,
  Shield,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@/types";
import HeaderActionButton from "./HeaderActionButton";
import HeaderNavLink from "./HeaderNavLink";
import HeaderUserInfo from "./HeaderUserInfo";
import HeaderUserProfileDialog from "./HeaderUserProfileDialog";

type HeaderNavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

interface HeaderMobileMenuProps {
  isOpen: boolean;
  user: User | null;
  navigation: readonly HeaderNavItem[];
  pathname: string;
  getInitials: (name: string) => string;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}

const HeaderMobileMenu: React.FC<HeaderMobileMenuProps> = ({
  isOpen,
  user,
  navigation,
  pathname,
  getInitials,
  onToggle,
  onClose,
  onLogout,
}) => {
  return (
    <>
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-md text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-100 focus:outline-none">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200">
            <div className="py-4 space-y-4">
              {navigation.map((item) => (
                <HeaderNavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isMobile
                  onClick={onClose}
                />
              ))}

              <div className="pt-4 border-t border-gray-200 space-y-4">
                {!user ? (
                  <>
                    <HeaderActionButton
                      to="/login"
                      icon={LogIn}
                      label="Login"
                      onClick={onClose}
                    />
                    <HeaderActionButton
                      to="/register"
                      icon={LogIn}
                      label="Sign Up"
                      variant="button"
                      onClick={onClose}
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
                      onClick={onClose}
                    />

                    {(user.role === "admin" || user.role === "super_admin") && (
                      <HeaderActionButton
                        to="/admin/properties"
                        icon={Building2}
                        label="Manage Properties"
                        onClick={onClose}
                      />
                    )}

                    {user.role === "super_admin" && (
                      <HeaderActionButton
                        to="/admin/accounts"
                        icon={Shield}
                        label="Admin Accounts"
                        onClick={onClose}
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
                      onClick={onClose}
                    />

                    <HeaderActionButton
                      onClick={onLogout}
                      icon={LogOut}
                      label="Logout"
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderMobileMenu;
