export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/** Indian mobile number: 10 digits starting 6–9 (without +91). */
export const MOBILE_RE = /^[6-9]\d{9}$/;
export const PIN_RE = /^[1-9]\d{5}$/;

/** Accepts "+91 98765 43210", "098765-43210" etc. and returns the 10-digit form. */
export const normaliseMobile = (v: string) =>
  v.replace(/\D/g, "").replace(/^(?:91|0)(?=[6-9]\d{9}$)/, "");
