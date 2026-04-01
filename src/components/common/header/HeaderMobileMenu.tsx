import React from "react";
import { Menu, X } from "lucide-react";
import { User } from "@/types";

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
    <button
      onClick={onToggle}
      className="md:hidden p-2 rounded-md text-[#0E0E0E] hover:text-[#129B36] hover:bg-gray-100 focus:outline-none">
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};

export default HeaderMobileMenu;
