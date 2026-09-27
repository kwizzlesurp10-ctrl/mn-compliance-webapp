# 📊 MN Compliance Quick-Check App

This directory contains the Next.js frontend and server actions for the **Minnesota Small Business Compliance Quick-Check** application. 

It serves as the production iteration of our initial compliance prototype, featuring interactive mock scoring, a dynamic "Protection Radar" UI, and a dedicated **Copy Grok prompt** integration for generating tailored legal/compliance queries.

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS (Optimized for production, no CDNs)
- **Validation:** Zod (Form payloads & Server Actions)
- **Testing:** Vitest (Unit tests located in `lib/compliance/*`)

---

## 💻 Local Development

Because this application lives inside a monorepo structure, ensure your terminal is in the `webapp/` directory before running Node commands.

**From the repository root:**
```bash
cd webapp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **💡 Pro-tip:** Append `?init=1` to the URL (e.g., `http://localhost:3000/?init=1`) to automatically run a demonstration compliance check without manually filling out the form.

---

## 📜 Available Scripts

| Command         | Description                                      |
| :-------------- | :----------------------------------------------- |
| `npm run dev`   | Starts the development server using Turbopack.   |
| `npm run build` | Creates an optimized production build.           |
| `npm run start` | Starts a local server serving the production build. |
| `npm run test`  | Runs the Vitest unit test suite.                 |
| `npm run lint`  | Runs ESLint to check for code quality issues.    |

---

## 🏗 Architecture & Data Flow

1. **Client UI (`components/compliance/`)**: Users interact with `ComplianceForm.tsx`.
2. **Validation (`lib/compliance/schema.ts`)**: Inputs are strictly validated client-side and server-side using Zod.
3. **Server Actions (`app/actions/compliance.ts`)**: Safely handles form submissions securely on the server.
4. **Mock Engine (`lib/compliance/generate-mock-results.ts`)**: Evaluates the payload to generate compliance scores, categorized checklists, and radar metrics.
5. **Display (`ResultsDisplay.tsx` & `ProtectionRadar.tsx`)**: Renders the breakdown. Users can then copy an AI-ready prompt via `GrokPromptModal.tsx`.

---

## ⚠️ Important Legal Notice

The output, scores, and checklists provided by this application are **demonstration mocks**. They do not represent official compliance status and **are not legal advice**. 

Always confirm actual requirements and regulations with the **MN Department of Labor and Industry (DOLI)**, the **Secretary of State**, the **Department of Revenue**, and other relevant local, state, or federal agencies.
