---
name: memi-life-architecture
description: >-
  Describes the MemiLife full stack: Next.js (memiLife) dashboard + /tasks Memi Task UI,
  Spring Boot API (memi-backend), Postgres/Flyway (supplements + tasks), env vars
  (MEMI_BACKEND_URL, MEMI_BACKEND_API_KEY), Next proxies /api/supplements/all and
  /api/tasks/*, supplement dose_time noon/night rules, Task ApiResponse envelope,
  tags stored as JSON text on tasks, and local dev (npm run local). Use when working
  on memiLife, memi-backend, supplements, tasks, Flyway, Railway DATABASE_URL, CORS,
  or integrating front and back.
---

# MemiLife architecture (project skill)

## Always read first

For full directory trees, API tables, DB columns, and troubleshooting, open **[docs/PROJECT-ECOSYSTEM.md](../../../docs/PROJECT-ECOSYSTEM.md)** (repo root: `docs/PROJECT-ECOSYSTEM.md`).

## Non-negotiable facts (short)

1. **Two repositories:** **memiLife** (Next.js). **memi-backend** — sibling clone default `../memi-backend` for `npm run local`.
2. **Supplements (dashboard):** Browser calls **`GET /api/supplements/all`** (Next); server proxies **`GET {origin}/api/supplements/all`** (Spring returns a **JSON array**); **`lib/services/dashboard.ts`** builds noon/night from **`doseTime` / `dose_time` only** (05:00–16:59 noon, 17:00–04:59 night; missing → noon). **`taken_time_slot` is not used for bucketing.**
3. **Tasks (Memi Task):** UI at **`/tasks`**. Browser calls **`/api/tasks`** and subpaths; Next **`lib/server/proxy-spring.ts`** forwards to Spring with **`X-API-Key`** from the incoming request or **`MEMI_BACKEND_API_KEY`**. Spring **`/api/tasks`** returns **`ApiResponse<T>`** (wrapper in `com.memi.lifeos.web.dto`).
4. **Backend base URL** for the Next server: **`export function backendOriginForServer()`** in `lib/services/dashboard.ts` — **origin only**; strip paths on `MEMI_BACKEND_URL` (`toHttpOriginOnly`).
5. **Database:** Flyway in **`memi-backend/src/main/resources/db/migration/`**. Postgres via **`DATABASE_URL`**. **`tasks.tags`** is **TEXT** holding a **JSON array string** (e.g. `[]`), not native `text[]` (avoids JDBC issues). Manual DDL: **`memi-backend/db/manual/create_tasks_table_postgres.sql`**. Profile **`h2`**: Flyway off, JPA `update`, supplement seed.

## Where to change what

| Goal | Primary location |
|------|------------------|
| Supplement stack UI | `components/dashboard/supplement-stack.tsx` |
| Noon/night / supplement fetch | `lib/services/dashboard.ts` |
| Supplement proxy | `app/api/supplements/all/route.ts` |
| Task list / form / timer | `components/task/*.tsx`, `app/tasks/page.tsx` |
| Task client API + unwrap `ApiResponse` | `lib/services/task.ts` |
| Task Next proxy + API key forward | `lib/server/proxy-spring.ts`, `app/api/tasks/**` |
| Spring tasks REST / timer / soft delete | `memi-backend` … `task/api`, `dto`, `service` |
| Schema | Flyway `V*.sql` + entities |

## Commands (memiLife)

- `npm run dev` — Next only (backend on 8080 or `MEMI_BACKEND_URL`).
- `npm run local` — Backend `mvnw` + `npm run dev`; override path with **`MEMI_BACKEND_DIR`**.
- `npm run lint` — runs **`tsc --noEmit`** (project ESLint CLI not wired).

After migration or entity changes, align **DTOs/mappers/IT** (backend) and **types + task.ts** (frontend).
