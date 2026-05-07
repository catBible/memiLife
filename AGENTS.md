# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**memiLife** is a single Next.js 16 (App Router) PWA — a personal life dashboard for health, finance, and work tracking. It is NOT a monorepo.

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| Next.js dev server | `pnpm dev` | Runs on `http://localhost:3000` |
| Spring Boot backend (external) | Not in this repo | Expected at `http://127.0.0.1:8080`; set `MEMI_BACKEND_URL` in `.env.local` to override. Dashboard degrades gracefully without it (fasting tracker, financial progress, resume card all use local data). |

### Key commands

- **Dev**: `pnpm dev` (uses webpack mode)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` — requires `eslint` which is **not** listed in `devDependencies`; this script will fail until the repo adds it.

### Non-obvious caveats

- The project has both `package-lock.json` and `pnpm-lock.yaml`. Use **pnpm** (matching the lockfile that is more current).
- `pnpm install` will warn about ignored build scripts for `sharp`. This is cosmetic and does not affect functionality since `images.unoptimized: true` in `next.config.mjs`.
- The supplement stacks (noon/night cards) require the Spring backend to return data. Without it, the UI shows loading skeletons and an error banner — this is expected and not a bug.
- PWA service worker is disabled in development mode (`next-pwa` config).
- `tsconfig.json` has `"target": "ES6"` and path alias `@/*` → `./*`.
- No automated test framework is configured in this repo (no jest, vitest, or playwright).
