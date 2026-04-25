"use server";

import { generateMockResults } from "@/lib/compliance/generate-mock-results";
import { complianceCheckInputSchema } from "@/lib/compliance/schema";
import type { ComplianceResult } from "@/lib/compliance/types";
import { err, ok, type Result } from "@/lib/result";

export async function runComplianceCheckAction(
  input: unknown,
): Promise<Result<ComplianceResult, string>> {
  const parsed = complianceCheckInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(parsed.error.issues.map((i) => i.message).join("; "));
  }
  return ok(generateMockResults(parsed.data));
}
