export interface Property {
  id: string;
  title: string;
  propertyType: 'Single Room' | 'Self-Contain' | 'Mini Flat' | 'One Bedroom' | 'Two Bedroom';
  location: string;
  price: number;
  description: string;
  photos: string[];
  agentId: string;
  createdAt: string;
  featured?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  whatsappNumber: string;
  email: string;
  password?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  listings: string[];
  freeListingsUsed: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  freeListingsFromReferrals: number;
  totalLeads: number;
  totalReferralClicks: number;
  subscriptionPlan?: 'basic' | 'premium';
  subscriptionExpiry?: string;
  registeredAt: string;
  status: 'trial' | 'active' | 'trial_expired';
  trialExpiresAt: string;
  verificationCode?: string;
  verificationCodeTimestamp?: string;
}

export interface Lead {
  id: string;
  agentId: string;
  propertyId?: string;
  type: 'listing_view' | 'contact_click' | 'referral_click';
  timestamp: string;
  clientId: string;
  source?: string;
}

export interface Notification {
  id: string;
  agentId: string;
  type: 'referral_earned' | 'listing_approved' | 'trial_expiring' | 'system_update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ClientViewCount {
  clientId: string;
  agentId: string;
  count: number;
  lastViewedAt: string;
}

export interface SubscriptionPlan {
  id: 'basic' | 'premium';
  name: string;
  price: number;
  listings: number;
  duration: string;
}