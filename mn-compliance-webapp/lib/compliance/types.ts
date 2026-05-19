export interface ComplianceInput {
  businessName: string;
  industry: string;
  employeeCount: number;
  annualRevenue: number;
  hasEmployeesInMN: boolean;
  offersBenefits: boolean;
  handlesPersonalData: boolean;
  sellsPhysicalGoods: boolean;
}

export interface ComplianceCategory {
  name: string;
  score: number;
  status: 'compliant' | 'warning' | 'non-compliant';
  notes: string;
}

export interface ComplianceResult {
  overallScore: number;
  summary: string;
  categories: ComplianceCategory[];
  checklist: Array<{
    requirement: string;
    passed: boolean;
    details?: string;
  }>;
  recommendations: string[];
}
