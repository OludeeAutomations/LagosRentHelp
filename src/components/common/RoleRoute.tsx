import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
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
