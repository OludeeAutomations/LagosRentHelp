// src/hooks/useAmenities.ts
import { useMemo } from "react";
import { parseAmenities } from "@/utils/parseAmenities";

export const useAmenities = (amenities: any): string[] => {
  return useMemo(() => parseAmenities(amenities), [amenities]);
};
