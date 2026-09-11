import { useCallback, useEffect, useState } from "react";
import { Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import {
  adminVerificationService,
  type AdminAccount,
} from "@/services/adminVerificationService";

const PRIMARY_ADMIN_EMAIL = "info@lagosrenthelp.ng";

const AdminAccountsPage = () => {
  const user = useAuthStore((state) => state.user);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      setAdmins(await adminVerificationService.getAdmins());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load administrators.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAdmins();
  }, [loadAdmins]);

  const addAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    try {
      await adminVerificationService.addAdminByEmail(email);
      toast.success("Administrator access granted.");
      setEmail("");
      await loadAdmins();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add administrator.");
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (admin: AdminAccount) => {
    if (!window.confirm(`Remove administrator access from ${admin.email}?`)) return;
    setActionId(admin.id);
    try {
      await adminVerificationService.removeAdmin(admin.id);
      toast.success("Administrator access removed.");
      await loadAdmins();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove administrator.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="w-full space-y-6">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Add an administrator</CardTitle>
              <CardDescription>
                For security, the person must register a normal LagosRentHelp account first. Then enter that account email here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={addAdmin}>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Registered email address</Label>
                  <Input id="adminEmail" type="email" placeholder="person@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
                <Button type="submit" className="w-full bg-[#129B36] hover:bg-[#0e7d2b]" disabled={adding}>
                  <UserPlus /> {adding ? "Adding..." : "Grant admin access"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>Only the primary administrator can add or remove staff access.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Loading administrators...</p>
              ) : admins.length === 0 ? (
                <p className="rounded-lg border border-dashed p-6 text-sm text-gray-500">No administrator profiles found.</p>
              ) : (
                <div className="space-y-3">
                  {admins.map((admin) => {
                    const isPrimary = admin.email.toLowerCase() === PRIMARY_ADMIN_EMAIL;
                    const isCurrent = admin.id === user?._id;
                    return (
                      <div key={admin.id} className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-950">{admin.name}</p>
                            <Badge variant={isPrimary ? "default" : "outline"}>{isPrimary ? "Primary admin" : "Admin"}</Badge>
                            {isCurrent && <Badge variant="secondary">You</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{admin.email}</p>
                          {admin.phone && <p className="text-sm text-gray-500">{admin.phone}</p>}
                        </div>
                        {!isPrimary && !isCurrent && (
                          <Button variant="destructive" disabled={actionId === admin.id} onClick={() => void removeAdmin(admin)}>
                            <Trash2 /> Remove access
                          </Button>
                        )}
                        {isPrimary && <Shield className="h-6 w-6 text-[#129B36]" aria-label="Protected primary administrator" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AdminAccountsPage;
