import { supabase } from "@/lib/supabase";
import type { VerificationStatus } from "@/services/adminVerificationService";

export interface AdminLandlordSummary {
  userId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  whatsappNumber: string;
  residentialAddress: string;
  state: string;
  localGovernment: string;
  bio: string;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  joinedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  listingCount: number;
  availableListings: number;
  rentedListings: number;
  totalViews: number;
  totalLikes: number;
  latestListingAt: string | null;
}

type AdminLandlordRow = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  whatsapp_number: string;
  residential_address: string;
  state: string;
  local_government: string;
  bio: string;
  verification_status: VerificationStatus;
  verification_note: string | null;
  joined_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  listing_count: number | string;
  available_listings: number | string;
  rented_listings: number | string;
  total_views: number | string;
  total_likes: number | string;
  latest_listing_at: string | null;
};

const mapLandlord = (row: AdminLandlordRow): AdminLandlordSummary => ({
  userId: row.user_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  businessName: row.business_name,
  whatsappNumber: row.whatsapp_number,
  residentialAddress: row.residential_address,
  state: row.state,
  localGovernment: row.local_government,
  bio: row.bio,
  verificationStatus: row.verification_status,
  verificationNote: row.verification_note,
  joinedAt: row.joined_at,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  listingCount: Number(row.listing_count || 0),
  availableListings: Number(row.available_listings || 0),
  rentedListings: Number(row.rented_listings || 0),
  totalViews: Number(row.total_views || 0),
  totalLikes: Number(row.total_likes || 0),
  latestListingAt: row.latest_listing_at,
});

export const adminDashboardService = {
  getLandlords: async (): Promise<AdminLandlordSummary[]> => {
    const { data, error } = await supabase.rpc("get_super_admin_landlords");
    if (error) throw new Error(error.message);
    return ((data || []) as AdminLandlordRow[]).map(mapLandlord);
  },
};
