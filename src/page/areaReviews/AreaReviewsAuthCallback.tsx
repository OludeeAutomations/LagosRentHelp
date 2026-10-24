import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { areaReviewsSupabase } from "@/lib/areaReviewsSupabase";
import { useAreaReviewsAuthStore } from "@/stores/areaReviewsAuthStore";

const AreaReviewsAuthCallback = () => {
  const navigate = useNavigate();
  const setSession = useAreaReviewsAuthStore((state) => state.setSession);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const finishVerification = async () => {
      try {
        const existing = await areaReviewsSupabase.auth.getSession();
        let session = existing.data.session;
        if (!session) {
          const code = new URLSearchParams(window.location.search).get("code");
          if (!code) throw new Error("This verification link is invalid or has expired.");
          const result = await areaReviewsSupabase.auth.exchangeCodeForSession(code);
          if (result.error) throw result.error;
          session = result.data.session;
        }
        if (!session) throw new Error("No login session was returned.");
        if (!active) return;
        setSession(session);
        const storedReturnTo = localStorage.getItem("area_reviews_oauth_return_to");
        localStorage.removeItem("area_reviews_oauth_return_to");
        const destination = storedReturnTo?.startsWith("/area-reviews")
          && !storedReturnTo.startsWith("/area-reviews/login")
          && !storedReturnTo.startsWith("/area-reviews/register")
          && !storedReturnTo.startsWith("/area-reviews/auth/")
          ? storedReturnTo
          : "/area-reviews";
        navigate(destination, { replace: true });
      } catch (reason: unknown) {
        localStorage.removeItem("area_reviews_oauth_return_to");
        if (active) setErrorMessage(reason instanceof Error ? reason.message : "Unable to verify your account.");
      }
    };
    void finishVerification();
    return () => { active = false; };
  }, [navigate, setSession]);

  return (
    <div className="bg-[#fafafa] px-4 py-24">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-slate-900/[0.06]">
        {errorMessage ? <><h1 className="text-2xl font-bold">We could not complete verification</h1><p className="mt-4 text-slate-600">{errorMessage}</p><Link to="/area-reviews/login" className="mt-7 inline-flex rounded-xl bg-[#129B36] px-6 py-3 font-bold text-white">Go to sign in</Link></> : <><Loader2 className="mx-auto h-9 w-9 animate-spin text-[#129B36]" /><h1 className="mt-6 text-2xl font-bold">Completing your account...</h1><p className="mt-3 text-slate-600">You will be redirected to Area Reviews shortly.</p></>}
      </div>
    </div>
  );
};

export default AreaReviewsAuthCallback;
