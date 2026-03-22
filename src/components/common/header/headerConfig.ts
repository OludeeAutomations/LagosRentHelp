import { Building, Home, Info, Search, Star } from "lucide-react";

export const headerNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Building },
  { name: "Features", href: "/features", icon: Star },
] as const;
