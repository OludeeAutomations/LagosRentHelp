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
  bio: string;
  verificationStatus: "pending" | "verified" | "rejected";
}

export interface LandlordOnboardingInput {
  businessName: string;
  whatsappNumber: string;
  residentialAddress: string;
  bio: string;
}

export interface LandlordListingInput {
  title: string;
  description: string;
  price: number;
  totalPackagePrice: number;
  location: string;
  type: Property["type"];
  listingType: Property["listingType"];
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: File[];
}

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

export const landlordService = {
  completeOnboarding: async (
    input: LandlordOnboardingInput,
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

    const { data, error } = await supabase.rpc("complete_landlord_onboarding", {
      p_business_name: input.businessName.trim(),
      p_whatsapp_number: input.whatsappNumber.trim(),
      p_residential_address: input.residentialAddress.trim(),
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

  getProfile: async (): Promise<LandlordProfile | null> => {
    const profile = await ensureProfile();
    const { data, error } = await supabase
      .from("landlord_profiles")
      .select(
        "user_id, business_name, whatsapp_number, residential_address, bio, verification_status",
      )
      .eq("user_id", profile.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;

    return {
      userId: data.user_id,
      businessName: data.business_name || "",
      whatsappNumber: data.whatsapp_number || "",
      residentialAddress: data.residential_address || "",
      bio: data.bio || "",
      verificationStatus: data.verification_status,
    };
  },

  getMyListings: async (): Promise<Property[]> => {
    const { data, error } = await supabase
      .rpc("get_my_properties")
      .select(PUBLIC_PROPERTY_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as PublicPropertyRow[]).map(mapPublicProperty);
  },

  createListing: async (input: LandlordListingInput): Promise<Property> => {
    const profile = await ensureProfile();
    if (profile.role !== "landlord") {
      throw new Error("Complete landlord onboarding before creating a listing.");
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
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        area: input.area,
        amenities: input.amenities,
        images: imageUrls,
        status: "available",
        approval_status: "pending",
        owner_id: profile.id,
        contact_user_id: profile.id,
        created_by: profile.id,
      })
      .select(PUBLIC_PROPERTY_COLUMNS)
      .single();

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

  deleteListing: async (id: string): Promise<void> => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
