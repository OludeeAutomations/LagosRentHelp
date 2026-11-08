import { supabase } from "@/lib/supabase";
import type { Property } from "@/types";
import {
  LANDLORD_PROPERTY_COLUMNS,
  mapLandlordProperty,
  uploadPropertyImages,
  type LandlordListing,
  type LandlordListingInput,
  type LandlordPropertyRow,
} from "./landlordService";

type AdminPropertyRow = LandlordPropertyRow & {
  created_by: string | null;
};

export type AdminListing = Omit<LandlordListing, "createdBy"> & {
  createdBy: string | null;
};

const ADMIN_PROPERTY_COLUMNS = `${LANDLORD_PROPERTY_COLUMNS}, created_by`;

const mapAdminProperty = (row: AdminPropertyRow): AdminListing => ({
  ...mapLandlordProperty(row),
  createdBy: row.created_by,
});

const requireSuperAdminProfile = async (): Promise<string> => {
  const { data, error } = await supabase.rpc("ensure_my_profile");
  if (error) throw new Error(error.message);
  const profile = data as { id?: string; role?: string } | null;
  if (!profile?.id || profile.role !== "super_admin") {
    throw new Error("Only the super administrator can manage LagosRentHelp listings.");
  }
  return profile.id;
};

const listingValues = (input: LandlordListingInput) => ({
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
});

const friendlyError = (error: { code?: string; message: string }) => {
  if (error.code === "23505") {
    return new Error("This property is already in the LagosRentHelp listings.");
  }
  if (error.message.toLowerCase().includes("row-level security")) {
    return new Error(
      "Superadmin listing access is not installed yet. Run supabase_lagosrenthelp_listings_migration.sql in Supabase.",
    );
  }
  return new Error(error.message);
};

export const adminListingService = {
  getAll: async (): Promise<AdminListing[]> => {
    await requireSuperAdminProfile();
    const { data, error } = await supabase
      .from("properties")
      .select(ADMIN_PROPERTY_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw friendlyError(error);
    return (data as AdminPropertyRow[]).map(mapAdminProperty);
  },

  getById: async (id: string): Promise<AdminListing> => {
    await requireSuperAdminProfile();
    const { data, error } = await supabase
      .from("properties")
      .select(ADMIN_PROPERTY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw friendlyError(error);
    if (!data) throw new Error("Listing not found.");
    return mapAdminProperty(data as AdminPropertyRow);
  },

  create: async (input: LandlordListingInput): Promise<AdminListing> => {
    const profileId = await requireSuperAdminProfile();
    const imageUrls = await uploadPropertyImages(input.images);
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...listingValues(input),
        images: imageUrls,
        status: "available",
        approval_status: "approved",
        owner_id: profileId,
        contact_user_id: profileId,
        created_by: profileId,
      })
      .select(ADMIN_PROPERTY_COLUMNS)
      .single();
    if (error) throw friendlyError(error);
    return mapAdminProperty(data as AdminPropertyRow);
  },

  update: async (
    id: string,
    input: LandlordListingInput,
  ): Promise<AdminListing> => {
    await requireSuperAdminProfile();
    const imageUrls = input.images.length
      ? await uploadPropertyImages(input.images)
      : null;
    const { data, error } = await supabase
      .from("properties")
      .update({
        ...listingValues(input),
        ...(imageUrls ? { images: imageUrls } : {}),
      })
      .eq("id", id)
      .select(ADMIN_PROPERTY_COLUMNS)
      .single();
    if (error) throw friendlyError(error);
    return mapAdminProperty(data as AdminPropertyRow);
  },

  updateStatus: async (id: string, status: Property["status"]): Promise<void> => {
    await requireSuperAdminProfile();
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) throw friendlyError(error);
  },

  delete: async (id: string): Promise<void> => {
    await requireSuperAdminProfile();
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) throw friendlyError(error);
  },
};
