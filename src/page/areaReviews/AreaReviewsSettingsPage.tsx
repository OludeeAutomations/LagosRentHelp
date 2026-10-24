import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const PasswordInput = ({ id, label, value, onChange, visible, onToggle, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void; autoComplete: string }) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <div className="relative mt-2">
      <LockKeyhole className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
      <Input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} required autoComplete={autoComplete} className="h-12 rounded-xl px-11" />
      <button type="button" onClick={onToggle} className="absolute right-3 top-3 rounded-lg p-1 text-slate-500" aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
    </div>
  </div>
);

const AreaReviewsSettingsPage = () => {
  const navigate = useNavigate();
  const { user, loading, changePassword } = useAreaReviewsAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/area-reviews/login", { replace: true, state: { from: "/area-reviews/settings" } });
  }, [loading, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return toast.error("Use at least 8 characters with uppercase, lowercase and a number.");
    if (newPassword !== confirmPassword) return toast.error("The new passwords do not match.");
    if (currentPassword === newPassword) return toast.error("Choose a different password.");
    setSubmitting(true);
    setUpdated(false);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUpdated(true);
      toast.success("Your password has been updated.");
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to update your password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return <div className="min-h-[60vh] bg-[#fafafa]" />;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <aside className="h-fit rounded-3xl bg-[#103f2b] p-7 text-white sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck className="h-6 w-6 text-[#f4ce70]" /></span>
          <h1 className="mt-6 text-3xl font-bold">Account settings</h1>
          <p className="mt-3 leading-7 text-green-50/70">Manage the password used to protect your Area Reviews account.</p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-green-50/75"><strong className="text-white">Signed in as</strong><span className="mt-1 block break-all">{user.email}</span></div>
        </aside>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/[0.04] sm:p-9">
          <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50"><KeyRound className="h-5 w-5 text-[#129B36]" /></span><div><h2 className="text-2xl font-bold">Change password</h2><p className="mt-1 text-sm leading-6 text-slate-500">Enter your current password before choosing a new one.</p></div></div>
          {updated && <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-800"><CheckCircle2 className="h-5 w-5" />Password updated successfully.</div>}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <PasswordInput id="current-password" label="Current password" value={currentPassword} onChange={setCurrentPassword} visible={showCurrent} onToggle={() => setShowCurrent((value) => !value)} autoComplete="current-password" />
            <div className="grid gap-5 sm:grid-cols-2"><PasswordInput id="new-password" label="New password" value={newPassword} onChange={setNewPassword} visible={showNew} onToggle={() => setShowNew((value) => !value)} autoComplete="new-password" /><PasswordInput id="confirm-new-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} visible={showConfirm} onToggle={() => setShowConfirm((value) => !value)} autoComplete="new-password" /></div>
            <p className="text-xs leading-5 text-slate-500">Use at least 8 characters with uppercase, lowercase and a number.</p>
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Because your login is shared, this also changes the password for your main LagosRentHelp account.</div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center"><Button type="submit" disabled={submitting} className="h-11 rounded-xl bg-[#129B36] px-6 font-bold text-white hover:bg-[#0e7d2b]">{submitting ? "Updating password..." : "Update password"}</Button><Link to="/area-reviews" className="px-4 py-2 text-center text-sm font-semibold text-slate-500 hover:text-slate-900">Cancel</Link></div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AreaReviewsSettingsPage;
