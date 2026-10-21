import { z } from "zod";
import { MOBILE_RE, normaliseMobile } from "@/lib/india";

export const WHOLESALE_QUANTITIES = [
  "Up to 50 pieces",
  "50–200 pieces",
  "200–500 pieces",
  "500+ pieces",
  "Not sure yet",
] as const;
export const WHOLESALE_CATEGORIES = [
  "Women's Wear",
  "Unisex Fashion",
  "Korean Fashion",
  "Imported & Surplus",
  "Mixed lots",
] as const;

/** Wholesale enquiry, validated identically in the form and on the server. */
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .transform(normaliseMobile)
    .pipe(z.string().regex(MOBILE_RE, "Enter a valid 10-digit mobile number")),
  business: z.string().trim().max(100).optional().default(""),
  quantity: z.enum(WHOLESALE_QUANTITIES, { message: "Choose an approximate quantity" }),
  categories: z.array(z.enum(WHOLESALE_CATEGORIES)).max(WHOLESALE_CATEGORIES.length).default([]),
  message: z.string().trim().max(1000, "Max 1000 characters").optional().default(""),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(0).optional().default(""),
});
export type EnquiryInput = z.input<typeof enquirySchema>;
