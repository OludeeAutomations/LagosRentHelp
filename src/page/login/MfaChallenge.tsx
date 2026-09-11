import { useEffect, useState } from "react";
import { KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountSecurityService, type TotpFactor } from "@/services/accountSecurityService";
import { useAuthStore } from "@/stores/authStore";

const safeReturnPath = (value: string | null) =>
  value?.startsWith("/") && !value.startsWith("//") && value !== "/mfa-challenge"
    ? value
    : null;

const MfaChallenge = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [factor, setFactor] = useState<TotpFactor | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const defaultDestination = user?.role === "admin" || user?.role === "super_admin"
    ? "/admin/verifications"
    : user?.role === "landlord"
      ? "/landlord"
      : "/";

  useEffect(() => {
    let active = true;

    const prepareChallenge = async () => {
      try {
        const required = await accountSecurityService.requiresMfaChallenge();
        if (!required) {
          const destination = safeReturnPath(localStorage.getItem("mfa_return_to")) || defaultDestination;
          localStorage.removeItem("mfa_return_to");
          navigate(destination, { replace: true });
          return;
        }

        const factors = await accountSecurityService.listTotpFactors();
        const verified = factors.find((item) => item.status === "verified") || null;
        if (!verified) throw new Error("No verified authenticator is available for this account.");
        if (active) setFactor(verified);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Could not prepare two-factor verification.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void prepareChallenge();
    return () => {
      active = false;
    };
  }, [defaultDestination, navigate]);

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factor || !/^\d{6}$/.test(code)) {
      toast.error("Enter the six-digit code from your authenticator app.");
      return;
    }

    setVerifying(true);
    try {
      await accountSecurityService.verifyTotp(factor.id, code);
      const destination = safeReturnPath(localStorage.getItem("mfa_return_to")) || defaultDestination;
      localStorage.removeItem("mfa_return_to");
      toast.success("Identity confirmed.");
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That verification code was not accepted.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("mfa_return_to");
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <AuthLayout title="Two-factor verification" subtitle="Confirm it is really you before continuing">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#129B36]" />
        </div>
      ) : (
        <form className="space-y-6" onSubmit={verifyCode}>
          <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Open Google Authenticator and enter the current six-digit code for LagosRentHelp.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mfa-code">Authenticator code</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                id="mfa-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="h-12 pl-11 text-center text-lg tracking-[0.35em]"
                placeholder="000000"
                disabled={!factor || verifying}
              />
            </div>
          </div>

          <Button type="submit" className="h-12 w-full bg-[#129B36] hover:bg-[#0e7d2b]" disabled={!factor || verifying}>
            {verifying && <Loader2 className="animate-spin" />}
            Verify and continue
          </Button>

          <Button type="button" variant="ghost" className="w-full gap-2 text-gray-600" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out and use another account
          </Button>
        </form>
      )}
    </AuthLayout>
  );
};

export default MfaChallenge;
