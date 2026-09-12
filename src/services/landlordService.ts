import { supabase } from "@/lib/supabase";
import type { Property, User } from "@/types";
import {
  mapPublicProperty,
  PUBLIC_PROPERTY_COLUMNS,
  type PublicPropertyRow,
} from "./propertyService";

export interface LandlordProfile {
  userId: string;
  businessName: string;
  whatsappNumber: string;
  residentialAddress: string;
  state: string;
  localGovernment: string;
  bio: string;
  verificationStatus: "pending" | "verified" | "rejected";
  identityImageUrl: string | null;
}

export interface LandlordProfileInput {
  businessName: string;
  whatsappNumber: string;
  residentialAddress: string;
  state: string;
  localGovernment: string;
  bio: string;
}

export interface LandlordApplicationInput extends LandlordProfileInput {
  nin: string;
  identityImage: File;
  propertyAddress: string;
  propertyLocalGovernment: string;
  ownershipDocumentType: string;
  ownershipDocument: File;
}

export interface NinVerificationResult {
  verified: true;
  identity: {
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
  };
}

export interface LandlordListingInput {
  title: string;
  description: string;
  price: number;
  totalPackagePrice: number;
  location: string;
  type: Property["type"];
  listingType: Property["listingType"];
  minimumStay: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: File[];
  tenantMaxOccupants: number;
  tenantEmploymentType: string;
  tenantMinIncomeBand: number;
  tenantGuarantorRequired: boolean;
  tenantMinLeaseMonths: number;
  tenantPetsAllowed: boolean;
  tenantSmokingAllowed: boolean;
  tenantMoveInWindow: string;
  tenantAccommodationType: string;
  tenantGenderPreference: string;
}

export interface LandlordListing extends Property {
  tenantMaxOccupants: number;
  tenantEmploymentType: string;
  tenantMinIncomeBand: number;
  tenantGuarantorRequired: boolean;
  tenantMinLeaseMonths: number;
  tenantPetsAllowed: boolean;
  tenantSmokingAllowed: boolean;
  tenantMoveInWindow: string;
  tenantAccommodationType: string;
  tenantGenderPreference: string;
}

type LandlordPropertyRow = PublicPropertyRow & {
  tenant_max_occupants: number;
  tenant_employment_type: string;
  tenant_min_income_band: number;
  tenant_guarantor_required: boolean;
  tenant_min_lease_months: number;
  tenant_pets_allowed: boolean;
  tenant_smoking_allowed: boolean;
  tenant_move_in_window: string;
  tenant_accommodation_type: string;
  tenant_gender_preference: string;
};

const LANDLORD_PROPERTY_COLUMNS = `${PUBLIC_PROPERTY_COLUMNS},
  tenant_max_occupants,
  tenant_employment_type,
  tenant_min_income_band,
  tenant_guarantor_required,
  tenant_min_lease_months,
  tenant_pets_allowed,
  tenant_smoking_allowed,
  tenant_move_in_window,
  tenant_accommodation_type,
  tenant_gender_preference
`;

const mapLandlordProperty = (row: LandlordPropertyRow): LandlordListing => ({
  ...mapPublicProperty(row),
  tenantMaxOccupants: row.tenant_max_occupants,
  tenantEmploymentType: row.tenant_employment_type,
  tenantMinIncomeBand: row.tenant_min_income_band,
  tenantGuarantorRequired: row.tenant_guarantor_required,
  tenantMinLeaseMonths: row.tenant_min_lease_months,
  tenantPetsAllowed: row.tenant_pets_allowed,
  tenantSmokingAllowed: row.tenant_smoking_allowed,
  tenantMoveInWindow: row.tenant_move_in_window,
  tenantAccommodationType: row.tenant_accommodation_type,
  tenantGenderPreference: row.tenant_gender_preference,
});

type ProfileRpcResult = {
  id: string;
  role: User["role"];
};

const requireSession = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Please sign in to continue.");
  return user;
};

const ensureProfile = async (): Promise<ProfileRpcResult> => {
  const { data, error } = await supabase.rpc("ensure_my_profile");
  if (error) {
    throw new Error(
      "The landlord database setup is not installed yet. Run supabase_landlord_migration.sql in Supabase.",
    );
  }
  return data as ProfileRpcResult;
};

const uploadImages = async (files: File[]): Promise<string[]> => {
  const authUser = await requireSession();
  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${authUser.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("property-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
    }

    return uploadedPaths.map(
      (path) =>
        supabase.storage.from("property-images").getPublicUrl(path).data
          .publicUrl,
    );
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from("property-images").remove(uploadedPaths);
    }
    throw error;
  }
};

const uploadVerificationFile = async (
  authUserId: string,
  file: File,
  category: "identity" | "ownership",
): Promise<string> => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Verification files must be smaller than 5 MB.");
  }

  const allowedTypes = category === "identity"
    ? ["image/jpeg", "image/png", "image/webp"]
    : ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      category === "identity"
        ? "Your identity photo must be a JPG, PNG or WebP image."
        : "Your ownership document must be a PDF, JPG, PNG or WebP file.",
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ||
    (file.type === "application/pdf" ? "pdf" : "jpg");
  const path = `${authUserId}/${category}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("landlord-verification")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
};

export const landlordService = {
  verifyNin: async (nin: string): Promise<NinVerificationResult> => {
    const { data, error } = await supabase.functions.invoke("verify-nin", {
      body: { nin: nin.replace(/\D/g, "") },
    });
    if (error) {
      let message = error.message || "NIN verification failed.";
      const response = (error as { context?: Response }).context;
      if (response) {
        try {
          const body = await response.clone().json() as { error?: string };
          if (body.error) message = body.error;
        } catch {
          // Keep the provider-safe fallback message.
        }
      }
      throw new Error(message);
    }
    if (!data?.verified) throw new Error(data?.error || "NIN verification failed.");
    return data as NinVerificationResult;
  },

  updateProfile: async (
    input: LandlordProfileInput,
  ): Promise<ProfileRpcResult> => {
    const authUser = await requireSession();
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...(authUser.user_metadata || {}),
        phone: input.whatsappNumber.trim(),
        account_type: "landlord",
      },
    });
    if (authError) throw new Error(authError.message);

    const { data, error } = await supabase.rpc("update_landlord_profile", {
      p_business_name: input.businessName.trim(),
      p_whatsapp_number: input.whatsappNumber.trim(),
      p_residential_address: input.residentialAddress.trim(),
      p_state: input.state.trim(),
      p_local_government: input.localGovernment.trim(),
      p_bio: input.bio.trim(),
    });
    if (error) {
      if (error.message.includes("users_phone_key")) {
        throw new Error(
          "That phone number belongs to an existing account. Your landlord details were not changed.",
        );
      }
      throw new Error(error.message);
    }
    return data as ProfileRpcResult;
  },

  submitApplication: async (
    input: LandlordApplicationInput,
  ): Promise<ProfileRpcResult> => {
    const authUser = await requireSession();
    const nin = input.nin.replace(/\D/g, "");
    if (!/^\d{11}$/.test(nin)) {
      throw new Error("Enter a valid 11-digit NIN.");
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...(authUser.user_metadata || {}),
        phone: input.whatsappNumber.trim(),
        account_type: "landlord",
      },
    });
    if (authError) throw new Error(authError.message);

    const uploadedPaths: string[] = [];
    try {
      const identityImagePath = await uploadVerificationFile(
        authUser.id,
        input.identityImage,
        "identity",
      );
      uploadedPaths.push(identityImagePath);
      const ownershipDocumentPath = await uploadVerificationFile(
        authUser.id,
        input.ownershipDocument,
        "ownership",
      );
      uploadedPaths.push(ownershipDocumentPath);

      const { data, error } = await supabase.rpc("submit_landlord_application", {
        p_business_name: input.businessName.trim(),
        p_whatsapp_number: input.whatsappNumber.trim(),
        p_residential_address: input.residentialAddress.trim(),
        p_state: input.state.trim(),
        p_local_government: input.localGovernment.trim(),
        p_bio: input.bio.trim(),
        p_nin: nin,
        p_identity_image_path: identityImagePath,
        p_property_address: input.propertyAddress.trim(),
        p_property_local_government: input.propertyLocalGovernment.trim(),
        p_ownership_document_type: input.ownershipDocumentType,
        p_ownership_document_path: ownershipDocumentPath,
      });
      if (error) {
        if (error.message.toLowerCase().includes("nin")) {
          throw new Error("This NIN is already connected to another landlord account.");
        }
        throw new Error(error.message);
      }
      return data as ProfileRpcResult;
    } catch (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from("landlord-verification").remove(uploadedPaths);
      }
      throw error;
    }
  },

  getProfile: async (): Promise<LandlordProfile | null> => {
    const profile = await ensureProfile();
    const { data, error } = await supabase
      .from("landlord_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    let identityImageUrl: string | null = null;
    if (data.verification_status === "verified") {
      const { data: verification } = await supabase
        .from("landlord_verifications")
        .select("identity_image_path")
        .eq("user_id", profile.id)
        .maybeSingle();

      if (verification?.identity_image_path) {
        const { data: signedImage } = await supabase.storage
          .from("landlord-verification")
          .createSignedUrl(verification.identity_image_path, 3600);
        identityImageUrl = signedImage?.signedUrl || null;
      }
    }

    return {
      userId: data.user_id,
      businessName: data.business_name || "",
      whatsappNumber: data.whatsapp_number || "",
      residentialAddress: data.residential_address || "",
      state: data.state || "",
      localGovernment: data.local_government || "",
      bio: data.bio || "",
      verificationStatus: data.verification_status,
      identityImageUrl,
    };
  },

  getMyListings: async (): Promise<LandlordListing[]> => {
    const { data, error } = await supabase
      .rpc("get_my_properties")
      .select(LANDLORD_PROPERTY_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as LandlordPropertyRow[]).map(mapLandlordProperty);
  },

  getMyListingById: async (id: string): Promise<LandlordListing> => {
    const { data, error } = await supabase
      .rpc("get_my_properties")
      .select(LANDLORD_PROPERTY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Listing not found or you do not have permission to edit it.");
    return mapLandlordProperty(data as LandlordPropertyRow);
  },

  createListing: async (input: LandlordListingInput): Promise<Property> => {
    const profile = await ensureProfile();
    if (profile.role !== "landlord") {
      throw new Error("Complete landlord onboarding before creating a listing.");
    }

    const { data: landlordProfile, error: verificationError } = await supabase
      .from("landlord_profiles")
      .select("verification_status")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (verificationError) throw new Error(verificationError.message);
    if (landlordProfile?.verification_status !== "verified") {
      throw new Error("Your ownership verification must be approved before you can create a listing.");
    }

    const { data: isDuplicate, error: duplicateCheckError } = await supabase.rpc(
      "is_duplicate_property_listing",
      {
        p_title: input.title.trim(),
        p_location: input.location.trim(),
        p_property_type: input.type,
        p_listing_type: input.listingType,
      },
    );
    if (duplicateCheckError) {
      if (duplicateCheckError.message.includes("is_duplicate_property_listing")) {
        throw new Error("Run the latest listing database migration before publishing a property.");
      }
      throw new Error(duplicateCheckError.message);
    }
    if (isDuplicate) {
      throw new Error("This property is already in your listings. Update the existing listing instead.");
    }

    const imageUrls = await uploadImages(input.images);
    const { data, error } = await supabase
      .from("properties")
      .insert({
        title: input.title.trim(),
        description: input.description.trim(),
        price: input.price,
        total_package_price: input.totalPackagePrice,
        location: input.location.trim(),
        type: input.type,
        listing_type: input.listingType,
        minimum_stay: input.listingType === "short-let" ? input.minimumStay : null,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        area: input.area,
        amenities: input.amenities,
        images: imageUrls,
        status: "available",
        approval_status: "approved",
        owner_id: profile.id,
        contact_user_id: profile.id,
        created_by: profile.id,
        tenant_max_occupants: input.tenantMaxOccupants,
        tenant_employment_type: input.tenantEmploymentType,
        tenant_min_income_band: input.tenantMinIncomeBand,
        tenant_guarantor_required: input.tenantGuarantorRequired,
        tenant_min_lease_months: input.tenantMinLeaseMonths,
        tenant_pets_allowed: input.tenantPetsAllowed,
        tenant_smoking_allowed: input.tenantSmokingAllowed,
        tenant_move_in_window: input.tenantMoveInWindow,
        tenant_accommodation_type: input.tenantAccommodationType,
        tenant_gender_preference:
          input.tenantAccommodationType === "shared"
            ? input.tenantGenderPreference
            : "any",
      })
      .select(PUBLIC_PROPERTY_COLUMNS)
      .single();

    if (error?.code === "23505") {
      throw new Error("This property is already in your listings. Update the existing listing instead.");
    }
    if (error) throw new Error(error.message);
    return mapPublicProperty(data as PublicPropertyRow);
  },

  updateListingStatus: async (
    id: string,
    status: Property["status"],
  ): Promise<void> => {
    const { error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  updateListing: async (
    id: string,
    input: LandlordListingInput,
  ): Promise<LandlordListing> => {
    const profile = await ensureProfile();
    if (profile.role !== "landlord") {
      throw new Error("Only landlords can update their listings.");
    }

    const imageUrls = input.images.length ? await uploadImages(input.images) : null;
    const { data, error } = await supabase
      .from("properties")
      .update({
        title: input.title.trim(),
        description: input.description.trim(),
        price: input.price,
        total_package_price: input.totalPackagePrice,
        location: input.location.trim(),
        type: input.type,
        listing_type: input.listingType,
        minimum_stay: input.listingType === "short-let" ? input.minimumStay : null,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        area: input.area,
        amenities: input.amenities,
        ...(imageUrls ? { images: imageUrls } : {}),
        tenant_max_occupants: input.tenantMaxOccupants,
        tenant_employment_type: input.tenantEmploymentType,
        tenant_min_income_band: input.tenantMinIncomeBand,
        tenant_guarantor_required: input.tenantGuarantorRequired,
        tenant_min_lease_months: input.tenantMinLeaseMonths,
        tenant_pets_allowed: input.tenantPetsAllowed,
        tenant_smoking_allowed: input.tenantSmokingAllowed,
        tenant_move_in_window: input.tenantMoveInWindow,
        tenant_accommodation_type: input.tenantAccommodationType,
        tenant_gender_preference:
          input.tenantAccommodationType === "shared"
            ? input.tenantGenderPreference
            : "any",
      })
      .eq("id", id)
      .eq("created_by", profile.id)
      .select(LANDLORD_PROPERTY_COLUMNS)
      .single();

    if (error?.code === "23505") {
      throw new Error("Another listing already uses these property details.");
    }
    if (error) throw new Error(error.message);
    return mapLandlordProperty(data as LandlordPropertyRow);
  },

  deleteListing: async (id: string): Promise<void> => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
