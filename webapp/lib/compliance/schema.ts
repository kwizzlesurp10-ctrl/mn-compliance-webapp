import { z } from 'zod';

export const complianceSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  industry: z.string().min(2, 'Industry is required'),
  employeeCount: z.number().min(0).max(10000),
  annualRevenue: z.number().min(0),
  hasEmployeesInMN: z.boolean(),
  offersBenefits: z.boolean(),
  handlesPersonalData: z.boolean(),
  sellsPhysicalGoods: z.boolean(),
});

export type ComplianceInput = z.infer<typeof complianceSchema>;
