import { Building, Home, Info, MapPinned, Search } from "lucide-react";

export const headerNavigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Area Reviews", href: "/area-reviews", icon: MapPinned },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Building },
] as const;
