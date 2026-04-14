import type { User } from "@/types";

export const COMPANY_LOGO_URL =
  "https://picsum.photos/seed/lagos-rent-help-admin-avatar/200/200";

export const isAdminRole = (role?: User["role"] | null) =>
  role === "admin" || role === "super_admin";

export const getDisplayProfileImage = (
  user?: Pick<User, "role" | "avatar" | "displayAvatar"> | null
) => {
  const displayAvatar = user?.displayAvatar?.trim();
  const avatar = user?.avatar?.trim();

  if (displayAvatar) {
    return displayAvatar;
  }

  if (avatar) {
    return avatar;
  }

  return isAdminRole(user?.role) ? COMPANY_LOGO_URL : "";
};
