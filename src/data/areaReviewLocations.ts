import type { AreaReviewLocation } from "@/types/areaReviews";

const emptyRatings = {
  electricity: 0,
  water: 0,
  security: 0,
  roads: 0,
  noise: 0,
  maintenance: 0,
};

export const lagosLocalGovernmentAreas = [
  "Agege",
  "Ajeromi-Ifelodun",
  "Alimosho",
  "Amuwo-Odofin",
  "Apapa",
  "Badagry",
  "Epe",
  "Eti-Osa",
  "Ibeju-Lekki",
  "Ifako-Ijaiye",
  "Ikeja",
  "Ikorodu",
  "Kosofe",
  "Lagos Island",
  "Lagos Mainland",
  "Mushin",
  "Ojo",
  "Oshodi-Isolo",
  "Shomolu",
  "Surulere",
] as const;

const lgaStarterLocations: AreaReviewLocation[] = lagosLocalGovernmentAreas.map((lga) => {
  const slug = `${lga.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-lga`;
  return {
    id: `starter-${slug}`,
    name: `${lga} LGA`,
    slug,
    type: "lga",
    lga,
    state: "Lagos",
    description: `Resident experiences covering rent, utilities, roads, flooding, security and daily life across ${lga} Local Government Area.`,
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  };
});

// These are starter pages, not fabricated reviews or ratings. Database results
// replace them as residents begin contributing real experiences.
const neighbourhoodStarterLocations: AreaReviewLocation[] = [
  {
    id: "starter-yaba",
    name: "Yaba",
    slug: "yaba",
    type: "neighbourhood",
    lga: "Lagos Mainland",
    state: "Lagos",
    description: "Share and discover first-hand living experiences from Yaba residents.",
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  },
  {
    id: "starter-surulere",
    name: "Surulere",
    slug: "surulere",
    type: "neighbourhood",
    lga: "Surulere",
    state: "Lagos",
    description: "Real resident notes about costs, utilities, roads and daily life in Surulere.",
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  },
  {
    id: "starter-ikeja",
    name: "Ikeja",
    slug: "ikeja",
    type: "neighbourhood",
    lga: "Ikeja",
    state: "Lagos",
    description: "Resident-led information for renters considering Ikeja.",
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  },
  {
    id: "starter-lekki-phase-1",
    name: "Lekki Phase 1",
    slug: "lekki-phase-1",
    type: "neighbourhood",
    lga: "Eti-Osa",
    state: "Lagos",
    description: "Compare the real costs and living conditions reported around Lekki Phase 1.",
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  },
  {
    id: "starter-ikotun",
    name: "Ikotun",
    slug: "ikotun",
    type: "neighbourhood",
    lga: "Alimosho",
    state: "Lagos",
    description: "Practical housing experiences shared by people who live or have lived in Ikotun.",
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  },
  {
    id: "starter-ajah",
    name: "Ajah",
    slug: "ajah",
    type: "neighbourhood",
    lga: "Eti-Osa",
    state: "Lagos",
    description: "Resident reviews of rent, flooding, utilities and commuting around Ajah.",
    reviewCount: 0,
    averageRating: null,
    averageRent: null,
    averageMoveInCost: null,
    ratings: emptyRatings,
  },
];

export const starterAreaReviewLocations: AreaReviewLocation[] = [
  ...lgaStarterLocations,
  ...neighbourhoodStarterLocations,
];

export const findStarterArea = (slug: string) =>
  starterAreaReviewLocations.find((location) => location.slug === slug);
