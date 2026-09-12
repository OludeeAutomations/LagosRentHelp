import { toast } from "sonner";
import type { LandlordProfile } from "@/services/landlordService";

type VerificationStatus = LandlordProfile["verificationStatus"] | null | undefined;

export const notifyListingVerificationRequired = (status: VerificationStatus) => {
  if (status === "rejected") {
    toast.error(
      "Your landlord verification was not approved. Update your profile and resubmit it before creating a listing.",
      { id: "listing-verification-required" },
    );
    return;
  }

  if (status === "pending") {
    toast.warning(
      "Your landlord account has not been verified by a super administrator yet. You cannot create a listing.",
      { id: "listing-verification-required" },
    );
    return;
  }

  toast.warning(
    "Complete your landlord verification and wait for super-admin approval before creating a listing.",
    { id: "listing-verification-required" },
  );
};
