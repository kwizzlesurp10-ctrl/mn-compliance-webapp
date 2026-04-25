import { describe, expect, it } from "vitest";
import { buildGrokPrompt } from "./grok-prompt";
import type { ComplianceResult } from "./types";

const sample: ComplianceResult = {
  score: 78,
  annualCost: 2000,
  businessType: "retail",
  location: "minneapolis",
  employees: 3,
  revenue: "50k-150k",
  items: [
    { name: "Test Permit", status: "active", expires: "2026", cost: "$0" },
  ],
  actions: ["Do something"],
};

describe("buildGrokPrompt", () => {
  it("includes score and key sections", () => {
    const p = buildGrokPrompt(sample);
    expect(p).toContain("78/100");
    expect(p).toContain("Retail Store");
    expect(p).toContain("Minneapolis (Hennepin County)");
    expect(p).toContain("Test Permit");
  });
});
