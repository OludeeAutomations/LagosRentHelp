import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { accountSecurityService } from "@/services/accountSecurityService";
import { useAuthStore } from "@/stores/authStore";

export const AuthenticatedRoute = () => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <Loader2 className="mx-auto my-24 h-8 w-8 animate-spin text-[#129B36]" />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

export const LandlordRoute = () => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <Loader2 className="mx-auto my-24 h-8 w-8 animate-spin text-[#129B36]" />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!["landlord", "admin", "super_admin"].includes(user.role)) {
    return <Navigate to="/landlord/onboarding" replace />;
  }
  return <Outlet />;
};

export const MfaProtectedRoute = () => {
  const { user, loading } = useAuthStore();
  const userId = user?._id;
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [challengeRequired, setChallengeRequired] = useState(false);

  useEffect(() => {
    let active = true;

    const checkMfa = async () => {
      if (!userId) {
        if (active) setChecking(false);
        return;
      }

      setChecking(true);
      try {
        const required = await accountSecurityService.requiresMfaChallenge();
        if (active) setChallengeRequired(required);
      } catch {
        // Fail closed: a temporary MFA check error must not bypass dashboard security.
        if (active) setChallengeRequired(true);
      } finally {
        if (active) setChecking(false);
      }
    };

    void checkMfa();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (challengeRequired) {
      localStorage.setItem("mfa_return_to", `${location.pathname}${location.search}`);
    }
  }, [challengeRequired, location.pathname, location.search]);

  if (loading || checking) {
    return <Loader2 className="mx-auto my-24 h-8 w-8 animate-spin text-[#129B36]" />;
  }
  if (challengeRequired) return <Navigate to="/mfa-challenge" replace />;
  return <Outlet />;
};

const RoleGate = ({ roles }: { roles: Array<"admin" | "super_admin"> }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <Loader2 className="mx-auto my-24 h-8 w-8 animate-spin text-[#129B36]" />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(user.role as "admin" | "super_admin")) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export const AdminRoute = () => <RoleGate roles={["admin", "super_admin"]} />;
export const SuperAdminRoute = () => <RoleGate roles={["super_admin"]} />;
