// src/pages/agent/NotificationsPage.tsx
import React, { useState } from "react";
import {
  Bell,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
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

interface Notification {
  id: string;
  type: "lead" | "message" | "system" | "appointment";
  title: string;
  message: string;
  read: boolean;
  date: string;
  actionUrl?: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "lead",
      title: "New Lead Received",
      message: "Chinedu Okoro is interested in your Luxury 3-Bedroom Apartment",
      read: false,
      date: "2024-01-15T10:30:00Z",
      actionUrl: "/agent-dashboard/leads",
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      message:
        "You have a new message from Amina Yusuf regarding the 2-Bedroom Flat",
      read: false,
      date: "2024-01-15T09:15:00Z",
      actionUrl: "/agent-dashboard/messages",
    },
    {
      id: "3",
      type: "system",
      title: "Subscription Reminder",
      message:
        "Your free trial ends in 3 days. Upgrade to continue listing properties.",
      read: true,
      date: "2024-01-14T16:45:00Z",
    },
    {
      id: "4",
      type: "appointment",
      title: "Viewing Scheduled",
      message:
        "Property viewing scheduled for Luxury 3-Bedroom Apartment on Jan 20, 2024",
      read: true,
      date: "2024-01-14T14:20:00Z",
      actionUrl: "/agent-dashboard/appointments",
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    leadAlerts: true,
    messageAlerts: true,
    appointmentReminders: true,
    systemUpdates: true,
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
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
        return <Bell className="h-5 w-5" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
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
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-muted/50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-foreground">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="bg-blue-500">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {new Date(notification.date).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(notification.date).toLocaleTimeString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              {notification.actionUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={notification.actionUrl}>View</a>
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark as read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    .filter((notification) => !notification.read)
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-6 bg-blue-50 hover:bg-blue-100 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-2">
                              {notification.title}
                            </h3>
                            <p className="text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {new Date(
                                  notification.date
                                ).toLocaleDateString()}
                              </span>
                              <div className="flex items-center space-x-2">
                                {notification.actionUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={notification.actionUrl}>View</a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark as read
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
