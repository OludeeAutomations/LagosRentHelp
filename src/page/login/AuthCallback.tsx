import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "@/components/common/AuthLayout";
import { supabase } from "@/lib/supabase";
import { mapSupabaseSession } from "@/services/authService";
import { accountSecurityService } from "@/services/accountSecurityService";
import { useAuthStore } from "@/stores/authStore";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuthStore();
  const [message, setMessage] = useState("Completing your sign in...");

  useEffect(() => {
    let active = true;

    const completeSignIn = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!session) throw new Error("No login session was returned.");
        if (!active) return;

        const auth = await mapSupabaseSession(session);
        const pendingAccountType = localStorage.getItem("pending_account_type");
        const needsRenterPreferences = localStorage.getItem("needs_renter_preferences") === "true";
        const storedReturnTo = localStorage.getItem("oauth_return_to");
        const returnTo = storedReturnTo?.startsWith("/") && !storedReturnTo.startsWith("//")
          ? storedReturnTo
          : null;
        localStorage.removeItem("pending_account_type");
        localStorage.removeItem("oauth_return_to");
        setUser(auth.user);
        setAccessToken(auth.accessToken);

        let destination: string;
        if (pendingAccountType === "landlord") {
          destination = "/landlord/onboarding";
        } else if (!auth.user.phone) {
          destination = "/complete-profile";
        } else if (returnTo && returnTo !== "/auth/callback") {
          destination = returnTo;
        } else if (auth.user.role === "admin" || auth.user.role === "super_admin") {
          destination = "/admin/verifications";
        } else if (needsRenterPreferences) {
          destination = "/renter/preferences";
        } else {
          destination = auth.user.role === "landlord" ? "/landlord" : "/";
        }

        if (await accountSecurityService.requiresMfaChallenge()) {
          localStorage.setItem("mfa_return_to", destination);
          navigate("/mfa-challenge", { replace: true });
        } else {
          toast.success("Welcome back!");
          navigate(destination, { replace: true });
        }
      } catch (error: unknown) {
        if (!active) return;
        const errorMessage =
          error instanceof Error ? error.message : "Unable to complete login.";
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    void completeSignIn();
    return () => {
      active = false;
    };
  }, [navigate, setAccessToken, setUser]);

  return (
    <AuthLayout title="Signing you in" subtitle={message}>
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#129B36]" />
      </div>
    </AuthLayout>
  );
};

export default AuthCallback;
