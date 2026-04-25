"use client";

import {
  ArrowRight,
  Moon,
  Shield,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";

type SiteHeaderProps = {
  onLogin: () => void;
  onStartCheck: () => void;
};

export function SiteHeader({ onLogin, onStartCheck }: SiteHeaderProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark(): void {
    document.documentElement.classList.toggle("dark");
    setDark(document.documentElement.classList.contains("dark"));
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0A2540] text-white">
            <Shield className="h-6 w-6" aria-hidden />
          </div>
          <div className="font-display text-2xl font-semibold tracking-tighter">
            <span className="text-slate-900 dark:text-slate-100">MN Compliance</span>{" "}
            <span className="text-[#0A2540] dark:text-blue-300">Quick-Check</span>
          </div>
        </div>

        <div className="hidden items-center gap-x-8 text-sm md:flex">
          <a
            href="#how-it-works"
            className="font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Pricing
          </a>
          <a
            href="#resources"
            className="font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Resources
          </a>

          <div className="flex items-center gap-x-3">
            <button
              type="button"
              onClick={toggleDark}
              className="rounded-full px-3 py-2 text-slate-500 transition-all hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="rounded-3xl px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={onStartCheck}
              className="flex items-center gap-x-2 rounded-3xl bg-[#0A2540] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1E3A8A]"
            >
              <span>Start free check</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={toggleDark} className="p-2 text-slate-500" aria-label="Toggle theme">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onStartCheck}
            className="flex items-center gap-1 rounded-3xl bg-[#0A2540] px-4 py-2 text-sm font-semibold text-white"
          >
            Start <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
