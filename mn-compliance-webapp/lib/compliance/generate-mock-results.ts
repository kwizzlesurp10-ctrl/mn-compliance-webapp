import type { ComplianceCheckInput } from "./schema";
import type { ComplianceResult, LicenseItem } from "./types";

function clampScore(n: number): number {
  return Math.max(58, Math.min(96, n));
}

export function generateMockResults(input: ComplianceCheckInput): ComplianceResult {
  const { businessType, location, employees, revenue } = input;
  let baseScore = 82;
  let items: LicenseItem[] = [];
  let cost = 1840;
  let actions: string[] = [];

  if (businessType === "restaurant") {
    baseScore = 71;
    items = [
      { name: "Food Handler's Permit (Hennepin County)", status: "active", expires: "Jun 2026", cost: "$85/yr" },
      { name: "Liquor License (if serving alcohol)", status: "missing", expires: "—", cost: "$2,400/yr" },
      { name: "Health Department Inspection", status: "active", expires: "Mar 2026", cost: "$320" },
      { name: "Sales Tax Permit (MN Dept of Revenue)", status: "active", expires: "Ongoing", cost: "$0" },
      { name: "Workers' Compensation Insurance", status: "active", expires: "Renewal due", cost: "$1,850/yr" },
    ];
    cost = 2840;
    actions = [
      "Renew health permit before March 15 — $320 late fee applies",
      "Apply for liquor license if adding bar service (8–12 week process)",
      "Update employee food safety training records",
    ];
  } else if (businessType === "retail") {
    baseScore = 79;
    items = [
      { name: "Retail Sales Tax Permit", status: "active", expires: "Ongoing", cost: "$0" },
      { name: "Business License (City of Minneapolis)", status: "active", expires: "Dec 2026", cost: "$150/yr" },
      { name: "Sign Permit (if exterior signage)", status: "missing", expires: "—", cost: "$75" },
      { name: "Data Breach Insurance (recommended)", status: "missing", expires: "—", cost: "$420/yr" },
    ];
    cost = 1640;
    actions = [
      "File 2025 sales tax reconciliation by Feb 15",
      "Review new 2026 MN consumer data privacy rules",
      "Consider adding cybersecurity coverage",
    ];
  } else if (businessType === "freelance") {
    baseScore = 91;
    items = [
      { name: "Business Registration (MN SOS)", status: "active", expires: "Ongoing", cost: "$0" },
      { name: "Self-Employment Tax Filing", status: "active", expires: "Apr 2026", cost: "Est. $3,200" },
      { name: "Professional Liability Insurance", status: "active", expires: "Jul 2026", cost: "$680/yr" },
    ];
    cost = 980;
    actions = [
      "Quarterly estimated tax payment due March 15",
      "Review new independent contractor classification rules (2026)",
    ];
  } else {
    baseScore = 84;
    items = [
      { name: "Business Entity Registration", status: "active", expires: "Ongoing", cost: "$0" },
      { name: "General Liability Insurance", status: "active", expires: "Renewal due", cost: "$920/yr" },
      {
        name: "Local Business License",
        status: location === "minneapolis" ? "active" : "missing",
        expires: location === "minneapolis" ? "Dec 2026" : "—",
        cost: location === "minneapolis" ? "$125/yr" : "$180/yr",
      },
    ];
    cost = 1420;
    actions = [
      "Confirm zoning compliance for home-based operations",
      "Review 2026 minimum wage increase impact",
    ];
  }

  if (employees > 10) baseScore -= 6;
  if (location === "minneapolis" || location === "stpaul") baseScore -= 3;

  return {
    score: clampScore(baseScore),
    items,
    annualCost: cost,
    actions,
    businessType,
    location,
    employees,
    revenue,
  };
}

export function protectionLevel(
  score: number,
  items: readonly { status: "active" | "missing" }[],
): number {
  const active = items.filter((i) => i.status === "active").length;
  return Math.min(98, Math.floor(score * 0.92 + active * 2));
}
