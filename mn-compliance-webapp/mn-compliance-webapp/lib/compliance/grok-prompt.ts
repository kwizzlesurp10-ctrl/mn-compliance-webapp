import type { ComplianceInput } from './types';

export function generateGrokPrompt(input: ComplianceInput): string {
  return `You are an expert on Minnesota business regulations.

Please analyze this business for compliance:

Business Name: ${input.businessName}
Industry: ${input.industry}
Employee Count: ${input.employeeCount}
Annual Revenue: ${input.annualRevenue}
Has employees in MN: ${input.hasEmployeesInMN}
Offers benefits: ${input.offersBenefits}
Handles personal data: ${input.handlesPersonalData}
Sells physical goods: ${input.sellsPhysicalGoods}

Provide a compliance assessment including key requirements for Minnesota.`;
}
