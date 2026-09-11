import { useEffect, useState } from "react";
import {
  Apple,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountSecurityService, type TotpEnrollment, type TotpFactor } from "@/services/accountSecurityService";
import { useAuthStore } from "@/stores/authStore";

const GooglePlayMark = () => (
  <svg viewBox="0 0 512 512" aria-hidden="true" className="h-8 w-8 shrink-0">
    <path fill="#00d7fe" d="M47 28c-8 8-13 20-13 35v386c0 15 5 27 13 35l3 3 216-216v-5L50 25l-3 3Z" />
    <path fill="#00f076" d="m338 343-72-72v-5l72-72 3 2 85 48c24 13 24 35 0 49l-85 48-3 2Z" />
    <path fill="#ffce00" d="m341 341-75-75L47 485c13 14 34 15 58 2l236-134v-12Z" />
    <path fill="#ff3a44" d="M341 196 105 62C81 48 60 50 47 64l219 207 75-75Z" />
  </svg>
);

const DashboardSecuritySettings = () => {
  const user = useAuthStore((state) => state.user);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingFactors, setLoadingFactors] = useState(true);
  const [securityAction, setSecurityAction] = useState<string | null>(null);

  const verifiedFactor = factors.find((factor) => factor.status === "verified");

  const loadFactors = async () => {
    setLoadingFactors(true);
    try {
      setFactors(await accountSecurityService.listTotpFactors());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load two-factor settings.");
    } finally {
      setLoadingFactors(false);
    }
  };

  useEffect(() => {
    void loadFactors();
  }, []);

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Your new password must contain at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    setSecurityAction("password");
    try {
      await accountSecurityService.changePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setSecurityAction(null);
    }
  };

  const sendResetLink = async () => {
    if (!user?.email) return;
    setSecurityAction("reset");
    try {
      await accountSecurityService.sendPasswordReset(user.email);
      toast.success("Password setup link sent to your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the password link.");
    } finally {
      setSecurityAction(null);
    }
  };

  const startEnrollment = async () => {
    setSecurityAction("enroll");
    try {
      setEnrollment(await accountSecurityService.startTotpEnrollment());
      setVerificationCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start two-factor setup.");
    } finally {
      setSecurityAction(null);
    }
  };

  const verifyEnrollment = async () => {
    if (!enrollment || !/^\d{6}$/.test(verificationCode)) {
      toast.error("Enter the six-digit code from your authenticator app.");
      return;
    }
    setSecurityAction("verify");
    try {
      await accountSecurityService.verifyTotp(enrollment.factorId, verificationCode);
      setEnrollment(null);
      setVerificationCode("");
      await loadFactors();
      toast.success("Two-factor authentication is now enabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The verification code was not accepted.");
    } finally {
      setSecurityAction(null);
    }
  };

  const disableTwoFactor = async () => {
    if (!verifiedFactor || !/^\d{6}$/.test(disableCode)) {
      toast.error("Enter a current six-digit authenticator code.");
      return;
    }
    if (!window.confirm("Disable two-factor authentication for this account?")) return;
    setSecurityAction("disable");
    try {
      await accountSecurityService.disableTotp(verifiedFactor.id, disableCode);
      setDisableCode("");
      await loadFactors();
      toast.success("Two-factor authentication has been disabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disable two-factor authentication.");
    } finally {
      setSecurityAction(null);
    }
  };

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><LockKeyhole className="h-6 w-6" /></span><div><CardTitle>Password</CardTitle><CardDescription>Use a strong password you do not use elsewhere.</CardDescription></div></div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={changePassword}>
              <div className="space-y-2"><Label htmlFor="newPassword">New password</Label><Input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm new password</Label><Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
              <Button type="submit" disabled={securityAction === "password"} className="bg-[#129B36] hover:bg-[#0e7d2b]">{securityAction === "password" && <Loader2 className="animate-spin" />}Change password</Button>
            </form>
            <div className="mt-6 border-t pt-5">
              <p className="text-sm text-gray-600">Signed up with Google or cannot remember your current password?</p>
              <Button variant="link" className="mt-1 h-auto p-0 text-[#129B36]" disabled={securityAction === "reset"} onClick={() => void sendResetLink()}>Send a password setup link</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3"><span className="rounded-xl bg-green-50 p-3 text-[#129B36]"><ShieldCheck className="h-6 w-6" /></span><div><CardTitle>Two-factor authentication</CardTitle><CardDescription>Require a time-based code after signing in.</CardDescription></div></div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-4">
              <div><p className="font-semibold">Authenticator app</p><p className="text-sm text-gray-500">Google Authenticator and other TOTP apps are supported.</p></div>
              {loadingFactors ? <Loader2 className="h-5 w-5 animate-spin text-[#129B36]" /> : verifiedFactor ? <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" />Enabled</span> : <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">Not enabled</span>}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">Get Google Authenticator</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <a href="https://apps.apple.com/app/google-authenticator/id388497605" target="_blank" rel="noreferrer" aria-label="Download Google Authenticator on the App Store" className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-black px-5 py-2.5 text-white transition hover:bg-gray-800">
                  <Apple className="h-8 w-8 shrink-0 fill-white" />
                  <span className="text-left"><span className="block text-[9px] font-medium leading-none tracking-wide">Download on the</span><span className="mt-1 block text-lg font-semibold leading-none">App Store</span></span>
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noreferrer" aria-label="Get Google Authenticator on Google Play" className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-xl bg-black px-5 py-2.5 text-white transition hover:bg-gray-800">
                  <GooglePlayMark />
                  <span className="text-left"><span className="block text-[9px] font-medium leading-none tracking-wider">GET IT ON</span><span className="mt-1 block text-lg font-semibold leading-none">Google Play</span></span>
                </a>
              </div>
            </div>

            {!verifiedFactor && !enrollment && <Button onClick={() => void startEnrollment()} disabled={loadingFactors || securityAction === "enroll"} className="bg-[#129B36] hover:bg-[#0e7d2b]">{securityAction === "enroll" && <Loader2 className="animate-spin" />}Set up two-factor authentication</Button>}

            {enrollment && (
              <div className="space-y-5 rounded-2xl border border-green-200 bg-green-50/60 p-5">
                <div><h3 className="font-semibold">Scan this QR code</h3><p className="mt-1 text-sm text-gray-600">Open Google Authenticator, tap the plus button, then scan the code.</p></div>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <img src={enrollment.qrCode} alt="Two-factor authentication QR code" className="h-44 w-44 rounded-xl border bg-white p-2" />
                  <div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">Manual setup key</p><code className="mt-2 block break-all rounded-lg bg-white p-3 text-sm">{enrollment.secret}</code></div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row"><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))} /><Button onClick={() => void verifyEnrollment()} disabled={securityAction === "verify"} className="bg-[#129B36] hover:bg-[#0e7d2b]">{securityAction === "verify" && <Loader2 className="animate-spin" />}Verify and enable</Button></div>
              </div>
            )}

            {verifiedFactor && (
              <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-5">
                <div><h3 className="font-semibold">Disable two-factor authentication</h3><p className="mt-1 text-sm text-gray-600">Enter a current code from your authenticator app to confirm.</p></div>
                <div className="flex flex-col gap-3 sm:flex-row"><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" value={disableCode} onChange={(event) => setDisableCode(event.target.value.replace(/\D/g, ""))} /><Button variant="destructive" onClick={() => void disableTwoFactor()} disabled={securityAction === "disable"}>{securityAction === "disable" && <Loader2 className="animate-spin" />}Disable 2FA</Button></div>
              </div>
            )}

            <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-900"><KeyRound className="mt-0.5 h-5 w-5 shrink-0" /><p>Keep access to your authenticator app. You will need its current six-digit code whenever you sign in again.</p></div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default DashboardSecuritySettings;
