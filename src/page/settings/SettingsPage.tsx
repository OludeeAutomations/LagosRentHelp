import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { User } from "@/types";
import {
  COMPANY_LOGO_URL,
  getDisplayProfileImage,
  isAdminRole,
} from "@/lib/profileImage";
import {
  Bell,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User as UserIcon,
} from "lucide-react";

const SettingsPage: React.FC = () => {
  const { user, updateProfile, changePassword, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const canUploadProfilePicture = isAdminRole(user?.role ?? null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    bookingUpdates: true,
    newListings: true,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || "",
      location: (user as any).location || (user as any).address || "",
    });
    setAvatarPreview(getDisplayProfileImage(user) || null);
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canUploadProfilePicture) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;

      setAvatarPreview(preview);
      setProfileData((prev) => ({
        ...prev,
        avatar: preview,
      }));

      if (user) {
        setUser({
          ...user,
          avatar: preview,
          displayAvatar: preview,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const payload: Partial<User> = {
        name: profileData.name,
        phone: profileData.phone,
      };

      if (canUploadProfilePicture && profileData.avatar) {
        payload.avatar = profileData.avatar;
      }

      await updateProfile(payload);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(
        securityData.currentPassword,
        securityData.newPassword
      );
      toast.success("Password changed successfully");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
    toast.success("Notification preferences updated");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" /> Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(event) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="pl-10 bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contact support to change email.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(event) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        className="pl-10"
                        placeholder="+234..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile Picture</Label>
                    <p className="text-sm text-gray-500">
                      {canUploadProfilePicture
                        ? "Admins and super admins can upload a profile picture here."
                        : "Profile picture upload is available only for admin and super admin accounts."}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <div className="h-20 w-20 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt={
                              avatarPreview === COMPANY_LOGO_URL
                                ? "Company logo"
                                : "Profile preview"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                            No image
                          </div>
                        )}
                      </div>

                      {canUploadProfilePicture ? (
                        <label
                          htmlFor="avatar"
                          className="cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Choose image
                          <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      ) : (
                        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          {avatarPreview === COMPANY_LOGO_URL
                            ? "Your account is currently showing the company logo."
                            : "No upload option for this account type."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(event) =>
                          setProfileData((prev) => ({
                            ...prev,
                            location: event.target.value,
                          }))
                        }
                        className="pl-10"
                        placeholder="City, State"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Type</CardTitle>
                <CardDescription>
                  Your current account permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-semibold capitalize">{user.role}</p>
                    <p className="text-sm text-gray-600">
                      {user.role === "super_admin"
                        ? "Super Admin Account"
                        : user.role === "admin"
                          ? "Admin Account"
                          : user.role === "agent"
                            ? "Agent Account"
                            : "User Account"}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    Active
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" /> Change Password
                </CardTitle>
                <CardDescription>Update your password.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={securityData.currentPassword}
                        onChange={(event) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            currentPassword: event.target.value,
                          }))
                        }
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-2 h-6 w-6 p-0"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={securityData.newPassword}
                        onChange={(event) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            newPassword: event.target.value,
                          }))
                        }
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-2 h-6 w-6 p-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={securityData.confirmPassword}
                        onChange={(event) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-2 h-6 w-6 p-0"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading} variant="default">
                      {isLoading ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Manage your email preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        handleNotificationChange(key, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
