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
export const canAgentListProperties = (
  agent: FrontendAgent | null | undefined
): boolean => {
  if (!agent || agent.verificationStatus !== "verified") {
    return false;
  }

  const now = new Date();

  // ✅ 1. Free listing weeks from referrals
  if (agent.freeListingWeeks && agent.freeListingWeeks > 0) {
    return true;
  }

  // ✅ 2. Active trial period
  if (
    agent.subscription?.status === "trial" &&
    agent.subscription.trialStartsAt &&
    agent.subscription.trialEndsAt
  ) {
    const trialStarts = new Date(agent.subscription.trialStartsAt);
    const trialEnds = new Date(agent.subscription.trialEndsAt);
    return now >= trialStarts && now <= trialEnds;
  }

  // ✅ 3. Active paid subscription
  if (
    agent.subscription?.status === "active" &&
    agent.subscription.currentPeriodEnd
  ) {
    const periodEnd = new Date(agent.subscription.currentPeriodEnd);
    return now <= periodEnd;
  }

  // ✅ 4. Grace period: 7 days after verification
  // FIX: Check both possible locations for verifiedAt
  const verifiedAt =
    agent.verifiedAt || (agent as any).verificationData?.verifiedAt;
  if (verifiedAt) {
    const verifiedDate = new Date(verifiedAt);
    const sevenDaysLater = new Date(
      verifiedDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    // Allow listing if within 7 days of verification
    if (now <= sevenDaysLater) {
      return true;
    }
  }

  // ❌ Otherwise, not allowed
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
