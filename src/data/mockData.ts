import { Property, Agent, ClientViewCount } from '../types';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Self-Contain Apartment in Lekki',
    propertyType: 'Self-Contain',
    location: 'Lekki Phase 1, Lagos',
    price: 350000,
    description: 'Beautiful self-contain apartment with modern facilities, 24/7 electricity, and secure environment.',
    photos: [
      'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    agentId: 'agent1',
    createdAt: '2024-01-15',
    featured: true
  },
  {
    id: '2',
    title: 'Affordable Single Room in Surulere',
    propertyType: 'Single Room',
    location: 'Surulere, Lagos',
    price: 120000,
    description: 'Clean single room with shared facilities, close to bus stops and markets.',
    photos: [
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    agentId: 'agent2',
    createdAt: '2024-01-14',
    featured: true
  },
  {
    id: '3',
    title: 'Spacious Mini Flat in Ikeja',
    propertyType: 'Mini Flat',
    location: 'Ikeja, Lagos',
    price: 450000,
    description: 'Well-ventilated mini flat with kitchen, sitting room, and bedroom. Very close to Ikeja Along.',
    photos: [
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    agentId: 'agent1',
    createdAt: '2024-01-13',
    featured: true
  }
];

export const mockAgents: Agent[] = [
  {
    id: 'agent1',
    name: 'Adebayo Johnson',
    whatsappNumber: '+2348123456789',
    email: 'adebayo@email.com',
    password: 'password123',
    isEmailVerified: true,
    listings: ['1', '3'],
    freeListingsUsed: 2,
    referralCode: 'ADEBAYOADEB1234',
    referralCount: 0,
    freeListingsFromReferrals: 0,
    totalLeads: 0,
    totalReferralClicks: 0,
    registeredAt: '2024-01-01',
    status: 'trial',
    trialExpiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString() // 25 days from now
  },
  {
    id: 'agent2',
    name: 'Kemi Okafor',
    whatsappNumber: '+2348987654321',
    email: 'kemi@email.com',
    password: 'password123',
    isEmailVerified: true,
    listings: ['2'],
    freeListingsUsed: 1,
    referralCode: 'KEMIOKAFOR5678',
    referralCount: 0,
    freeListingsFromReferrals: 0,
    totalLeads: 0,
    totalReferralClicks: 0,
    registeredAt: '2024-01-05',
    status: 'trial',
    trialExpiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days from now
  }
];