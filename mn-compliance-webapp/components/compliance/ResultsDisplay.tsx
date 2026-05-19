import type { ComplianceResult } from '@/lib/compliance/types';

interface ResultsDisplayProps {
  result: ComplianceResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const passedCount = result.checklist.filter(item => item.passed).length;
  const totalCount = result.checklist.length;

  return (
    <div className="rounded-2xl border bg-white p-8 dark:bg-slate-950">
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Detailed Assessment</h3>
        <p className="text-sm text-slate-500 mt-1">{passedCount} of {totalCount} requirements met</p>
      </div>

      <div className="mb-8 rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-300">{result.summary}</p>
      </div>

      <div>
        <h4 className="mb-4 font-medium text-sm tracking-wider text-slate-500">COMPLIANCE CHECKLIST</h4>
        <ul className="space-y-3">
          {result.checklist.map((item, index) => (
            <li key={index} className="flex gap-3 rounded-lg border p-4">
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium ${item.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {item.passed ? '✓' : '!'}
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.requirement}</div>
                {item.details && <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.details}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {result.recommendations.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-4 font-medium text-sm tracking-wider text-slate-500">RECOMMENDATIONS</h4>
          <ul className="space-y-2 pl-1 text-sm">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-slate-700 dark:text-slate-300">
                <span className="text-blue-500 mt-1">→</span> {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
