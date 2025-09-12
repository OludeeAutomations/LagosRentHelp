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
  freeListingWeeks?: number;
  subscription?: AgentSubscription;
}

export const canAgentListProperties = (
  agent: FrontendAgent | null | undefined
): boolean => {
  if (!agent || agent.verificationStatus !== "verified") {
    return false;
  }

  const now = new Date();

  // If they have free weeks from referrals
  if (agent.freeListingWeeks && agent.freeListingWeeks > 0) {
    return true;
  }

  // If trial period is active
  if (
    agent.subscription?.status === "trial" &&
    agent.subscription.trialStartsAt &&
    agent.subscription.trialEndsAt
  ) {
    const trialStarts = new Date(agent.subscription.trialStartsAt);
    const trialEnds = new Date(agent.subscription.trialEndsAt);

    return now >= trialStarts && now <= trialEnds;
  }

  // If paid subscription is active
  if (
    agent.subscription?.status === "active" &&
    agent.subscription.currentPeriodEnd
  ) {
    const periodEnd = new Date(agent.subscription.currentPeriodEnd);
    return now <= periodEnd;
  }

  return false;
};

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

  return "Subscription Required";
};
