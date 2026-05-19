'use client';

import { useState } from 'react';
import { complianceSchema } from '@/lib/compliance/schema';
import type { ComplianceInput } from '@/lib/compliance/types';

interface ComplianceFormProps {
  onSubmit: (data: ComplianceInput) => Promise<void>;
  isLoading: boolean;
}

export function ComplianceForm({ onSubmit, isLoading }: ComplianceFormProps) {
  const [formData, setFormData] = useState<Partial<ComplianceInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ComplianceInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = complianceSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-8 dark:bg-slate-950">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Business Name</label>
          <input
            type="text"
            className="w-full rounded-lg border px-4 py-2.5"
            onChange={(e) => handleChange('businessName', e.target.value)}
            required
          />
          {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Industry</label>
          <input
            type="text"
            className="w-full rounded-lg border px-4 py-2.5"
            onChange={(e) => handleChange('industry', e.target.value)}
            required
          />
          {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
        </div>
      </div>

      {/* Add remaining fields similarly for employeeCount, annualRevenue, checkboxes etc. */}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isLoading ? 'Running Analysis...' : 'Run Compliance Check'}
      </button>
    </form>
  );
}
