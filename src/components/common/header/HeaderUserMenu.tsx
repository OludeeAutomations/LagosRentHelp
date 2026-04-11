import React from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  Settings,
  User as UserIcon,
  Building2,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import HeaderActionButton from "./HeaderActionButton";
import HeaderUserInfo from "./HeaderUserInfo";
import HeaderUserProfileDialog from "./HeaderUserProfileDialog";

interface HeaderUserMenuProps {
  user: User;
  getInitials: (name: string) => string;
  onLogout: () => void;
}

const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  user,
  getInitials,
  onLogout,
}) => {
  return (
    <div className="flex items-center space-x-3 lg:space-x-4">
      <HeaderActionButton
        to="/dashboard/favorites"
        icon={Heart}
        label="Favorites"
        className="!space-x-2 !text-sm hidden sm:flex"
      />

      <Popover>
        <PopoverTrigger>
          <Button
            variant="ghost"
            className="flex items-center space-x-1.5 lg:space-x-2 p-1.5 lg:p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Avatar className="h-7 lg:h-8 w-7 lg:w-8">
              <AvatarImage src={user.avatar || "/icon.png"} alt={user.name} />
              <AvatarFallback className="bg-[#129B36] text-white text-xs lg:text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 lg:h-4 w-3 lg:w-4 text-gray-600 hidden sm:block" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 sm:w-64 p-3 sm:p-4" align="end">
          <HeaderUserInfo user={user} getInitials={getInitials} />
          <Separator className="my-2 sm:my-3" />
          <div className="space-y-1 sm:space-y-2">
            {(user.role === "admin" || user.role === "super_admin") && (
              <Link to="/admin/properties">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs sm:text-sm font-normal">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Properties
                </Button>
              </Link>
            )}

            {user.role === "super_admin" && (
              <Link to="/admin/accounts">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs sm:text-sm font-normal">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Accounts
                </Button>
              </Link>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs sm:text-sm font-normal">
                  <UserIcon className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </DialogTrigger>
              <HeaderUserProfileDialog user={user} getInitials={getInitials} />
            </Dialog>

            <Link to="/settings">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs sm:text-sm font-normal">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>

            <Separator className="my-2 sm:my-3" />

            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start text-xs sm:text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default HeaderUserMenu;
