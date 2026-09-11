import { useState } from "react";
import { Loader2, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Your name and phone number are required.");
      return;
    }

    setPhoneError("");
    setSubmitting(true);
    try {
      const updatedUser = await authService.completeUserProfile(name, phone);
      setUser(updatedUser);
      toast.success("Profile completed.");
      const needsRenterPreferences = localStorage.getItem("needs_renter_preferences") === "true";
      navigate(
        updatedUser.role === "admin" || updatedUser.role === "super_admin"
          ? "/admin/verifications"
          : updatedUser.role === "landlord"
            ? "/landlord"
            : needsRenterPreferences
              ? "/renter/preferences"
            : "/",
        { replace: true },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save your profile.";
      if (message.includes("phone number is already linked")) {
        setPhoneError(message);
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Complete your profile" subtitle="Google verified your identity. Add your contact details to continue.">
      <form className="space-y-5" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor="profileName">Full name *</Label>
          <div className="relative"><User className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><Input id="profileName" className="pl-10" value={name} onChange={(event) => setName(event.target.value)} /></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="profilePhone">Phone number *</Label>
          <div className="relative"><Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><Input id="profilePhone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(phoneError)} aria-describedby={phoneError ? "profilePhoneError" : undefined} className="pl-10" placeholder="+234..." value={phone} onChange={(event) => { setPhone(event.target.value); setPhoneError(""); }} /></div>
          {phoneError && <p id="profilePhoneError" role="alert" className="text-sm text-red-600">{phoneError}</p>}
        </div>
        <Button type="submit" className="w-full bg-[#129B36] hover:bg-[#0e7d2b]" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>
    </AuthLayout>
  );
};

export default CompleteProfile;
