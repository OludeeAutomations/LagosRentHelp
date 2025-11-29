// src/utils/agentUtils.ts

export interface AgentSubscription {
  status: string;
  trialStartsAt?: string | Date;
  trialEndsAt?: string | Date;
  currentPeriodEnd?: string | Date;
  plan?: string;
}

export interface FrontendAgent {
  verificationStatus: string;
  verifiedAt?: string | Date;
  freeListingWeeks?: number;
  subscription?: AgentSubscription;
  verificationData?: {
    verifiedAt?: string | Date;
    status?: string;
    submittedAt?: string | Date;
  };
}

/**
 * Determines whether an agent can list properties
 */
// src/utils/agentUtils.ts

export const canAgentListProperties = (agent: Agent | null): boolean => {
  if (!agent) return false;

  // 1. Must be verified
  if (agent.verificationStatus !== "verified") {
    return false;
  }

  const now = new Date();

  // 2. Check Trial Expiry (Handles the 6 months + 1 week referral extension)
  if (agent.subscription?.trialEndsAt) {
    const expiryDate = new Date(agent.subscription.trialEndsAt);
    if (now <= expiryDate) {
      return true;
    }
  }

  // 3. Check Active Paid Subscription
  if (
    agent.subscription?.status === "active" &&
    agent.subscription?.currentPeriodEnd
  ) {
    const periodEnd = new Date(agent.subscription.currentPeriodEnd);
    if (now <= periodEnd) {
      return true;
    }
  }

  // 4. Fallback for manual credits (optional)
  if (agent.freeListingWeeks && agent.freeListingWeeks > 0) {
    return true;
  }

  return false;
};

/**
 * Returns a human-readable subscription status
 */
export const getAgentSubscriptionStatus = (
  agent: FrontendAgent | null | undefined
): string => {
  if (!agent) return "Loading...";

  if (agent.verificationStatus !== "verified") {
    return "Not Verified";
  }

  if (agent.freeListingWeeks && agent.freeListingWeeks > 0) {
    return `Free Weeks: ${agent.freeListingWeeks}`;
  }

  if (
    agent.subscription?.status === "trial" &&
    agent.subscription.trialEndsAt
  ) {
    const daysLeft = Math.ceil(
      (new Date(agent.subscription.trialEndsAt).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    return `Trial: ${daysLeft} days left`;
  }

  if (agent.subscription?.status === "active") {
    return "Active Subscription";
  }

  // ✅ Grace period display - FIX: Check both locations
  const verifiedAt =
    agent.verifiedAt || (agent as any).verificationData?.verifiedAt;
  if (verifiedAt) {
    const verifiedDate = new Date(verifiedAt);
    const daysSinceVerification = Math.floor(
      (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceVerification < 7) {
      const daysLeft = 7 - daysSinceVerification;
      return `Grace Period: ${daysLeft} days left`;
    }
  }

  return "Subscription Required";
};
