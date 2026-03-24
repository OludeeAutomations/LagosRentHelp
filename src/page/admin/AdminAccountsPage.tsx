import React, { useEffect, useMemo, useState } from "react";
import { Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { useAuthStore } from "@/stores/authStore";
import { CreateAdminData, userService } from "@/services/userService";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";

const emptyForm: CreateAdminData = {
  name: "",
  email: "",
  phone: "",
  password: "",
};

const extractUsers = (payload: unknown): User[] => {
  if (Array.isArray((payload as { data?: unknown[] })?.data)) {
    return (payload as { data: User[] }).data;
  }

  if (Array.isArray(payload)) {
    return payload as User[];
  }

  return [];
};

const getRoleBadgeVariant = (role: User["role"]) => {
  if (role === "super_admin") return "default";
  if (role === "admin") return "secondary";
  return "outline";
};

const AdminAccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState<User[]>([]);
  const [form, setForm] = useState<CreateAdminData>(emptyForm);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "super_admin">(
    "all"
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const canManageAdmins = user?.role === "super_admin";

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const response = await userService.getAdmins({
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
      });
      setAdmins(extractUsers(response.data || response));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!canManageAdmins) {
      navigate("/");
      return;
    }

    loadAdmins();
  }, [user, canManageAdmins, navigate]);

  const visibleAdmins = useMemo(() => admins, [admins]);

  const updateForm = (field: keyof CreateAdminData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);

    try {
      await userService.createAdmin(form);
      toast.success("Admin account created");
      setForm(emptyForm);
      await loadAdmins();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create admin account");
    } finally {
      setCreating(false);
    }
  };

  const handlePromote = async (userId: string) => {
    setActionUserId(userId);
    try {
      await userService.promoteAdmin(userId);
      toast.success("Admin promoted to super admin");
      await loadAdmins();
    } catch (error) {
      console.error(error);
      toast.error("Failed to promote admin");
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmed = window.confirm(
      "Delete this admin account? This will fail if the account is still linked to properties."
    );

    if (!confirmed) {
      return;
    }

    setActionUserId(userId);
    try {
      await userService.deleteAdmin(userId);
      toast.success("Admin account deleted");
      await loadAdmins();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete admin account");
    } finally {
      setActionUserId(null);
    }
  };

  if (!canManageAdmins) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Accounts</h1>
            <p className="mt-2 text-gray-600">
              Create admin users, promote trusted admins, and keep account access
              under control.
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate("/admin/properties")}>
            Back to Properties
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Create Admin</CardTitle>
              <CardDescription>
                New admin accounts can upload and manage properties immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(event) => updateForm("phone", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) => updateForm("password", event.target.value)}
                  />
                </div>

                <Button type="submit" disabled={creating} className="w-full">
                  <UserPlus className="h-4 w-4" />
                  {creating ? "Creating..." : "Create Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Admins</CardTitle>
              <CardDescription>
                Review admin and super admin accounts, then promote or remove them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or email"
                />

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(
                      event.target.value as "all" | "admin" | "super_admin"
                    )
                  }
                  className="h-9 rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admins</option>
                  <option value="super_admin">Super Admins</option>
                </select>

                <Button variant="outline" onClick={loadAdmins} disabled={loading}>
                  Refresh
                </Button>
              </div>

              {loading ? (
                <div className="text-sm text-gray-500">Loading admin accounts...</div>
              ) : visibleAdmins.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500">
                  No admin accounts matched your filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleAdmins.map((adminUser) => {
                    const isCurrentUser = adminUser._id === user?._id;
                    const isSuperAdmin = adminUser.role === "super_admin";

                    return (
                      <div
                        key={adminUser._id}
                        className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-gray-900">
                              {adminUser.name}
                            </h2>
                            <Badge variant={getRoleBadgeVariant(adminUser.role)}>
                              {adminUser.role.replace("_", " ")}
                            </Badge>
                            {isCurrentUser && <Badge variant="outline">You</Badge>}
                          </div>
                          <div className="text-sm text-gray-600">
                            <div>{adminUser.email}</div>
                            <div>{adminUser.phone || "No phone number"}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!isSuperAdmin && (
                            <Button
                              variant="outline"
                              onClick={() => handlePromote(adminUser._id)}
                              disabled={actionUserId === adminUser._id}
                            >
                              <Shield className="h-4 w-4" />
                              Promote
                            </Button>
                          )}

                          {!isCurrentUser && (
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(adminUser._id)}
                              disabled={actionUserId === adminUser._id}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountsPage;
