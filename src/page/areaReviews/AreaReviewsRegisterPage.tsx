import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const AreaReviewsRegisterPage = () => {
  const navigate = useNavigate();
  const signUp = useAreaReviewsAuthStore((state) => state.signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().split(/\s+/).length < 2) return toast.error("Enter your first and last name.");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return toast.error("Use at least 8 characters, one uppercase letter and one number.");
    if (password !== confirmPassword) return toast.error("The passwords do not match.");
    setSubmitting(true);
    try {
      const result = await signUp({ name, email, phone, password });
      if (result.requiresVerification) setVerificationEmail(email.trim());
      else {
        toast.success("Your Area Reviews account is ready.");
        navigate("/area-reviews", { replace: true });
      }
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (verificationEmail) return (
    <div className="bg-[#f7f6f1] px-4 py-20">
      <div className="mx-auto max-w-lg rounded-[2rem] border border-white bg-white p-8 text-center shadow-xl shadow-slate-900/[0.06] sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50"><CheckCircle2 className="h-8 w-8 text-[#129B36]" /></span>
        <h1 className="mt-6 text-3xl font-bold">Check your email</h1>
        <p className="mt-4 leading-7 text-slate-600">We sent a verification link to <strong>{verificationEmail}</strong>. Open it to finish creating your Area Reviews account.</p>
        <Link to="/area-reviews/login" className="mt-7 inline-flex rounded-xl bg-[#129B36] px-6 py-3 font-bold text-white">Return to sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="relative isolate overflow-hidden bg-[#f7f6f1] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div aria-hidden="true" className="absolute -right-40 top-10 -z-10 h-96 w-96 rounded-full bg-green-100/70 blur-3xl" />
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white bg-white p-7 shadow-2xl shadow-slate-900/[0.08] sm:p-10 lg:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#129B36]">Join Area Reviews</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Create your resident account</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Already registered on LagosRentHelp? <Link to="/area-reviews/login" className="font-bold text-[#0e7d2b] hover:underline">Sign in with the same details</Link>—do not create another account.</p>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="area-name">Full name</Label><div className="relative mt-2"><UserRound className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><Input id="area-name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" placeholder="First and last name" className="h-12 rounded-xl pl-11" /></div></div>
          <div className="sm:col-span-2"><Label htmlFor="register-area-email">Email address</Label><div className="relative mt-2"><Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><Input id="register-area-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl pl-11" /></div></div>
          <div className="sm:col-span-2"><Label htmlFor="area-phone">Phone number</Label><div className="relative mt-2"><Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><Input id="area-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" placeholder="+234 800 000 0000" className="h-12 rounded-xl pl-11" /></div></div>
          <div><Label htmlFor="register-area-password">Password</Label><div className="relative mt-2"><LockKeyhole className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><Input id="register-area-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" className="h-12 rounded-xl px-11" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 rounded-lg p-1 text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
          <div><Label htmlFor="area-confirm-password">Confirm password</Label><Input id="area-confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" className="mt-2 h-12 rounded-xl" /></div>
          <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Use at least 8 characters with one uppercase letter and one number.</p>
          <Button type="submit" disabled={submitting} className="h-12 rounded-xl bg-[#129B36] font-bold hover:bg-[#0e7d2b] sm:col-span-2">{submitting ? "Creating account..." : <>Create account <ArrowRight className="h-4 w-4" /></>}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/area-reviews/login" className="font-bold text-[#0e7d2b] hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
};

export default AreaReviewsRegisterPage;
