import { describe, expect, it } from "vitest";
import { generateMockResults, protectionLevel } from "./generate-mock-results";
import type { ComplianceCheckInput } from "./schema";

const base: ComplianceCheckInput = {
  businessType: "retail",
  location: "bloomington",
  employees: 3,
  revenue: "50k-150k",
};

describe("generateMockResults", () => {
  it("produces retail-specific items and score band", () => {
    const r = generateMockResults({ ...base, businessType: "retail" });
    expect(r.items.some((i) => i.name.includes("Sales Tax"))).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(58);
    expect(r.score).toBeLessThanOrEqual(96);
  });

  it("applies stricter local adjustment for minneapolis", () => {
    const mpls = generateMockResults({ ...base, businessType: "other", location: "minneapolis" });
    const rural = generateMockResults({ ...base, businessType: "other", location: "greater-mn" });
    expect(mpls.score).toBeLessThanOrEqual(rural.score);
  });

  it("lowers score for large employers in strict cities", () => {
    const small = generateMockResults({
      ...base,
      businessType: "restaurant",
      location: "minneapolis",
      employees: 2,
    });
    const big = generateMockResults({
      ...base,
      businessType: "restaurant",
      location: "minneapolis",
      employees: 50,
    });
    expect(big.score).toBeLessThan(small.score);
  });
});

describe("protectionLevel", () => {
  it("returns 98 max", () => {
    expect(
      protectionLevel(96, [
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
        { status: "active" },
      ]),
    ).toBe(98);
  });
});
