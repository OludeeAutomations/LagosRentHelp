import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { getDisplayProfileImage } from "@/lib/profileImage";

interface HeaderUserInfoProps {
  user: User;
  getInitials: (name: string) => string;
  isMobile?: boolean;
}

const HeaderUserInfo: React.FC<HeaderUserInfoProps> = ({
  user,
  getInitials,
  isMobile = false,
}) => (
  <div
    className={`flex items-center space-x-${isMobile ? "3" : "2"} ${
      isMobile ? "px-3 py-2" : ""
    }`}>
    <Avatar className={`${isMobile ? "h-8 w-8" : "h-10 w-10"}`}>
      <AvatarImage
        src={getDisplayProfileImage(user) || undefined}
        alt={user.name}
      />
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
    </div>
  </div>
);

export default HeaderUserInfo;
