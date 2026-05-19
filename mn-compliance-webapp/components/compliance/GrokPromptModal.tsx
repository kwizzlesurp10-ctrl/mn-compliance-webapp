'use client';

import { useState } from 'react';
import { generateGrokPrompt } from '@/lib/compliance/grok-prompt';
import type { ComplianceInput } from '@/lib/compliance/types';

interface GrokPromptModalProps {
  input: ComplianceInput;
  onClose: () => void;
}

export function GrokPromptModal({ input, onClose }: GrokPromptModalProps) {
  const [copied, setCopied] = useState(false);
  const prompt = generateGrokPrompt(input);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-slate-950">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Grok Prompt</h3>
          <button onClick={onClose} className="text-xl leading-none">×</button>
        </div>

        <pre className="max-h-[400px] overflow-auto rounded bg-slate-100 p-4 text-sm dark:bg-slate-900">
          {prompt}
        </pre>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="rounded border px-4 py-2 text-sm">Close</button>
          <button onClick={handleCopy} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
