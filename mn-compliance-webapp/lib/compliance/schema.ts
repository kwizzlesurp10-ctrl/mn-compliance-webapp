import { z } from "zod";

const businessTypeSchema = z.enum([
  "restaurant",
  "retail",
  "freelance",
  "ecommerce",
  "salon",
  "contractor",
  "other",
]);

const locationSchema = z.enum([
  "minneapolis",
  "stpaul",
  "duluth",
  "rochester",
  "bloomington",
  "other-metro",
  "greater-mn",
]);

const revenueSchema = z.enum([
  "under-50k",
  "50k-150k",
  "150k-500k",
  "500k-2m",
  "over-2m",
]);

export const complianceCheckInputSchema = z.object({
  businessType: businessTypeSchema,
  location: locationSchema,
  employees: z.coerce.number().int().min(1).max(500),
  revenue: revenueSchema,
});

export type ComplianceCheckInput = z.infer<typeof complianceCheckInputSchema>;
