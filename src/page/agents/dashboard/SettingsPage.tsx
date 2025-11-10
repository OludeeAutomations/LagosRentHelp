import React, { useState, useEffect } from "react";
import {
  Shield,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useAgentStore } from "@/stores/agentStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import VerificationForm from "@/components/common/VerificationForm";
import { useVerificationStore } from "@/stores/verificationStore";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  address: z.string().min(5, "Address is required"),
  whatsappNumber: z.string().min(10, "WhatsApp number is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const SettingsPage: React.FC = () => {
  const { user, updateProfile, agent } = useAuthStore();
  const { updateAgentProfile, fetchAgentProfile } = useAgentStore();
  const { checkVerificationStatus } = useVerificationStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (agent) {
      checkVerificationStatus();
    }
  }, [agent, checkVerificationStatus]);

  // Handle verification completion
  const handleVerificationComplete = async () => {
    await fetchAgentProfile();
    await checkVerificationStatus();
  };

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leadAlerts: true,
    messageAlerts: true,
    weeklyReports: false,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user && agent) {
      profileForm.reset({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: agent?.bio || "",
        address: agent?.residentialAddress || "",
        whatsappNumber: agent?.whatsappNumber || "",
      });
    }
  }, [user, agent, profileForm]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
      });

      await updateAgentProfile({
        bio: data.bio,
        address: data.address,
        whatsappNumber: data.whatsappNumber,
      });
      await fetchAgentProfile();

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Notification settings updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-b-black">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt={user?.name} />
                      ) : agent?.idPhoto ? (
                        <AvatarImage src={agent.idPhoto} alt={user?.name} />
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Label
                      htmlFor="avatar"
                      className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground">
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </Label>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Upload a profile picture to make your account more
                      recognizable
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder={user?.name} />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder={user?.email} />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder={user?.phone} />
                    {profileForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input id="whatsapp" placeholder={agent?.whatsappNumber} />
                    {profileForm.formState.errors.whatsappNumber && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.whatsappNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder={agent?.residentialAddress}
                    />
                    {profileForm.formState.errors.address && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder={agent?.bio}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Brief description about yourself</span>
                      <span>{profileForm.watch("bio")?.length || 0}/500</span>
                    </div>
                    {profileForm.formState.errors.bio && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.bio.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Agent Verification</CardTitle>
              <CardDescription>
                Complete your verification to access all agent features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {agent?.verificationStatus === "verified" ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : agent?.verificationStatus === "pending" ? (
                    <Clock className="h-8 w-8 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {agent?.verificationStatus === "verified"
                        ? "Verified Agent"
                        : agent?.verificationStatus === "pending"
                        ? "Verification in Progress"
                        : "Verification Required"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {agent?.verificationStatus === "verified"
                        ? "Your account has been verified successfully"
                        : agent?.verificationStatus === "pending"
                        ? "Your verification is under review. This usually takes 24-48 hours."
                        : "Complete verification to create listings and access all features"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    agent?.verificationStatus === "verified"
                      ? "default"
                      : agent?.verificationStatus === "pending"
                      ? "secondary"
                      : "outline"
                  }>
                  {agent?.verificationStatus === "verified"
                    ? "Verified"
                    : agent?.verificationStatus === "pending"
                    ? "Pending"
                    : "Not Verified"}
                </Badge>
              </div>

              {/* Show verification form only if not verified */}
              {agent?.verificationStatus !== "verified" && (
                <VerificationForm
                  onVerificationComplete={handleVerificationComplete} // ✅ Fix this prop
                />
              )}

              {/* Show verified badge if already verified */}
              {agent?.verificationStatus === "verified" && (
                <div className="text-center space-y-4 py-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-600">
                      Agent Verified
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Your identity has been successfully verified. You now have
                      full access to all agent features.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Verified Agent
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register("currentPassword")}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Shield className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("emailNotifications")
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("pushNotifications")
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="lead-alerts">Lead Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new leads
                    </p>
                  </div>
                  <Switch
                    id="lead-alerts"
                    checked={notificationSettings.leadAlerts}
                    onCheckedChange={() =>
                      handleNotificationToggle("leadAlerts")
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="message-alerts">Message Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new messages from clients
                    </p>
                  </div>
                  <Switch
                    id="message-alerts"
                    checked={notificationSettings.messageAlerts}
                    onCheckedChange={() =>
                      handleNotificationToggle("messageAlerts")
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly performance summaries
                    </p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={() =>
                      handleNotificationToggle("weeklyReports")
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
