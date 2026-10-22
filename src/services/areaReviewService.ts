import { starterAreaReviewLocations, findStarterArea } from "@/data/areaReviewLocations";
import { areaReviewsSupabase } from "@/lib/areaReviewsSupabase";
import { supabase } from "@/lib/supabase";
import type {
  AreaReviewLocation,
  AreaReviewLocationDetail,
  ModerationAreaReview,
  ReviewModerationStatus,
  SubmitAreaReviewPayload,
} from "@/types/areaReviews";

type UnknownRecord = Record<string, unknown>;

const numberOrNull = (value: unknown) =>
  value === null || value === undefined ? null : Number(value);

const ratingsFrom = (row: UnknownRecord) => ({
  electricity: Number(row.electricity_rating || 0),
  water: Number(row.water_rating || 0),
  security: Number(row.security_rating || 0),
  roads: Number(row.roads_rating || 0),
  noise: Number(row.noise_rating || 0),
  maintenance: Number(row.maintenance_rating || 0),
});

const mapLocation = (row: UnknownRecord): AreaReviewLocation => ({
  id: String(row.id),
  name: String(row.name),
  slug: String(row.slug),
  type: row.location_type as AreaReviewLocation["type"],
  lga: String(row.lga),
  state: String(row.state || "Lagos"),
  description: String(row.description || ""),
  reviewCount: Number(row.review_count || 0),
  averageRating: numberOrNull(row.average_rating),
  averageRent: numberOrNull(row.average_rent),
  averageMoveInCost: numberOrNull(row.average_move_in_cost),
  ratings: ratingsFrom(row),
});

const mapPublicReview = (row: UnknownRecord) => ({
  id: String(row.id),
  displayName: String(row.display_name || "Lagos resident"),
  residencyStatus: row.residency_status as "current" | "former",
  propertyType: String(row.property_type),
  livedFrom: Number(row.lived_from),
  livedTo: numberOrNull(row.lived_to),
  rentAmount: numberOrNull(row.rent_amount),
  serviceCharge: numberOrNull(row.service_charge),
  moveInCost: numberOrNull(row.move_in_cost),
  overallRating: Number(row.overall_rating),
  ratings: ratingsFrom(row),
  floodRisk: row.flood_risk as "none" | "low" | "moderate" | "high" | "unsure",
  headline: String(row.headline),
  review: String(row.review_text),
  evidenceVerified: Boolean(row.evidence_verified),
  createdAt: String(row.created_at),
});

const relationMissing = (message: string) =>
  message.includes("area_review") || message.includes("Could not find the function");

const mergeStarterLocations = (locations: AreaReviewLocation[]) => {
  const bySlug = new Map(locations.map((location) => [location.slug, location]));
  starterAreaReviewLocations.forEach((starter) => {
    if (!bySlug.has(starter.slug)) bySlug.set(starter.slug, starter);
  });
  return Array.from(bySlug.values()).sort((first, second) => {
    if (first.type === "lga" && second.type !== "lga") return -1;
    if (first.type !== "lga" && second.type === "lga") return 1;
    return first.name.localeCompare(second.name);
  });
};

export const areaReviewService = {
  getLocations: async (search = ""): Promise<AreaReviewLocation[]> => {
    const { data, error } = await areaReviewsSupabase.rpc("get_area_review_locations", {
      p_search: search.trim() || null,
    });
    if (error) {
      if (relationMissing(error.message)) {
        const term = search.trim().toLowerCase();
        return starterAreaReviewLocations.filter((location) =>
          !term || `${location.name} ${location.lga}`.toLowerCase().includes(term),
        );
      }
      throw new Error(error.message);
    }
    const locations = ((data || []) as UnknownRecord[]).map(mapLocation);
    return search ? locations : mergeStarterLocations(locations);
  },

  getLocation: async (slug: string): Promise<AreaReviewLocationDetail | null> => {
    const { data, error } = await areaReviewsSupabase.rpc("get_area_review_location", {
      p_slug: slug,
    });
    if (error) {
      if (!relationMissing(error.message)) throw new Error(error.message);
      const starter = findStarterArea(slug);
      return starter ? { ...starter, reviews: [] } : null;
    }
    if (!data) {
      const starter = findStarterArea(slug);
      return starter ? { ...starter, reviews: [] } : null;
    }
    const result = data as UnknownRecord;
    const location = mapLocation((result.location || {}) as UnknownRecord);
    return {
      ...location,
      reviews: ((result.reviews || []) as UnknownRecord[]).map(mapPublicReview),
    };
  },

  submit: async (payload: SubmitAreaReviewPayload): Promise<string> => {
    const { data: authData, error: authError } = await areaReviewsSupabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("Your Area Reviews session has expired. Please sign in again.");
    }

    const databaseLocationId = payload.locationId?.startsWith("starter-")
      ? null
      : payload.locationId || null;
    const { data, error } = await areaReviewsSupabase.rpc("submit_area_review", {
      p_location_id: databaseLocationId,
      p_location_name: payload.locationName,
      p_location_type: payload.locationType,
      p_lga: payload.lga,
      p_residency_status: payload.residencyStatus,
      p_property_type: payload.propertyType,
      p_lived_from: payload.livedFrom,
      p_lived_to: payload.livedTo || null,
      p_rent_amount: payload.rentAmount || null,
      p_service_charge: payload.serviceCharge || null,
      p_move_in_cost: payload.moveInCost || null,
      p_overall_rating: payload.overallRating,
      p_electricity_rating: payload.ratings.electricity,
      p_water_rating: payload.ratings.water,
      p_security_rating: payload.ratings.security,
      p_roads_rating: payload.ratings.roads,
      p_noise_rating: payload.ratings.noise,
      p_maintenance_rating: payload.ratings.maintenance,
      p_flood_risk: payload.floodRisk,
      p_headline: payload.headline,
      p_review_text: payload.review,
      p_show_first_name: payload.showFirstName,
    });
    if (error) {
      if (relationMissing(error.message)) {
        throw new Error("Area Reviews database setup is not installed yet. Run supabase_area_reviews_migration.sql in Supabase.");
      }
      throw new Error(error.message);
    }
    return String((data as UnknownRecord)?.id || data);
  },

  getModerationQueue: async (): Promise<ModerationAreaReview[]> => {
    const { data, error } = await supabase.rpc("get_admin_area_reviews");
    if (error) throw new Error(error.message);
    return ((data || []) as UnknownRecord[]).map((row) => ({
      ...mapPublicReview(row),
      locationName: String(row.location_name),
      locationSlug: String(row.location_slug),
      lga: String(row.lga),
      reviewerName: String(row.reviewer_name),
      reviewerEmail: String(row.reviewer_email),
      status: row.status as ReviewModerationStatus,
      moderationNote: row.moderation_note ? String(row.moderation_note) : null,
      submittedAt: String(row.submitted_at),
    }));
  },

  moderate: async (
    reviewId: string,
    status: Exclude<ReviewModerationStatus, "pending">,
    note?: string,
  ) => {
    const { error } = await supabase.rpc("moderate_area_review", {
      p_review_id: reviewId,
      p_status: status,
      p_note: note?.trim() || null,
    });
    if (error) throw new Error(error.message);
  },
};
