import React from "react";
import { Link } from "react-router-dom";

type HeaderNavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

interface HeaderNavLinkProps {
  item: HeaderNavItem;
  isActive: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}

const HeaderNavLink: React.FC<HeaderNavLinkProps> = ({
  item,
  isActive,
  isMobile = false,
  onClick,
}) => {
  const Icon = item.icon;

  return (
    <Link
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
      <Icon className={`h-${isMobile ? "5" : "4"} w-${isMobile ? "5" : "4"}`} />
      <span>{item.name}</span>
    </Link>
  );
};

export default HeaderNavLink;
