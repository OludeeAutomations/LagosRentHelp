export const formatNaira = (value: number | null) =>
  value === null
    ? "Not enough data"
    : new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(value);

export const formatRating = (value: number | null) =>
  value === null ? "New" : value.toFixed(1);

export const formatPropertyType = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const floodRiskLabel: Record<string, string> = {
  none: "No flooding noticed",
  low: "Low flood risk",
  moderate: "Moderate flood risk",
  high: "High flood risk",
  unsure: "Not sure",
};

export const ratingLabels: Record<string, string> = {
  electricity: "Electricity",
  water: "Water",
  security: "Security",
  roads: "Roads & access",
  noise: "Quietness",
  maintenance: "Maintenance",
};
