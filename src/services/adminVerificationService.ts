import { supabase } from "@/lib/supabase";

export type VerificationStatus = "pending" | "verified" | "rejected";

export interface LandlordVerificationApplication {
  userId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  whatsappNumber: string;
  residentialAddress: string;
  state: string;
  localGovernment: string;
  verificationStatus: VerificationStatus;
  verificationNote: string | null;
  verifiedIdentityName: string | null;
  ninLastFour: string;
  propertyAddress: string;
  propertyLocalGovernment: string;
  ownershipDocumentType: string;
  identityImagePath: string;
  ownershipDocumentPath: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "super_admin";
  createdAt: string;
}

type VerificationRow = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  whatsapp_number: string;
  residential_address: string;
  state: string;
  local_government: string;
  verification_status: VerificationStatus;
  verification_note: string | null;
  verified_identity_name: string | null;
  nin_last_four: string;
  property_address: string;
  property_local_government: string;
  ownership_document_type: string;
  identity_image_path: string;
  ownership_document_path: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_name: string | null;
};

type AdminRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "super_admin";
  created_at: string;
};

const mapApplication = (row: VerificationRow): LandlordVerificationApplication => ({
  userId: row.user_id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  businessName: row.business_name,
  whatsappNumber: row.whatsapp_number,
  residentialAddress: row.residential_address,
  state: row.state,
  localGovernment: row.local_government,
  verificationStatus: row.verification_status,
  verificationNote: row.verification_note,
  verifiedIdentityName: row.verified_identity_name,
  ninLastFour: row.nin_last_four,
  propertyAddress: row.property_address,
  propertyLocalGovernment: row.property_local_government,
  ownershipDocumentType: row.ownership_document_type,
  identityImagePath: row.identity_image_path,
  ownershipDocumentPath: row.ownership_document_path,
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at,
  reviewerName: row.reviewer_name,
});

export const adminVerificationService = {
  getApplications: async (
    status?: VerificationStatus,
  ): Promise<LandlordVerificationApplication[]> => {
    const { data, error } = await supabase.rpc("get_landlord_verification_queue", {
      p_status: status || null,
    });
    if (error) throw new Error(error.message);
    return ((data || []) as VerificationRow[]).map(mapApplication);
  },

  createDocumentUrl: async (path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from("landlord-verification")
      .createSignedUrl(path, 300);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  },

  reviewApplication: async (
    userId: string,
    decision: "verified" | "rejected",
    note?: string,
  ): Promise<void> => {
    const { error } = await supabase.rpc("review_landlord_verification", {
      p_landlord_user_id: userId,
      p_decision: decision,
      p_note: note?.trim() || null,
    });
    if (error) throw new Error(error.message);
  },

  getAdmins: async (): Promise<AdminAccount[]> => {
    const { data, error } = await supabase.rpc("get_admin_users");
    if (error) throw new Error(error.message);
    return ((data || []) as AdminRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      createdAt: row.created_at,
    }));
  },

  addAdminByEmail: async (email: string): Promise<void> => {
    const { error } = await supabase.rpc("add_admin_by_email", {
      p_email: email.trim().toLowerCase(),
    });
    if (error) throw new Error(error.message);
  },

  removeAdmin: async (userId: string): Promise<void> => {
    const { error } = await supabase.rpc("remove_admin", {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },
};
