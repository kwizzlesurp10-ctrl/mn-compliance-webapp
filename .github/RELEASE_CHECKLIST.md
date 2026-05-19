# Release Checklist

Use this checklist before deploying to production.

## Pre-Release

- [ ] All tests passing (`npm test`)
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors or warnings in production build
- [ ] All environment variables documented in `.env.example`

## Code Quality

- [ ] Major components have tests
- [ ] No `console.log` or debug statements left in code
- [ ] Sensitive data / API keys are not committed
- [ ] Dependencies are up to date (check Dependabot PRs)
- [ ] Accessibility check (run `axe` or Lighthouse)

## Deployment

- [ ] Preview deployment tested on Vercel
- [ ] All environment variables set in Vercel (Production + Preview)
- [ ] `NEXT_PUBLIC_SITE_URL` correctly configured
- [ ] Security headers verified in production
- [ ] Performance budget checked (Lighthouse score ≥ 90)

## Post-Deployment

- [ ] Smoke test critical flows on production
- [ ] Monitor error rate in Vercel Dashboard
- [ ] Verify analytics / logging is working
- [ ] Announce release (if applicable)

## Rollback Plan

- [ ] Know how to quickly revert via Vercel dashboard
- [ ] Previous stable commit tagged
