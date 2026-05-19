# MN Compliance Webapp Monorepo

This repository contains a production-ready Next.js application for Minnesota small business compliance checks.

## Repository Structure

```
repo-root/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                       # CI: lint, type-check, test, build
│   ├── dependabot.yml
│   └── RELEASE_CHECKLIST.md
├── webapp/                              # The Next.js application (was mn-compliance-webapp/)
│   ├── app/
│   │   ├── actions/compliance.ts        # Server actions
│   │   ├── layout.tsx                   # Root layout + Vercel Analytics
│   │   └── page.tsx
│   ├── components/
│   │   ├── compliance/                  # Refactored, production-grade components
│   │   │   ├── ComplianceForm.tsx
│   │   │   ├── ProtectionRadar.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   ├── GrokPromptModal.tsx
│   │   │   └── index.ts
│   │   └── mn-compliance-home.tsx
│   ├── lib/compliance/
│   │   ├── schema.ts                    # Zod validation
│   │   ├── types.ts
│   │   ├── grok-prompt.ts
│   │   └── generate-mock-results.ts
│   ├── public/
│   ├── next.config.ts                   # outputFileTracingRoot for monorepo
│   ├── package.json
│   └── README.md                        # App-specific documentation
├── README.md                            # This file
└── .gitignore
```

## Why This Structure?

- The Next.js app lives in `webapp/` so the repository root can contain shared CI, GitHub configuration, and potentially other tools in the future.
- This is a common **monorepo-lite** pattern for Vercel + GitHub projects.
- We chose `webapp/` (instead of repeating the repo name) to avoid confusing long paths in CI runners and keep things clear.

## Local Development

```bash
cd webapp
npm install
npm run dev
```

Open http://localhost:3000

## Deployment (Vercel)

1. In Vercel, import this repository.
2. Set **Root Directory** to: `webapp`
3. Vercel will automatically detect Next.js and run `npm install` + `npm run build` inside that folder.
4. (Recommended) Add environment variable:
   - `NEXT_PUBLIC_SITE_URL` = your production URL

## CI / GitHub Actions

The workflow (`.github/workflows/ci.yml`) runs on every push and PR:

- Installs dependencies
- Runs lint + TypeScript check
- Runs Vitest tests
- Builds the production bundle

All steps use `working-directory: webapp`.

## Production Readiness

This repo includes:

- Dependabot configuration
- Release checklist
- Vercel Analytics + Speed Insights
- Clean component architecture (refactored from a 649-line file)
- Zod validation + server actions
- Type-safe, tested codebase

See `webapp/README.md` for full app documentation.

## Notes

- `.gitignore` is configured so only the relevant folders are tracked.
- If you add another top-level project later, extend `.gitignore` accordingly.