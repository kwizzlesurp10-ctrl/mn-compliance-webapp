# keef (home)

This repository’s root is `/home/keef`. The deployable **Next.js** app lives in:

**`mn-compliance-webapp/`** — see that folder’s [README](mn-compliance-webapp/README.md) for local dev, stack, and tests.

`.gitignore` is set so **only** `mn-compliance-webapp/`, `.github/`, `README.md`, and `.gitignore` are tracked at the top level (so the rest of your home directory is not pulled into Git by accident). If you add another top-level project, extend `.gitignore` with `!/other-folder/` and `!/other-folder/**`.

## GitHub

Initialize or connect the remote from the **repository root** (`/home/keef`):

```bash
cd /home/keef
git init
git add .
git commit -m "Add MN Compliance webapp in mn-compliance-webapp"
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

## Vercel

When importing the repo, set the **Root Directory** to `mn-compliance-webapp` (Project → Settings → General). Vercel will run `npm install` and `npm run build` there. Add `NEXT_PUBLIC_SITE_URL` in that project if you use the Open Graph `metadataBase` in the app.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint, test, and build with `working-directory: mn-compliance-webapp`.
