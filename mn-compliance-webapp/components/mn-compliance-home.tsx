'use client';

import { useState } from 'react';
import { runComplianceCheck } from '@/app/actions/compliance';
import {
  ComplianceForm,
  ProtectionRadar,
  ResultsDisplay,
  GrokPromptModal,
} from './compliance';
import type { ComplianceInput, ComplianceResult } from '@/lib/compliance/types';

export function MnComplianceHome() {
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [input, setInput] = useState<ComplianceInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleSubmit = async (data: ComplianceInput) => {
    setIsLoading(true);
    setError(null);
    setInput(data);

    const response = await runComplianceCheck(data);

    if (response.success) {
      setResult(response.result);
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold">MN Compliance Quick-Check</h1>
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          Professional compliance assessment for Minnesota small businesses
        </p>
      </header>

      <ComplianceForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {result && input && (
        <div className="mt-8 space-y-8">
          <ProtectionRadar result={result} />
          <ResultsDisplay result={result} />

          <div className="flex justify-end">
            <button
              onClick={() => setShowPromptModal(true)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Copy Grok Prompt
            </button>
          </div>
        </div>
      )}

      {showPromptModal && input && (
        <GrokPromptModal input={input} onClose={() => setShowPromptModal(false)} />
      )}
    </div>
  );
}
