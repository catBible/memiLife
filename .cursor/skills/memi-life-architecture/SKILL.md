---
name: memi-life-architecture
description: >-
  Describes the MemiLife full stack: Next.js dashboard (memiLife), Spring Boot API
  (memi-backend sibling repo), Postgres/Flyway schema for supplements, env vars,
  proxy route /api/supplements/all, dose_time noon/night rules, and local dev
  (npm run local, MEMI_BACKEND_URL). Use when working on memiLife, memi-backend,
  supplements, dashboard, Flyway migrations, Railway DATABASE_URL, CORS, or
  integrating front and back.
---

# MemiLife architecture (project skill)

## Always read first

For full directory trees, API tables, DB columns, and troubleshooting, open **[docs/PROJECT-ECOSYSTEM.md](../../../docs/PROJECT-ECOSYSTEM.md)** (repo root: `docs/PROJECT-ECOSYSTEM.md`).

## Non-negotiable facts (short)

1. **Two repositories:** This repo is **memiLife** (Next.js). **memi-backend** is a separate clone (default sibling folder `../memi-backend` for `npm run local`).
2. **Browser never calls Spring directly** for the dashboard payload: the client fetches **`GET /api/supplements/all`** on the Next origin; the Route Handler proxies to **`GET {backendOrigin}/api/supplements/all`** (array of supplements).
3. **Stack split (noon vs night)** is computed in **`lib/services/dashboard.ts`** from **`dose_time` / `doseTime` only** (HH:mm): 05:00–16:59 → noon; 17:00–04:59 → night; missing/invalid → noon. **`taken_time_slot` is not used for bucketing.**
4. **Backend base URL for the Next server** uses only **origin** (scheme + host + port). Paths on `MEMI_BACKEND_URL` are stripped — append paths in code, not in env.
5. **Database:** Flyway migrations live in memi-backend at `src/main/resources/db/migration/`. Production uses **Postgres** (`DATABASE_URL` mapped by `DatabaseUrlEnvironmentPostProcessor`). Profile **`h2`** uses in-memory H2 with Flyway disabled and JPA `update` + dev seed.

## Where to change what

| Goal | Primary location |
|------|------------------|
| UI for supplement stacks | `components/dashboard/supplement-stack.tsx` |
| Noon/night grouping or API mapping | `lib/services/dashboard.ts` |
| Proxy / error 502 | `app/api/supplements/all/route.ts` |
| Spring REST paths / DTOs | `memi-backend` … `supplement/api`, `dto`, `service` |
| Table/columns | Flyway `V*.sql` + `entity/Supplement.java` |

## Commands (memiLife)

- `npm run dev` — Next only (backend must already run on 8080 or set `MEMI_BACKEND_URL`).
- `npm run local` — Starts backend via `mvnw spring-boot:run` in a new window, waits 5s, then `npm run dev`. Override backend path with **`MEMI_BACKEND_DIR`**.

After editing migrations or entity fields, align **DTO mapper**, **integration tests**, and **dashboard.ts** field fallbacks (camelCase + snake_case).
