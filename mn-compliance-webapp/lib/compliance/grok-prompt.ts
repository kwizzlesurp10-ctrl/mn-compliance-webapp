import type { ComplianceResult } from "./types";

const BUSINESS_LABEL: Record<ComplianceResult["businessType"], string> = {
  restaurant: "Restaurant / Food Service",
  retail: "Retail Store",
  freelance: "Freelance / Consulting",
  ecommerce: "E-commerce / Online Store",
  salon: "Salon / Health & Wellness",
  contractor: "Home Services / Contractor",
  other: "Professional Services",
};

const LOCATION_LABEL: Record<ComplianceResult["location"], string> = {
  minneapolis: "Minneapolis (Hennepin County)",
  stpaul: "St. Paul (Ramsey County)",
  duluth: "Duluth (St. Louis County)",
  rochester: "Rochester (Olmsted County)",
  bloomington: "Bloomington",
  "other-metro": "Other Twin Cities Metro",
  "greater-mn": "Greater Minnesota (rural)",
};

export function buildGrokPrompt(r: ComplianceResult): string {
  const businessLabel = BUSINESS_LABEL[r.businessType] ?? r.businessType;
  const locationLabel = LOCATION_LABEL[r.location] ?? r.location;
  const itemsBlock = r.items
    .map((item) => `- ${item.name} (${item.status.toUpperCase()}) — ${item.expires} — ${item.cost}`)
    .join("\n");

  return `You are a senior Minnesota small business compliance attorney specializing in 2026 regulations.

**User Profile:**
- Business Type: ${businessLabel}
- Location: ${locationLabel}
- Number of Employees: ${r.employees}
- Annual Revenue: ${r.revenue}
- Quick-Check Compliance Score: ${r.score}/100

**Current Quick-Check Findings:**
Required Items:
${itemsBlock}

Estimated Annual Compliance Cost: $${r.annualCost}
Recommended Next Steps: ${r.actions.join("; ")}

**Your Task:**
Provide a comprehensive, actionable compliance analysis for this specific Minnesota business in 2026. Include:

1. **Critical Deadlines & Risks** — List the top 3-5 most urgent items with exact dates and potential penalties.
2. **2026 Regulatory Changes** — Highlight any new Minnesota laws or county rules taking effect in 2025-2026 that affect this business type and location.
3. **Cost Optimization** — Specific recommendations to reduce the estimated $${r.annualCost} annual cost (insurance, permits, filings).
4. **Action Plan** — A prioritized 30/60/90-day roadmap with exact forms, fees, and government portals (include direct links where possible: MN DOLI, Secretary of State, Revenue Dept, county health dept, etc.).
5. **Risk Assessment** — Overall risk level and any "red flags" based on the profile.
6. **Bonus Opportunities** — Any grants, tax credits, or compliance programs this business may qualify for in 2026.

Format the response as a clean, professional report with clear headings, bullet points, and bolded key actions. Keep it practical and concise (under 800 words).`;
}
