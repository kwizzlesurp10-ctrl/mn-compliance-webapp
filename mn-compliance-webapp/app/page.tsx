import { MnComplianceHome } from "@/components/mn-compliance-home";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950">
          Loading…
        </div>
      }
    >
      <MnComplianceHome />
    </Suspense>
  );
}
