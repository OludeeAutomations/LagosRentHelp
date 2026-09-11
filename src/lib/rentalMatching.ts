export const EMPLOYMENT_TYPES = [
  { value: "salaried", label: "Salaried / 9–5" },
  { value: "self_employed", label: "Self-employed / business owner" },
  { value: "contract", label: "Contract / freelance" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
] as const;

export const INCOME_BANDS = [
  { value: 1, label: "Below ₦100,000 monthly" },
  { value: 2, label: "₦100,000 – ₦249,999 monthly" },
  { value: 3, label: "₦250,000 – ₦499,999 monthly" },
  { value: 4, label: "₦500,000 – ₦999,999 monthly" },
  { value: 5, label: "₦1,000,000 or more monthly" },
] as const;

export const BUDGET_BANDS = [
  { value: "under_500k", label: "Below ₦500,000 yearly", min: 0, max: 499999 },
  { value: "500k_1m", label: "₦500,000 – ₦999,999 yearly", min: 500000, max: 999999 },
  { value: "1m_2m", label: "₦1,000,000 – ₦1,999,999 yearly", min: 1000000, max: 1999999 },
  { value: "2m_5m", label: "₦2,000,000 – ₦4,999,999 yearly", min: 2000000, max: 4999999 },
  { value: "above_5m", label: "₦5,000,000 or more yearly", min: 5000000, max: 1000000000 },
] as const;

export const MOVE_IN_WINDOWS = [
  { value: "immediately", label: "Immediately" },
  { value: "within_1_month", label: "Within one month" },
  { value: "within_3_months", label: "Within three months" },
  { value: "flexible", label: "Flexible" },
] as const;

export const LEASE_DURATIONS = [
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "1 year" },
  { value: 24, label: "2 years or more" },
] as const;

export const PROPERTY_TYPES = [
  { value: "1-bedroom", label: "1 bedroom" },
  { value: "2-bedroom", label: "2 bedrooms" },
  { value: "3-bedroom", label: "3 bedrooms" },
  { value: "duplex", label: "Duplex" },
  { value: "studio", label: "Studio" },
  { value: "mini-flat", label: "Mini flat" },
  { value: "short-let", label: "Short let" },
] as const;

export const ACCOMMODATION_TYPES = [
  { value: "any", label: "Private or shared" },
  { value: "private", label: "Private accommodation" },
  { value: "shared", label: "Shared accommodation / roommate" },
] as const;

export const GENDER_OPTIONS = [
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "female", label: "Woman" },
  { value: "male", label: "Man" },
] as const;

export const YES_NO_OPTIONS = [
  { value: "false", label: "No" },
  { value: "true", label: "Yes" },
] as const;
