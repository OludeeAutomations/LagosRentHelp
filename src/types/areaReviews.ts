export type AreaLocationType = "lga" | "neighbourhood" | "estate" | "street" | "building";

export type ResidencyStatus = "current" | "former";

export type FloodRisk = "none" | "low" | "moderate" | "high" | "unsure";

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export interface AreaRatingBreakdown {
  electricity: number;
  water: number;
  security: number;
  roads: number;
  noise: number;
  maintenance: number;
}

export interface AreaReviewLocation {
  id: string;
  name: string;
  slug: string;
  type: AreaLocationType;
  lga: string;
  state: string;
  description: string;
  reviewCount: number;
  averageRating: number | null;
  averageRent: number | null;
  averageMoveInCost: number | null;
  ratings: AreaRatingBreakdown;
}

export interface PublicAreaReview {
  id: string;
  displayName: string;
  residencyStatus: ResidencyStatus;
  propertyType: string;
  livedFrom: number;
  livedTo: number | null;
  rentAmount: number | null;
  serviceCharge: number | null;
  moveInCost: number | null;
  overallRating: number;
  ratings: AreaRatingBreakdown;
  floodRisk: FloodRisk;
  headline: string;
  review: string;
  evidenceVerified: boolean;
  createdAt: string;
}

export interface FeaturedAreaReview extends PublicAreaReview {
  locationName: string;
  locationSlug: string;
  lga: string;
}

export interface AreaReviewLocationDetail extends AreaReviewLocation {
  reviews: PublicAreaReview[];
}

export interface SubmitAreaReviewPayload {
  locationId?: string;
  locationName: string;
  locationType: AreaLocationType;
  lga: string;
  residencyStatus: ResidencyStatus;
  propertyType: string;
  livedFrom: number;
  livedTo?: number;
  rentAmount?: number;
  serviceCharge?: number;
  moveInCost?: number;
  overallRating: number;
  ratings: AreaRatingBreakdown;
  floodRisk: FloodRisk;
  headline: string;
  review: string;
  showFirstName: boolean;
}

export interface ModerationAreaReview extends PublicAreaReview {
  locationName: string;
  locationSlug: string;
  lga: string;
  reviewerName: string;
  reviewerEmail: string;
  status: ReviewModerationStatus;
  moderationNote: string | null;
  submittedAt: string;
}
