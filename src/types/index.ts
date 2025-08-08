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
  listings: string[];
  freeListingsUsed: number;
  subscriptionPlan?: 'basic' | 'premium';
  subscriptionExpiry?: string;
  registeredAt: string;
}

export interface SubscriptionPlan {
  id: 'basic' | 'premium';
  name: string;
  price: number;
  listings: number;
  duration: string;
}