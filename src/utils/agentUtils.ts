// src/utils/agentUtils.ts
export const canAgentListProperties = (agent: any): boolean => {
  if (!agent || agent.verificationStatus !== "verified") {
    return false;
  }

  const now = new Date();

  // If they have free weeks from referrals
  if (agent.freeListingWeeks > 0) {
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
