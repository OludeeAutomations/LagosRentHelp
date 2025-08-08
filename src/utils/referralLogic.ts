import { Agent, Lead, Notification } from '../types';

// Generate unique referral code
export const generateReferralCode = (name: string, email: string): string => {
  const nameCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
  const emailCode = email.split('@')[0].substring(0, 4).toUpperCase();
  const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${nameCode}${emailCode}${randomCode}`;
};

// Process referral signup
export const processReferralSignup = (
  newAgent: Agent,
  referralCode: string,
  agents: Agent[]
): { updatedAgents: Agent[]; notifications: Notification[] } => {
  const referrer = agents.find(agent => agent.referralCode === referralCode);
  
  if (!referrer) {
    return { updatedAgents: agents, notifications: [] };
  }

  // Update referrer's stats
  const updatedReferrer = {
    ...referrer,
    referralCount: referrer.referralCount + 1,
    freeListingsFromReferrals: referrer.freeListingsFromReferrals + 1
  };

  // Update new agent with referrer info
  const updatedNewAgent = {
    ...newAgent,
    referredBy: referrer.id
  };

  // Create notification for referrer
  const notification: Notification = {
    id: 'notif_' + Date.now(),
    agentId: referrer.id,
    type: 'referral_earned',
    title: 'New Referral Earned! 🎉',
    message: `${newAgent.name} joined using your referral link. You've earned 1 free listing!`,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const updatedAgents = agents.map(agent => 
    agent.id === referrer.id ? updatedReferrer : agent
  );

  return {
    updatedAgents: [...updatedAgents, updatedNewAgent],
    notifications: [notification]
  };
};

// Track referral link click
export const trackReferralClick = (
  referralCode: string,
  clientId: string,
  agents: Agent[]
): Lead | null => {
  const referrer = agents.find(agent => agent.referralCode === referralCode);
  
  if (!referrer) return null;

  return {
    id: 'lead_' + Date.now(),
    agentId: referrer.id,
    type: 'referral_click',
    timestamp: new Date().toISOString(),
    clientId,
    source: 'referral_link'
  };
};

// Check if agent can upload listing
export const canUploadListing = (agent: Agent): { canUpload: boolean; reason?: string } => {
  // During trial period, unlimited uploads
  if (agent.status === 'trial') {
    const trialEnd = new Date(agent.trialExpiresAt);
    if (new Date() < trialEnd) {
      return { canUpload: true };
    }
  }

  // If has active subscription
  if (agent.subscriptionPlan && agent.subscriptionExpiry) {
    const subscriptionEnd = new Date(agent.subscriptionExpiry);
    if (new Date() < subscriptionEnd) {
      return { canUpload: true };
    }
  }

  // If has free listings from referrals
  if (agent.freeListingsFromReferrals > agent.freeListingsUsed) {
    return { canUpload: true };
  }

  return { 
    canUpload: false, 
    reason: 'Your trial has expired. Upgrade your account or earn free listings through referrals to continue.' 
  };
};

// Use free listing credit
export const useFreeListingCredit = (agent: Agent): Agent => {
  if (agent.freeListingsFromReferrals > agent.freeListingsUsed) {
    return {
      ...agent,
      freeListingsUsed: agent.freeListingsUsed + 1
    };
  }
  return agent;
};

// Calculate referral rewards
export const calculateReferralRewards = (referralCount: number): {
  freeListings: number;
  nextMilestone: number;
  progress: number;
} => {
  const freeListings = referralCount; // 1:1 ratio
  const nextMilestone = Math.ceil((referralCount + 1) / 5) * 5; // Next milestone of 5
  const progress = (referralCount % 5) / 5 * 100;

  return { freeListings, nextMilestone, progress };
};

// Generate referral URL
export const generateReferralUrl = (referralCode: string, baseUrl: string = window.location.origin): string => {
  return `${baseUrl}?ref=${referralCode}`;
};

// Extract referral code from URL
export const extractReferralCode = (url: string = window.location.href): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    return null;
  }
};

// Validate referral code format
export const isValidReferralCode = (code: string): boolean => {
  // Should be 12 characters, alphanumeric, uppercase
  return /^[A-Z0-9]{12}$/.test(code);
};

// Create welcome notification for new agent
export const createWelcomeNotification = (agent: Agent): Notification => {
  return {
    id: 'notif_welcome_' + Date.now(),
    agentId: agent.id,
    type: 'system_update',
    title: 'Welcome to LagosRentHelp! 🏠',
    message: `Your account is ready! You have ${30} days of free trial with unlimited listings. Start by adding your first property.`,
    isRead: false,
    createdAt: new Date().toISOString()
  };
};

// Create trial expiring notification
export const createTrialExpiringNotification = (agent: Agent, daysLeft: number): Notification => {
  return {
    id: 'notif_trial_' + Date.now(),
    agentId: agent.id,
    type: 'trial_expiring',
    title: `Trial Expiring in ${daysLeft} Days ⏰`,
    message: `Your free trial ends soon. Upgrade your account or earn free listings through referrals to continue.`,
    isRead: false,
    createdAt: new Date().toISOString()
  };
};