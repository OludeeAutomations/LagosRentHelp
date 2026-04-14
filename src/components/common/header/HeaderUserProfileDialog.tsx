import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { User } from "@/types";
import { getDisplayProfileImage } from "@/lib/profileImage";

interface HeaderUserProfileDialogProps {
  user: User;
  getInitials: (name: string) => string;
}

const HeaderUserProfileDialog: React.FC<HeaderUserProfileDialogProps> = ({
  user,
  getInitials,
}) => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>User Profile</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={getDisplayProfileImage(user) || undefined}
            alt={user.name}
          />
          <AvatarFallback className="bg-[#129B36] text-white text-lg">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-gray-500">{user.phone}</p>
          <p className="text-sm text-[#129B36] font-medium capitalize">
            {user.role}
          </p>
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
            {new Date(user.lastLogin).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  </DialogContent>
);

export default HeaderUserProfileDialog;
