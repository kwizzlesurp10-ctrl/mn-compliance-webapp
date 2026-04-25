export type BusinessType =
  | "restaurant"
  | "retail"
  | "freelance"
  | "ecommerce"
  | "salon"
  | "contractor"
  | "other";

export type LocationKey =
  | "minneapolis"
  | "stpaul"
  | "duluth"
  | "rochester"
  | "bloomington"
  | "other-metro"
  | "greater-mn";

export type RevenueBand =
  | "under-50k"
  | "50k-150k"
  | "150k-500k"
  | "500k-2m"
  | "over-2m";

export type LicenseStatus = "active" | "missing";

export interface LicenseItem {
  name: string;
  status: LicenseStatus;
  expires: string;
  cost: string;
}

export interface ComplianceResult {
  score: number;
  items: LicenseItem[];
  annualCost: number;
  actions: string[];
  businessType: BusinessType;
  location: LocationKey;
  employees: number;
  revenue: RevenueBand;
}
