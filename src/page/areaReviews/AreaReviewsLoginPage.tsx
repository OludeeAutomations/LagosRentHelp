import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, MapPinned } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import GoogleLogo from "@/components/common/GoogleLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const AreaReviewsLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn, signInWithGoogle } = useAreaReviewsAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const requestedPath = (location.state as { from?: unknown } | null)?.from;
  const destination = typeof requestedPath === "string"
    && requestedPath.startsWith("/area-reviews")
    && !requestedPath.startsWith("/area-reviews/login")
    && !requestedPath.startsWith("/area-reviews/register")
    && !requestedPath.startsWith("/area-reviews/auth/")
    ? requestedPath
    : "/area-reviews";

  useEffect(() => {
    if (!loading && user) navigate(destination, { replace: true });
  }, [destination, loading, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success("Welcome to Area Reviews.");
      navigate(destination, { replace: true });
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(destination);
    } catch (reason: unknown) {
      toast.error(reason instanceof Error ? reason.message : "Unable to connect to Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your Area Reviews account"
      shellClassName="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      brandName="LagosRentHelp"
      brandHref="/area-reviews"
      sideTitle="Know Before You Rent"
      sideSubtitle="Resident-powered insight on Lagos neighbourhoods, estates and buildings"
      sideIcon={MapPinned}
      sideStats={[
        { number: "Private", label: "Account details" },
        { number: "Human", label: "Moderation" },
        { number: "Useful", label: "Local insight" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="area-email" className="text-black">Email Address *</Label>
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-grey" />
            <Input id="area-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="your@email.com" disabled={submitting || googleLoading} className="pl-10 border-grey/30 focus:border-primary-green focus:ring-primary-green" />
          </div>
        </div>
        <div>
          <Label htmlFor="area-password" className="text-black">Password *</Label>
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-grey" />
            <Input id="area-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" disabled={submitting || googleLoading} className="pl-10 pr-10 border-grey/30 focus:border-primary-green focus:ring-primary-green" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-full items-center px-3 text-grey hover:text-black" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-primary-green hover:text-dark-green">Forgot Password?</Link></div>
        <Button type="submit" disabled={submitting || googleLoading} className="w-full bg-[#129B36] text-white hover:bg-[#41614F]">{submitting ? "Signing in..." : "Sign In"}</Button>
        <div className="flex items-center"><div className="flex-grow border-t border-gray-300" /><span className="mx-3 text-sm text-gray-500">OR</span><div className="flex-grow border-t border-gray-300" /></div>
        <Button type="button" variant="outline" disabled={submitting || googleLoading} onClick={handleGoogleSignIn} className="w-full gap-3 border-gray-300 bg-white text-black hover:bg-gray-50"><GoogleLogo />{googleLoading ? "Connecting to Google..." : "Continue with Google"}</Button>
        <p className="text-center text-grey">Don&apos;t have an account? <Link to="/area-reviews/register" className="font-medium text-[#129B36] hover:text-[#41614F]">Create an account</Link></p>
        <p className="rounded-lg bg-green-50 px-4 py-3 text-center text-xs leading-5 text-slate-600">You can use the same login details as your LagosRentHelp account.</p>
      </form>
    </AuthLayout>
  );
};

export default AreaReviewsLoginPage;
