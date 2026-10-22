import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, MapPinned, Phone, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import GoogleLogo from "@/components/common/GoogleLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const AreaReviewsRegisterPage = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAreaReviewsAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().split(/\s+/).length < 2) return toast.error("Enter your first and last name.");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) return toast.error("Use at least 8 characters with uppercase, lowercase and a number.");
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

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle("/area-reviews");
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to connect to Google.");
      setGoogleLoading(false);
    }
  };

  if (verificationEmail) return (
    <AuthLayout title="Check Your Email" subtitle="One last step to activate your Area Reviews account" brandName="LagosRentHelp" brandHref="/area-reviews" sideTitle="Your Experience Can Help Someone" sideSubtitle="Share what daily life and renting are really like" sideIcon={MapPinned}>
      <div className="py-4 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50"><CheckCircle2 className="h-8 w-8 text-[#129B36]" /></span>
        <p className="mt-5 leading-7 text-slate-600">We sent a verification link to <strong>{verificationEmail}</strong>. Open it to finish creating your account.</p>
        <Button asChild className="mt-7 bg-[#129B36] text-white hover:bg-[#41614F]"><Link to="/area-reviews/login">Return to Sign In</Link></Button>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Lagos residents sharing insights and checking areas"
      contentClassName="max-w-xl"
      brandName="LagosRentHelp"
      brandHref="/area-reviews"
      sideTitle="Your Experience Can Help Someone"
      sideSubtitle="Share what power, water, roads, costs and daily life are really like"
      sideIcon={MapPinned}
      sideStats={[
        { number: "Private", label: "Account details" },
        { number: "Optional", label: "Public first name" },
        { number: "Human", label: "Moderation" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><Label htmlFor="area-name" className="text-black">Full Name *</Label><div className="relative mt-2"><UserRound className="absolute left-3 top-3 h-5 w-5 text-grey" /><Input id="area-name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" placeholder="Enter your full name" disabled={submitting || googleLoading} className="pl-10 border-grey/30" /></div></div>
        <div><Label htmlFor="register-area-email" className="text-black">Email Address *</Label><div className="relative mt-2"><Mail className="absolute left-3 top-3 h-5 w-5 text-grey" /><Input id="register-area-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="your@email.com" disabled={submitting || googleLoading} className="pl-10 border-grey/30" /></div></div>
        <div><Label htmlFor="area-phone" className="text-black">Phone Number *</Label><div className="relative mt-2"><Phone className="absolute left-3 top-3 h-5 w-5 text-grey" /><Input id="area-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required autoComplete="tel" placeholder="+234 800 000 0000" disabled={submitting || googleLoading} className="pl-10 border-grey/30" /></div></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><Label htmlFor="register-area-password" className="text-black">Password *</Label><div className="relative mt-2"><Lock className="absolute left-3 top-3 h-5 w-5 text-grey" /><Input id="register-area-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" disabled={submitting || googleLoading} className="pl-10 pr-10 border-grey/30" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-full items-center px-3 text-grey" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
          <div><Label htmlFor="area-confirm-password" className="text-black">Confirm Password *</Label><div className="relative mt-2"><Lock className="absolute left-3 top-3 h-5 w-5 text-grey" /><Input id="area-confirm-password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" disabled={submitting || googleLoading} className="pl-10 pr-10 border-grey/30" /><button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-0 top-0 flex h-full items-center px-3 text-grey" aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        </div>
        <p className="text-xs leading-5 text-slate-500">Password must have at least 8 characters, uppercase, lowercase and a number.</p>
        <Button type="submit" disabled={submitting || googleLoading} className="w-full bg-[#129B36] text-white hover:bg-[#41614F]">{submitting ? "Creating account..." : "Create Account"}</Button>
        <div className="flex items-center"><div className="flex-grow border-t border-gray-300" /><span className="mx-3 text-sm text-gray-500">OR</span><div className="flex-grow border-t border-gray-300" /></div>
        <Button type="button" variant="outline" disabled={submitting || googleLoading} onClick={handleGoogleSignUp} className="w-full gap-3 border-gray-300 bg-white text-black hover:bg-gray-50"><GoogleLogo />{googleLoading ? "Connecting to Google..." : "Continue with Google"}</Button>
        <p className="text-center text-grey">Already have an account? <Link to="/area-reviews/login" className="font-medium text-[#129B36] hover:text-[#41614F]">Sign In</Link></p>
        <p className="rounded-lg bg-green-50 px-4 py-3 text-center text-xs leading-5 text-slate-600">Already registered on LagosRentHelp? Sign in with those same details instead.</p>
      </form>
    </AuthLayout>
  );
};

export default AreaReviewsRegisterPage;
