"use client";

import { runComplianceCheckAction } from "@/app/actions/compliance";
import { buildGrokPrompt } from "@/lib/compliance/grok-prompt";
import { protectionLevel as computeProtection } from "@/lib/compliance/generate-mock-results";
import type { ComplianceCheckInput } from "@/lib/compliance/schema";
import type { ComplianceResult } from "@/lib/compliance/types";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCheck,
  Loader2,
  Play,
  Radar,
  Satellite,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SiteHeader } from "./site-header";

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-rose-600";
}

function protectionColor(level: number): string {
  if (level >= 85) return "text-emerald-400";
  if (level >= 70) return "text-amber-400";
  return "text-rose-400";
}

function RadarDots({
  missing,
  active,
}: {
  missing: number;
  active: number;
}) {
  const dots = useMemo(() => {
    const list: { left: string; top: string; bg: string; shadow: string }[] = [];
    const m = Math.min(missing, 5);
    for (let i = 0; i < m; i += 1) {
      const angle = i * 72 + Math.random() * 20;
      const distance = 45 + Math.random() * 35;
      list.push({
        left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * distance}px)`,
        top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * distance}px)`,
        bg: "#f87171",
        shadow: "0 0 8px #f87171",
      });
    }
    const a = Math.min(active, 4);
    for (let i = 0; i < a; i += 1) {
      const angle = i * 90 + 30 + Math.random() * 15;
      const distance = 55 + Math.random() * 25;
      list.push({
        left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * distance}px)`,
        top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * distance}px)`,
        bg: "#10b981",
        shadow: "0 0 8px #10b981",
      });
    }
    return list;
  }, [missing, active]);

  return (
    <>
      {dots.map((d, idx) => (
        <div
          key={idx}
          className="radar-dot"
          style={{
            left: d.left,
            top: d.top,
            background: d.bg,
            boxShadow: d.shadow,
          }}
        />
      ))}
    </>
  );
}

export function MnComplianceHome() {
  const [showTool, setShowTool] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [businessType, setBusinessType] = useState<ComplianceCheckInput["businessType"] | "">("");
  const [location, setLocation] = useState<ComplianceCheckInput["location"] | "">("");
  const [employees, setEmployees] = useState(3);
  const [revenue, setRevenue] = useState<ComplianceCheckInput["revenue"]>("50k-150k");
  const searchParams = useSearchParams();
  const initAutoRan = useRef(false);

  const startFreeCheck = useCallback((): void => {
    setShowTool(true);
    setShowResults(false);
    setFormError(null);
    window.setTimeout(() => {
      setBusinessType("restaurant");
      setLocation("minneapolis");
      setEmployees(7);
    }, 400);
    requestAnimationFrame(() => {
      document.getElementById("tool-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  useEffect(() => {
    const shouldInit =
      searchParams.get("init") === "1" || searchParams.get("init") === "true";
    if (!shouldInit || initAutoRan.current) return;
    initAutoRan.current = true;
    setShowTool(true);
    setShowResults(false);
    setFormError(null);
    setBusinessType("restaurant");
    setLocation("minneapolis");
    setEmployees(7);
    setRevenue("50k-150k");
    const run = window.setTimeout(() => {
      const payload: ComplianceCheckInput = {
        businessType: "restaurant",
        location: "minneapolis",
        employees: 7,
        revenue: "50k-150k",
      };
      startTransition(() => {
        void runComplianceCheckAction(payload).then((r) => {
          if (r.ok) {
            setResult(r.value);
            setShowTool(false);
            setShowResults(true);
            setFormError(null);
            requestAnimationFrame(() => {
              document.getElementById("results-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          } else {
            setFormError(r.error);
          }
        });
      });
    }, 500);
    return () => clearTimeout(run);
  }, [searchParams, startTransition]);

  function onRunCheck(e: React.FormEvent): void {
    e.preventDefault();
    if (!businessType || !location) {
      setFormError("Please select your business type and location to continue.");
      return;
    }
    setFormError(null);
    const payload: ComplianceCheckInput = {
      businessType,
      location,
      employees,
      revenue,
    };
    startTransition(() => {
      void runComplianceCheckAction(payload).then((r) => {
        if (r.ok) {
          setResult(r.value);
          setShowTool(false);
          setShowResults(true);
        } else {
          setFormError(r.error);
        }
      });
    });
  }

  const protection = result ? computeProtection(result.score, result.items) : 0;

  async function copyPrompt(): Promise<void> {
    if (!result) return;
    const text = buildGrokPrompt(result);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy this prompt:", text);
    }
  }

  return (
    <>
      <SiteHeader onLogin={() => setShowLogin(true)} onStartCheck={startFreeCheck} />

      <div className="mx-auto max-w-5xl px-6 pb-12 pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-x-2 rounded-3xl bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCheck className="h-4 w-4" aria-hidden />
            <span>Updated for 2026 Minnesota regulations</span>
          </div>

          <h1 className="font-display text-4xl font-semibold leading-none tracking-tighter sm:text-5xl md:text-6xl">
            Know your
            <br />
            compliance status
            <br />
            in 60 seconds.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-xl text-slate-600 dark:text-slate-300">
            Free instant checklist for Minnesota small businesses.{" "}
            <span className="font-semibold text-[#0A2540] dark:text-blue-300">Grok-powered AI</span>{" "}
            delivers full personalized reports in seconds.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={startFreeCheck}
              className="group flex items-center justify-center gap-x-3 rounded-3xl bg-[#0A2540] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#0A2540]/20 transition-all hover:bg-[#1E3A8A] active:scale-[0.99]"
            >
              <span>Run free compliance check</span>
              <ArrowRight className="h-5 w-5 transition group-active:translate-x-0.5" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-x-2 rounded-3xl border border-slate-300 px-6 py-4 text-lg font-semibold text-slate-700 transition-all hover:bg-white dark:border-slate-600 dark:text-slate-200"
            >
              <Play className="h-4 w-4" />
              <span>Watch 45s demo</span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-x-1.5">
              <Users className="h-4 w-4 text-emerald-500" />
              <span>4,872 businesses checked this month</span>
            </div>
            <div className="flex items-center gap-x-1.5">
              <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
              <span>4.9/5 from 312 reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          <div className="text-xs font-semibold tracking-[1px] text-slate-500">TRUSTED BY MINNESOTA BUSINESSES</div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 text-sm">
            <span className="font-semibold text-slate-400">Minneapolis Chamber</span>
            <span className="font-semibold text-slate-400">MN Small Business Alliance</span>
            <span className="font-semibold text-slate-400">Twin Cities Restaurant Group</span>
          </div>
        </div>
      </div>

      {showTool && (
        <div id="tool-section" className="mx-auto max-w-4xl px-6 pb-20">
          <form
            onSubmit={onRunCheck}
            className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl dark:border-slate-700"
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 px-8 py-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <div>
                <h2 className="font-display text-2xl font-semibold">MN Compliance Quick-Check</h2>
                <p className="mt-0.5 text-sm text-slate-500">Takes less than 60 seconds • Instant results</p>
              </div>
              <div className="inline-flex w-fit items-center gap-x-1.5 rounded-2xl bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-700">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>2026 regulations loaded</span>
              </div>
            </div>
            <div className="p-8">
              {formError && (
                <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">
                  {formError}
                </p>
              )}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="business-type" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Business Type
                  </label>
                  <select
                    id="business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as typeof businessType)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:border-slate-600 dark:bg-slate-800"
                    required
                  >
                    <option value="">Select your business type...</option>
                    <option value="restaurant">Restaurant / Food Service</option>
                    <option value="retail">Retail Store</option>
                    <option value="freelance">Freelance / Consulting</option>
                    <option value="ecommerce">E-commerce / Online Store</option>
                    <option value="salon">Salon / Health &amp; Wellness</option>
                    <option value="contractor">Home Services / Contractor</option>
                    <option value="other">Other / Professional Services</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Primary Location
                  </label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as typeof location)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:border-slate-600 dark:bg-slate-800"
                    required
                  >
                    <option value="">Select city or county...</option>
                    <option value="minneapolis">Minneapolis (Hennepin County)</option>
                    <option value="stpaul">St. Paul (Ramsey County)</option>
                    <option value="duluth">Duluth (St. Louis County)</option>
                    <option value="rochester">Rochester (Olmsted County)</option>
                    <option value="bloomington">Bloomington</option>
                    <option value="other-metro">Other Twin Cities Metro</option>
                    <option value="greater-mn">Greater Minnesota (rural)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="employees" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Number of Employees
                  </label>
                  <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-600">
                    <input
                      id="employees"
                      type="number"
                      min={1}
                      max={500}
                      value={employees}
                      onChange={(e) => setEmployees(Number.parseInt(e.target.value, 10) || 1)}
                      className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm focus:outline-none focus:ring-0"
                    />
                    <div className="border-l border-slate-200 px-4 text-sm text-slate-500 dark:border-slate-600">employees</div>
                  </div>
                </div>
                <div>
                  <label htmlFor="revenue" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Annual Revenue (optional)
                  </label>
                  <select
                    id="revenue"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value as ComplianceCheckInput["revenue"])}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] dark:border-slate-600 dark:bg-slate-800"
                  >
                    <option value="under-50k">Under $50,000</option>
                    <option value="50k-150k">$50,000 – $150,000</option>
                    <option value="150k-500k">$150,000 – $500,000</option>
                    <option value="500k-2m">$500,000 – $2M</option>
                    <option value="over-2m">Over $2M</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-x-3 rounded-3xl bg-gradient-to-r from-[#0A2540] to-[#1E3A8A] px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.985] disabled:opacity-60"
                >
                  {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Run Quick-Check</span>}
                  <Search className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-slate-500">Your data is never stored. This is a free demo • Premium unlocks full AI report</p>
            </div>
          </form>
        </div>
      )}

      {showResults && result && (
        <div id="results-top" className="mx-auto max-w-4xl px-6 pb-20">
          <div className="result-enter overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl dark:border-slate-700">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-emerald-50 px-8 py-6 sm:flex-row sm:items-center dark:border-slate-700 dark:bg-emerald-950/40">
              <div className="flex items-center gap-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                  <Check className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-xl font-semibold">Compliance Check Complete</div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-300">Results generated • January 2026 regulations</div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs font-medium text-emerald-600">OVERALL SCORE</div>
                <div className={`font-display text-5xl font-bold ${scoreColor(result.score)}`}>{result.score}</div>
                <div className="-mt-1 text-xs text-emerald-600">/ 100</div>
              </div>
            </div>

            <div className="px-8 py-6 text-white dark:bg-slate-950">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-x-2">
                    <Satellite className="h-5 w-5 text-emerald-400" />
                    <span className="font-semibold">Protection Radar</span>
                  </div>
                  <div className="text-xs text-emerald-400/80">Live compliance shield • Activated</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className={`font-display text-3xl font-bold ${protectionColor(protection)}`}>{protection}%</div>
                  <div className="-mt-1 text-[10px] text-emerald-400/80">PROTECTION LEVEL</div>
                </div>
              </div>
              <div className="relative mx-auto my-2 h-48 w-48">
                <div className="absolute inset-0 rounded-full border border-emerald-500/30" />
                <div className="absolute inset-[12px] rounded-full border border-emerald-500/40" />
                <div className="absolute inset-[24px] rounded-full border border-emerald-500/50" />
                <div className="absolute inset-[36px] rounded-full border border-emerald-500/60" />
                <div className="radar-animate absolute left-1/2 top-1/2 h-0.5 w-1/2 origin-left -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
                <div className="absolute inset-0">
                  <RadarDots
                    missing={result.items.filter((i) => i.status === "missing").length}
                    active={result.items.filter((i) => i.status === "active").length}
                  />
                </div>
              </div>
              <p className="mt-1 text-center text-xs text-emerald-400/80">Your business is now shielded • 24/7 monitoring active</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Required licenses &amp; permits</h4>
                  <div className="space-y-3">
                    {result.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start gap-x-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-700"
                      >
                        <div
                          className={
                            item.status === "active" ? "mt-0.5 text-emerald-500" : "mt-0.5 text-rose-500"
                          }
                        >
                          {item.status === "active" ? <Check className="h-4 w-4" /> : <span className="text-lg">!</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                            <span>{item.expires}</span>
                            <span className="rounded bg-slate-100 px-1.5 py-px font-mono text-[10px] dark:bg-slate-800">{item.cost}</span>
                          </div>
                        </div>
                        <span
                          className={
                            item.status === "active"
                              ? "whitespace-nowrap rounded-2xl bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
                              : "whitespace-nowrap rounded-2xl bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
                          }
                        >
                          {item.status === "active" ? "ACTIVE" : "ACTION NEEDED"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/50 lg:col-span-2">
                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Key metrics</h4>
                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="mb-1 text-slate-600">Estimated annual compliance cost</div>
                      <div className="font-display text-3xl font-semibold">${result.annualCost.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">Includes licenses, filings, and insurance minimums</div>
                    </div>
                    <div>
                      <div className="mb-1 text-slate-600">Next renewal deadline</div>
                      <div className="font-semibold">March 15, 2026</div>
                      <div className="text-xs text-rose-600">14 days away — action recommended</div>
                    </div>
                    <div>
                      <div className="mb-1 text-slate-600">Risk level</div>
                      <div className="inline-flex items-center gap-x-2 rounded-2xl bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                        <Radar className="h-4 w-4" />
                        <span>Medium — review flagged items</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">Recommended next steps</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {result.actions.map((action, index) => (
                    <div key={action} className="flex items-start gap-x-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-snug dark:border-slate-600">
                      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl bg-[#0A2540] text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#0A2540] to-[#1E3A8A] p-7 text-white">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-x-1.5 rounded-2xl bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        POWERED BY GROK
                      </div>
                      <span className="text-lg font-semibold">Real AI compliance analysis</span>
                    </div>
                    <p className="max-w-md text-sm text-white/80">
                      Get a personalized 800+ word report with 2026-oriented framing, cost ideas, and direct government link prompts — copy the prompt
                      and paste it into Grok.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyPrompt()}
                    className="inline-flex flex-shrink-0 items-center gap-x-2 whitespace-nowrap rounded-3xl bg-white px-8 py-3.5 text-sm font-semibold text-[#0A2540] shadow-lg transition-all hover:bg-white/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    Copy Grok prompt
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 border-t border-white/20 pt-4 text-xs text-white/60">
                  <div>Works with a free Grok account</div>
                  <div>Paste into grok.x.ai</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-between gap-2 border-t border-slate-100 bg-slate-50 px-8 py-4 text-xs text-slate-500 sm:flex-row sm:items-center dark:border-slate-700">
              <div>Disclaimer: This is a demo tool. Always verify with official MN government sources.</div>
              <button
                type="button"
                onClick={() => {
                  setShowResults(false);
                  setShowTool(true);
                  setResult(null);
                }}
                className="font-medium text-[#0A2540] hover:underline dark:text-blue-300"
              >
                Run another check →
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="how-it-works" className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Built for busy Minnesota owners</h2>
          <p className="mx-auto mt-3 max-w-md text-xl text-slate-600 dark:text-slate-300">No legal degree required. Just answer a few questions.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { title: "AI-ready workflow", body: "Export a detailed Grok prompt with your business profile in one click — then refine with a licensed advisor if needed." },
            { title: "Instant + transparent", body: "Mock scores help you think about what to double-check. Replace with your own data sources as you grow." },
            { title: "Your data stays local", body: "This demo does not persist form answers to a server database. A production build can add auth and history under your control." },
          ].map((c) => (
            <div key={c.title} className="rounded-3xl border border-slate-100 bg-white p-7 dark:border-slate-700">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                <CheckCheck className="h-6 w-6" />
              </div>
              <div className="mb-2 text-xl font-semibold">{c.title}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="pricing" className="mx-auto max-w-3xl px-6 pb-20 text-center text-sm text-slate-500">
        <h2 className="font-display mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">Pricing</h2>
        <p>Prototype pricing cards from the static mock are omitted here — add Stripe + Supabase when you are ready to bill.</p>
      </div>

      <div id="resources" className="mx-auto max-w-3xl px-6 pb-20 text-center text-sm text-slate-500">
        <h2 className="font-display mb-4 text-2xl font-semibold text-slate-800 dark:text-slate-200">Resources</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <a className="font-medium text-[#0A2540] hover:underline dark:text-blue-300" href="https://www.dli.mn.gov" target="_blank" rel="noopener noreferrer">
            Minnesota DOLI
          </a>
          <a
            className="font-medium text-[#0A2540] hover:underline dark:text-blue-300"
            href="https://www.sos.state.mn.us"
            target="_blank"
            rel="noopener noreferrer"
          >
            Secretary of State
          </a>
          <a
            className="font-medium text-[#0A2540] hover:underline dark:text-blue-300"
            href="https://www.revenue.state.mn.us"
            target="_blank"
            rel="noopener noreferrer"
          >
            Revenue Department
          </a>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-slate-500">
          <p>© 2026 MN Compliance Quick-Check • Not an official government tool</p>
          <p className="mt-1 text-xs">Deploy to Vercel and connect a GitHub repo for CI/CD.</p>
        </div>
      </footer>

      {showLogin && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal
          onClick={() => setShowLogin(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-8 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <p className="font-display text-2xl font-semibold">Welcome back</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Demo only — connect Auth.js or Clerk in production.</p>
            </div>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="you@business.com"
                className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="w-full rounded-3xl bg-[#0A2540] py-3.5 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
