'use client';

import type { ComplianceResult } from '@/lib/compliance/types';

interface ProtectionRadarProps {
  result: ComplianceResult;
}

export function ProtectionRadar({ result }: ProtectionRadarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'non-compliant': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-8 shadow-sm dark:bg-slate-950">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Protection Radar</h3>
          <p className="text-sm text-slate-500">Compliance score by category</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold tabular-nums">{result.overallScore}</div>
          <div className="text-xs text-slate-500">OVERALL</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {result.categories.map((category, index) => (
          <div key={index} className="rounded-xl border p-5 transition hover:shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{category.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(category.status)} text-white`}>
                {category.status}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums">{category.score}</span>
              <span className="text-sm text-slate-500">/ 100</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full transition-all ${getStatusColor(category.status)}`} style={{ width: `${category.score}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{category.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
