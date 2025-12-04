// src/pages/agent/NotificationsPage.tsx
import React, { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotificationStore } from "@/stores/notificationStore";
import { Notification } from "@/types";
import { formatDistanceToNow, format } from "date-fns";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    fetchNotifications,
  } = useNotificationStore();

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leadAlerts: true,
    messageAlerts: true,
    appointmentReminders: true,
    systemUpdates: true,
  });

  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        await fetchNotifications();
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    for (const notification of unreadNotifications) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error(
          `Failed to mark notification ${notification.id} as read:`,
          error
        );
      }
    }
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDialogOpen(true);

    // Mark as read when viewing
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "lead":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: Notification["type"]) => {
    switch (type) {
      case "lead":
        return "New Lead";
      case "message":
        return "Message";
      case "system":
        return "System";
      case "appointment":
        return "Appointment";
      default:
        return "Notification";
    }
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        full: format(date, "PPPP 'at' p"),
        dateOnly: format(date, "MMM d, yyyy"),
        timeOnly: format(date, "h:mm a"),
      };
    } catch (error) {
      return {
        relative: "Recently",
        full: "Unknown date",
        dateOnly: "Unknown",
        timeOnly: "Unknown",
      };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage your notifications and preferences
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-5 w-5 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {selectedNotification &&
                  getNotificationIcon(selectedNotification.type)}
                {getNotificationTypeLabel(
                  selectedNotification?.type || "system"
                )}
              </span>
              {selectedNotification && !selectedNotification.isRead && (
                <Badge variant="default" className="bg-blue-500">
                  New
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedNotification &&
                formatNotificationDate(selectedNotification.createdAt).full}
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {selectedNotification.title}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.metadata && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Additional Details:
                    </h4>
                    <pre className="text-sm bg-muted p-3 rounded-md overflow-auto">
                      {JSON.stringify(selectedNotification.metadata, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              {selectedNotification.actionUrl && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <Button asChild>
                      <a
                        href={selectedNotification.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer">
                        View Details
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <>
              <Button variant="outline" onClick={handleMarkAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
              <Button variant="outline" onClick={handleClearAll}>
                <X className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                  <p className="text-muted-foreground">
                    You don't have any notifications yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const dateInfo = formatNotificationDate(
                      notification.createdAt
                    );

                    return (
                      <div
                        key={notification.id}
                        className={`p-6 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification.isRead
                            ? "bg-blue-50 hover:bg-blue-100"
                            : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}>
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <Badge
                                    variant="default"
                                    className="bg-blue-500">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {notification.type}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {dateInfo.relative}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notification);
                                  }}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await handleMarkAsRead(notification.id);
                                    }}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardContent className="p-0">
              {unreadCount === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    You don't have any unread notifications.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter((notification) => !notification.isRead)
                    .map((notification) => {
                      const dateInfo = formatNotificationDate(
                        notification.createdAt
                      );

                      return (
                        <div
                          key={notification.id}
                          className="p-6 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}>
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {notification.title}
                                </h3>
                                <Badge variant="outline" className="capitalize">
                                  {notification.type}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {dateInfo.relative}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotificationClick(notification);
                                    }}>
                                    View Details
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await handleMarkAsRead(notification.id);
                                    }}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark as read
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Customize how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Notification Channels</h3>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailNotifications: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
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
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        pushNotifications: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Notification Types</h3>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label htmlFor="lead-alerts">Lead Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify me about new leads
                    </p>
                  </div>
                  <Switch
                    id="lead-alerts"
                    checked={notificationSettings.leadAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        leadAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label htmlFor="message-alerts">Message Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify me about new messages
                    </p>
                  </div>
                  <Switch
                    id="message-alerts"
                    checked={notificationSettings.messageAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        messageAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label htmlFor="appointment-reminders">
                      Appointment Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remind me about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    id="appointment-reminders"
                    checked={notificationSettings.appointmentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        appointmentReminders: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify me about system updates and maintenance
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        systemUpdates: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;
