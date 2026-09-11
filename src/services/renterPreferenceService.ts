import { supabase } from "@/lib/supabase";

export interface RenterPreferences {
  preferredLga: string;
  budgetMin: number;
  budgetMax: number;
  propertyType: string;
  occupantCount: number;
  isAdult: boolean;
  employmentType: string;
  incomeBand: number;
  moveInWindow: string;
  leaseDurationMonths: number;
  hasGuarantor: boolean;
  hasPets: boolean;
  smokes: boolean;
  accommodationType: string;
  gender: string;
}

type PreferenceRow = {
  preferred_lga: string;
  budget_min: number;
  budget_max: number;
  property_type: string;
  occupant_count: number;
  is_adult: boolean;
  employment_type: string;
  income_band: number;
  move_in_window: string;
  lease_duration_months: number;
  has_guarantor: boolean;
  has_pets: boolean;
  smokes: boolean;
  accommodation_type: string;
  gender: string;
};

export interface PropertyMatch {
  propertyId: string;
  score: number;
  reasons: string[];
}

const mapPreferences = (row: PreferenceRow): RenterPreferences => ({
  preferredLga: row.preferred_lga,
  budgetMin: Number(row.budget_min),
  budgetMax: Number(row.budget_max),
  propertyType: row.property_type,
  occupantCount: row.occupant_count,
  isAdult: row.is_adult,
  employmentType: row.employment_type,
  incomeBand: row.income_band,
  moveInWindow: row.move_in_window,
  leaseDurationMonths: row.lease_duration_months,
  hasGuarantor: row.has_guarantor,
  hasPets: row.has_pets,
  smokes: row.smokes,
  accommodationType: row.accommodation_type,
  gender: row.gender,
});

export const renterPreferenceService = {
  getMine: async (): Promise<RenterPreferences | null> => {
    const { data, error } = await supabase.rpc("get_my_renter_preferences");
    if (error) throw new Error(error.message);
    return data ? mapPreferences(data as PreferenceRow) : null;
  },

  saveMine: async (preferences: RenterPreferences): Promise<void> => {
    const { error } = await supabase.rpc("save_my_renter_preferences", {
      p_preferred_lga: preferences.preferredLga,
      p_budget_min: preferences.budgetMin,
      p_budget_max: preferences.budgetMax,
      p_property_type: preferences.propertyType,
      p_occupant_count: preferences.occupantCount,
      p_is_adult: preferences.isAdult,
      p_employment_type: preferences.employmentType,
      p_income_band: preferences.incomeBand,
      p_move_in_window: preferences.moveInWindow,
      p_lease_duration_months: preferences.leaseDurationMonths,
      p_has_guarantor: preferences.hasGuarantor,
      p_has_pets: preferences.hasPets,
      p_smokes: preferences.smokes,
      p_accommodation_type: preferences.accommodationType,
      p_gender: preferences.gender,
    });
    if (error) throw new Error(error.message);
  },

  getPropertyMatches: async (): Promise<PropertyMatch[]> => {
    const { data, error } = await supabase.rpc("get_recommended_property_matches");
    if (error) return [];
    return ((data || []) as Array<{
      property_id: string;
      match_score: number;
      match_reasons: string[] | null;
    }>).map((row) => ({
      propertyId: row.property_id,
      score: row.match_score,
      reasons: row.match_reasons || [],
    }));
  },
};
