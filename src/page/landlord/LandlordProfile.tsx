import { useEffect, useState } from "react";
import { Contact, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { landlordService } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";

const LandlordProfile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "rejected"
  >("pending");
  const [form, setForm] = useState({
    businessName: "",
    whatsappNumber: user?.phone || "",
    residentialAddress: "",
    bio: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await landlordService.getProfile();
        if (!profile) return;
        setForm({
          businessName: profile.businessName,
          whatsappNumber: profile.whatsappNumber,
          residentialAddress: profile.residentialAddress,
          bio: profile.bio,
        });
        setVerificationStatus(profile.verificationStatus);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load profile.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.businessName.trim() || !form.whatsappNumber.trim() || !form.residentialAddress.trim()) {
      toast.error("Complete all required fields.");
      return;
    }

    setSaving(true);
    try {
      await landlordService.completeOnboarding(form);
      if (user) setUser({ ...user, phone: form.whatsappNumber.trim() });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#129B36]" /></div>;
  }

  return (
    <div className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Contact className="h-5 w-5 text-[#129B36]" strokeWidth={1.8} />Landlord details</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={save}>
              <div className="space-y-2"><Label htmlFor="profileBusinessName">Display or business name *</Label><Input id="profileBusinessName" value={form.businessName} onChange={(event) => update("businessName", event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="profileWhatsapp">WhatsApp number *</Label><Input id="profileWhatsapp" placeholder="+234..." value={form.whatsappNumber} onChange={(event) => update("whatsappNumber", event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="profileAddress">Residential or office address *</Label><Input id="profileAddress" value={form.residentialAddress} onChange={(event) => update("residentialAddress", event.target.value)} /><p className="text-xs text-gray-500">This address remains private.</p></div>
              <div className="space-y-2"><Label htmlFor="profileBio">Short description</Label><Textarea id="profileBio" rows={5} value={form.bio} onChange={(event) => update("bio", event.target.value)} /></div>
              <Button type="submit" disabled={saving} className="bg-[#129B36] hover:bg-[#0e7d2b]">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3"><User className="mt-0.5 h-5 w-5 text-gray-400" /><div className="min-w-0"><p className="text-xs text-gray-500">Account name</p><p className="truncate text-sm font-medium">{user?.name}</p></div></div>
              <div className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 text-gray-400" /><div className="min-w-0"><p className="text-xs text-gray-500">Email address</p><p className="truncate text-sm font-medium">{user?.email}</p></div></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-[#129B36]" />Verification</CardTitle></CardHeader>
            <CardContent>
              <Badge
                variant="outline"
                className={`capitalize ${
                  verificationStatus === "verified"
                    ? "border-green-200 bg-green-100 text-green-700"
                    : verificationStatus === "rejected"
                      ? "border-red-200 bg-red-100 text-red-700"
                      : "border-amber-200 bg-amber-100 text-amber-700"
                }`}>
                {verificationStatus}
              </Badge>
              <p className="mt-3 text-sm text-gray-500">{verificationStatus === "verified" ? "Your landlord profile has been verified." : verificationStatus === "rejected" ? "Your verification needs attention. Contact support for assistance." : "Your landlord profile is waiting for administrator review."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LandlordProfile;
