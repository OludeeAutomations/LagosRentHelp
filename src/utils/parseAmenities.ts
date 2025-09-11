// src/utils/parseAmenities.ts
export const parseAmenities = (amenities: any): string[] => {
  // If it's already a proper array of strings, return it
  if (
    Array.isArray(amenities) &&
    amenities.every((item) => typeof item === "string")
  ) {
    return amenities;
  }

  // Handle the specific case where it's an array containing a JSON string
  if (
    Array.isArray(amenities) &&
    amenities.length === 1 &&
    typeof amenities[0] === "string"
  ) {
    const firstItem = amenities[0].trim();

    // Check if it's a JSON array string
    if (firstItem.startsWith("[") && firstItem.endsWith("]")) {
      try {
        const parsed = JSON.parse(firstItem);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === "string");
        }
      } catch (e) {
        console.warn("Failed to parse amenities JSON:", e);
      }
    }

    // Handle comma-separated string within the array
    if (firstItem.includes(",")) {
      return firstItem
        .split(",")
        .map((item) => item.trim().replace(/["']/g, ""));
    }

    // Return the single item as array
    return [firstItem.replace(/["']/g, "")];
  }

  // Handle string input (fallback)
  if (typeof amenities === "string") {
    const trimmed = amenities.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === "string");
        }
      } catch (e) {
        console.warn("Failed to parse amenities JSON:", e);
      }
    }
    return [trimmed.replace(/["']/g, "")];
  }

  // Fallback for any other type
  return [];
};
