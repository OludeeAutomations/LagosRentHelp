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
  avatarUrl: string | null;
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
  avatarUrl: null,
});

type VerifiedIdentityRow = {
  user_id: string;
  identity_image_path: string;
};

export const adminDashboardService = {
  getLandlords: async (): Promise<AdminLandlordSummary[]> => {
    const [{ data, error }, { data: verificationData }] = await Promise.all([
      supabase.rpc("get_super_admin_landlords"),
      supabase.rpc("get_landlord_verification_queue", { p_status: "verified" }),
    ]);
    if (error) throw new Error(error.message);

    const landlords = ((data || []) as AdminLandlordRow[]).map(mapLandlord);
    const verificationRows = (verificationData || []) as VerifiedIdentityRow[];
    const imageUrls = new Map<string, string>();

    await Promise.all(
      verificationRows.map(async (verification) => {
        if (!verification.identity_image_path) return;
        const { data: signedImage } = await supabase.storage
          .from("landlord-verification")
          .createSignedUrl(verification.identity_image_path, 3600);
        if (signedImage?.signedUrl) {
          imageUrls.set(verification.user_id, signedImage.signedUrl);
        }
      }),
    );

    return landlords.map((landlord) => ({
      ...landlord,
      avatarUrl:
        landlord.verificationStatus === "verified"
          ? imageUrls.get(landlord.userId) || null
          : null,
    }));
  },
};
