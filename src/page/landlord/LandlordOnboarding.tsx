import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { landlordService } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";

const LandlordOnboarding = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    whatsappNumber: user?.phone || "",
    residentialAddress: "",
    bio: "",
  });

  useEffect(() => {
    if (user?.role !== "landlord") return;
    void landlordService.getProfile().then((profile) => {
      if (!profile) return;
      setForm({
        businessName: profile.businessName,
        whatsappNumber: profile.whatsappNumber,
        residentialAddress: profile.residentialAddress,
        bio: profile.bio,
      });
    });
  }, [user?.role]);

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.businessName || !form.whatsappNumber || !form.residentialAddress) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await landlordService.completeOnboarding(form);
      if (user) {
        setUser({ ...user, role: "landlord", phone: form.whatsappNumber.trim() });
      }
      toast.success("Your landlord profile is ready.");
      navigate("/landlord", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Onboarding failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set up your landlord profile"
      subtitle="Add your details before accessing the landlord dashboard."
      sideTitle="List Properties With Confidence"
      sideSubtitle="Reach renters across Lagos and manage every listing in one place."
      sideIcon={Building2}>
          <form className="space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="businessName">Display or business name *</Label>
              <Input id="businessName" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp number *</Label>
              <Input id="whatsappNumber" placeholder="+234..." value={form.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="residentialAddress">Residential or office address *</Label>
              <Input id="residentialAddress" value={form.residentialAddress} onChange={(e) => update("residentialAddress", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short description</Label>
              <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-[#129B36] hover:bg-[#0e7d2b]" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue to landlord dashboard
            </Button>
          </form>
    </AuthLayout>
  );
};

export default LandlordOnboarding;
