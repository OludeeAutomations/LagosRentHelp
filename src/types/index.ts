/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/index.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    google: typeof google;
  }
}
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginResponse {
  user: User;
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ... rest of your existing types remain the same
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "user" | "agent" | "admin";
  favorites: string[];
  searchHistory: SearchFilters[];
  createdAt: string;
  // Backend fields
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type:
    | "1-bedroom"
    | "2-bedroom"
    | "3-bedroom"
    | "duplex"
    | "studio"
    | "mini-flat"
    | "short-let";
  listingType: "rent" | "short-let";

  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
  agentId: Agent;
  isFeatured: boolean;
  createdAt: string;

  status: "available" | "rented" | "pending";
  // Backend fields
  views?: number;
  likes?: number;
  isActive?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  availableFrom?: string;
  minimumStay?: number;
}

export interface Agent {
  data: Agent | PromiseLike<Agent>;
  freeListingWeeks: number;
  subscription: any;
  canListProperties: any;
  id: string;
  name: string;
  phone: string;
  userId: string; // Reference to User
  bio?: string;
  verificationIssue?: string;
  verificationStatus: "pending" | "verified" | "rejected";
  idPhoto?: string;
  residentialAddress: string;
  whatsappNumber: string;
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
  subscriptionPlan?: "basic" | "premium";
  subscriptionExpiry?: string;
  registeredAt: string;
  status: "trial" | "active" | "trial_expired";
  trialExpiresAt: string;
  verificationCode?: string;
  verificationCodeTimestamp?: string;
  // Backend fields
  rating?: number;
  totalReviews?: number;
  responseRate?: number;
  responseTime?: number;
  createdAt: string;
}
// src/types/verification.ts
export interface VerificationData {
  idType: "nin" | "bvn" | "voters" | "drivers_license";
  idNumber: string;
  selfieImage: File;
  dateOfBirth?: string;
}

export interface VerificationHistory {
  id: string;
  idType: string;
  status: string;
  submittedAt: string;
  verifiedAt?: string;
  reason?: string;
}
export interface VerificationStatus {
  status: "pending" | "verified" | "rejected";
  verificationIssue?: string;
  idType?: string;
  createdAt?: string;
  verifiedAt?: string;
}
export interface Lead {
  id: string;
  agentId: string;
  propertyId?: string;
  type:
    | "listing_view"
    | "contact_click"
    | "referral_click"
    | "whatsapp_contact";
  timestamp: string;
  clientId: string;
  source?: string;
  message?: string;
  // Backend fields
  status?: "new" | "contacted" | "viewing" | "closed";
  priority?: "low" | "medium" | "high";
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "referral_earned"
    | "listing_approved"
    | "trial_expiring"
    | "system_update"
    | "new_message"
    | "property_match"
    | "lead_received";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  // Backend fields
  priority?: "low" | "medium" | "high";
  actionRequired?: boolean;
}

export interface SearchFilters {
  location: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number;
  amenities: string[];
  sortBy: "price_asc" | "price_desc" | "newest" | "oldest" | "most_viewed";
  // Backend fields
  page?: number;
  limit?: number;
  radius?: number;
  availableFrom?: string;
  petFriendly?: boolean;
  furnished?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  propertyId?: string;
  // Backend fields
  type?: "text" | "image" | "file";
  metadata?: any;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  // Backend fields
  propertyId?: string;
  isArchived?: boolean;
  labels?: string[];
}

export interface Review {
  id: string;
  propertyId: string;
  userId: string;
  agentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified: boolean;
  // Backend fields
  response?: string;
  responseDate?: string;
  helpful?: number;
  reportCount?: number;
}

export interface SubscriptionPlan {
  id: "basic" | "premium";
  name: string;
  price: number;
  listings: number;
  duration: string;
  features: string[];
  // Backend fields
  isActive?: boolean;
  trialDays?: number;
  maxImages?: number;
  featuredListings?: number;
  supportLevel?: "basic" | "priority";
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginResponse {
  user: User;
  agentData: Agent;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
export interface AgentStats {
  data: AgentStats | PromiseLike<AgentStats>;
  totalListings: number;
  totalViews: number;
  activeListings: number;
  rentedListings: number;
  totalLeads: number;
  conversionRate: number;
  averageResponseTime: number;
}

export interface AgentProfileResponse {
  success: any;
  data: {
    agent: Agent; // This must match the Agent type
    user?: User;
    properties?: any[];
    stats?: any;
  }; // list of properties managed by the agent
}
