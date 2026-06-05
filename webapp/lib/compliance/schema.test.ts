import { describe, expect, it } from "vitest";
import { complianceCheckInputSchema } from "./schema";

describe("complianceCheckInputSchema", () => {
  it("accepts valid payload", () => {
    const r = complianceCheckInputSchema.safeParse({
      businessType: "restaurant",
      location: "minneapolis",
      employees: 7,
      revenue: "50k-150k",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty businessType", () => {
    const r = complianceCheckInputSchema.safeParse({
      businessType: "",
      location: "minneapolis",
      employees: 1,
      revenue: "50k-150k",
    });
    expect(r.success).toBe(false);
  });

  it("rejects out-of-range employees", () => {
    const r = complianceCheckInputSchema.safeParse({
      businessType: "retail",
      location: "stpaul",
      employees: 0,
      revenue: "50k-150k",
    });
    expect(r.success).toBe(false);
  });
});
