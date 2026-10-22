import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const AreaReviewsLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signIn } = useAreaReviewsAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  return (
    <div className="relative isolate overflow-hidden bg-[#f7f6f1] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div aria-hidden="true" className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-green-100/70 blur-3xl" />
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-slate-900/[0.08] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative overflow-hidden bg-[#103f2b] p-8 text-white sm:p-10">
          <div aria-hidden="true" className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full border-[42px] border-white/[0.05]" />
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck className="h-6 w-6 text-[#f4ce70]" /></span>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-4 leading-7 text-green-50/70">Sign in to share honest housing experiences and help Lagos residents make better rental decisions.</p>
          <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm leading-6 text-green-50/75">Use the same email and password as your LagosRentHelp account. Your Area Reviews login remains separate.</div>
        </aside>

        <div className="p-7 sm:p-10 lg:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#129B36]">Area Reviews account</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="area-email">Email address</Label>
              <div className="relative mt-2"><Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><Input id="area-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl pl-11" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between"><Label htmlFor="area-password">Password</Label><Link to="/forgot-password" className="text-xs font-bold text-[#0e7d2b] hover:underline">Forgot password?</Link></div>
              <div className="relative mt-2"><LockKeyhole className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" /><Input id="area-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="h-12 rounded-xl px-11" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 rounded-lg p-1 text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            </div>
            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-[#129B36] font-bold hover:bg-[#0e7d2b]">{submitting ? "Signing in..." : <>Sign in <ArrowRight className="h-4 w-4" /></>}</Button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">Don&apos;t have an account? <Link to="/area-reviews/register" className="font-bold text-[#0e7d2b] hover:underline">Create one</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AreaReviewsLoginPage;
