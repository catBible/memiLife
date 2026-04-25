/**
 * Dashboard + supplement API. Server fetches: GET {origin}/api/supplements/all
 * Browser: GET /api/supplements/all (Next proxy) → Spring GET {origin}/api/supplements/all.
 *
 * แยกกลุ่มการ์ด: ใช้เฉพาะฟิลด์ `dose_time` / `doseTime` (HH:mm) — 05:00–16:59 กลางวัน, 17:00–04:59 กลางคืน;
 * ไม่มี `dose_time` หรือพาร์สไม่ได้ → กลองกลางวัน.
 *
 * Base URL: MEMI_BACKEND_URL (server) → NEXT_PUBLIC_API_URL → …
 */

const DEFAULT_RAILWAY_ORIGIN =
  "https://memi-backend-production-6743.up.railway.app"
const DEFAULT_LOCAL_DEV_ORIGIN = "http://127.0.0.1:8080"

type ApiSupplementRow = {
  id: number
  name: string
  brand: string
  dosage: string
  stockRemaining: number
  takenTimeSlot?: string | null
  /** Local 24h "HH:mm" (Spring: camelCase) */
  doseTime?: string | null
  /** "before" | "after" */
  mealTiming?: string | null
  lastTakenAt?: string | null
} & {
  /** snake_case บาง response / proxy ยังส่งมา */
  taken_time_slot?: string | null
  dose_time?: string | null
  meal_timing?: string | null
  last_taken_at?: string | null
}

export type SupplementStockItem = {
  id: string
  name: string
  brand?: string
  dosage?: string
  /** Local 24h "HH:mm" — when to take */
  doseTime?: string
  /** e.g. "before" | "after" from API */
  mealTiming?: string
  /** ISO-8601 — ทานล่าสุด */
  lastTakenAt?: string
  stock: number
}

export type SupplementStackPayload = {
  stackId: "noon" | "night"
  title: string
  icon: "noon" | "night"
  triggerTime: string
  items: SupplementStockItem[]
}

export type DashboardPayload = {
  supplementStacks: {
    noon: SupplementStackPayload
    night: SupplementStackPayload
  }
}

export type LogSupplementInput = {
  stackId: string
  entries: { itemId: string; previousStock: number; newStock: number }[]
}

/**
 * `.env` often has a path (e.g. /api/v1) but the Spring app mounts supplements at
 * /api/supplements. Use only scheme+host+port, then we append /api/supplements/...
 */
function toHttpOriginOnly(raw: string): string {
  const t = raw.trim()
  if (!t) return ""
  try {
    if (/^https?:\/\//i.test(t)) {
      return new URL(t).origin
    }
  } catch {
    return t.replace(/\/$/, "")
  }
  const first = t.split("/")[0].split("?")[0]
  if (first) {
    try {
      if (/[.:]/.test(first) && !/\s/.test(first)) {
        return new URL(`http://${first}`).origin
      }
    } catch {
      // ignore
    }
  }
  return t.replace(/\/$/, "")
}

/**
 * Where the Next server should fetch the Spring API (origin only, no path).
 */
function backendOriginForServer(): string {
  const a = toHttpOriginOnly(
    (process.env.MEMI_BACKEND_URL ??
      process.env.SUPPLEMENTS_API_ORIGIN ??
      process.env.NEXT_PUBLIC_API_URL ??
      "") as string,
  )
  if (a) return a
  if (process.env.NODE_ENV === "development") {
    return DEFAULT_LOCAL_DEV_ORIGIN
  }
  return DEFAULT_RAILWAY_ORIGIN
}

/** Client-side hint (logs). */
function publicApiOriginHint(): string {
  const p = toHttpOriginOnly((process.env.NEXT_PUBLIC_API_URL ?? "").trim())
  if (p) return p
  if (process.env.NODE_ENV === "development") return DEFAULT_LOCAL_DEV_ORIGIN
  return DEFAULT_RAILWAY_ORIGIN
}

function pickDoseTime(s: ApiSupplementRow): string | null {
  const a = s.doseTime?.trim()
  if (a) return a
  const b = s.dose_time?.trim()
  return b && b.length > 0 ? b : null
}

function pickMealTiming(s: ApiSupplementRow): string | null {
  const a = s.mealTiming?.trim()
  if (a) return a
  const b = s.meal_timing?.trim()
  return b && b.length > 0 ? b : null
}

function pickLastTaken(s: ApiSupplementRow): string | undefined {
  const a = s.lastTakenAt
  if (a != null && String(a).length > 0) return String(a)
  const b = s.last_taken_at
  if (b != null && String(b).length > 0) return String(b)
  return undefined
}

function mapApiRowToItem(s: ApiSupplementRow): SupplementStockItem {
  const t = pickDoseTime(s)
  return {
    id: String(s.id),
    name: s.name,
    brand: s.brand?.trim() || undefined,
    dosage: s.dosage?.trim() || undefined,
    doseTime: t || undefined,
    mealTiming: pickMealTiming(s) || undefined,
    lastTakenAt: pickLastTaken(s),
    stock: s.stockRemaining,
  }
}

/** 05:00–16:59 น. = กองกลางวัน, 17:00–04:59 น. = กองกลางคืน (ข้ามเที่ยงคืน) */
const DAY_START_MIN = 5 * 60
const DAY_END_MIN = 16 * 60 + 59

function parseHhmmToMinutes(hhmm: string | null | undefined): number | null {
  if (hhmm == null) return null
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

/** จับกลุ่มจาก `dose_time` เท่านั้น; ไม่มี/พาร์สไม่ได้: `null` (caller ส่ง default noon) */
function stackFromDoseTime(
  doseTime: string | null | undefined,
): "noon" | "night" | null {
  const mins = parseHhmmToMinutes(doseTime)
  if (mins === null) return null
  if (mins >= DAY_START_MIN && mins <= DAY_END_MIN) return "noon"
  return "night"
}

/** รายการ→กลอง: อ้าง `doseTime` / `dose_time` อย่างเดียว (ไม่อ่าน `taken_time_slot`) */
function stackFromRow(row: ApiSupplementRow): "noon" | "night" {
  const byTime = stackFromDoseTime(pickDoseTime(row))
  if (byTime !== null) {
    return byTime
  }
  return "noon"
}

function formatFetchError(url: string, e: unknown): string {
  const base = e instanceof Error ? e.message : String(e)
  let extra = ""
  if (e instanceof TypeError) {
    const c = (e as Error & { cause?: unknown }).cause
    if (c) {
      const msg =
        typeof c === "object" && c !== null && "message" in c
          ? String((c as { message: unknown }).message)
          : String(c)
      if (msg && !base.includes(msg)) extra = ` (${msg})`
    }
  }
  return `${base}${extra} — ${url}`
}

async function fetchSupplementRowsFromBackend(): Promise<ApiSupplementRow[]> {
  const origin = backendOriginForServer()
  const url = `${origin}/api/supplements/all`
  let res: Response
  try {
    res = await fetch(url, {
      cache: "no-store",
      // Avoid hanging on dead hosts (undici in Node 18+)
      signal: AbortSignal.timeout(25_000),
    })
  } catch (e) {
    const hint =
      process.env.NODE_ENV === "development"
        ? " Start memi-backend (Spring) on 8080, or set MEMI_BACKEND_URL in .env.local."
        : " Set MEMI_BACKEND_URL (e.g. your Railway API origin)."
    throw new Error(
      `Backend unreachable: ${formatFetchError(url, e)}${hint}`,
    )
  }
  if (!res.ok) {
    throw new Error(
      `supplements: ${res.status} ${res.statusText} (${url})`,
    )
  }
  const data = (await res.json()) as unknown
  if (!Array.isArray(data)) {
    throw new Error("supplements: expected a JSON array")
  }
  return data as ApiSupplementRow[]
}

function buildDashboardFromRows(data: ApiSupplementRow[]): DashboardPayload {
  const noonItems: SupplementStockItem[] = []
  const nightItems: SupplementStockItem[] = []
  for (const row of data) {
    const m = mapApiRowToItem(row)
    if (stackFromRow(row) === "night") {
      nightItems.push(m)
    } else {
      noonItems.push(m)
    }
  }

  return {
    supplementStacks: {
      noon: {
        stackId: "noon",
        title: "Noon Stack",
        icon: "noon",
        triggerTime: "12:00 PM",
        items: noonItems,
      },
      night: {
        stackId: "night",
        title: "Night Stack",
        icon: "night",
        triggerTime: "12:30 AM",
        items: nightItems,
      },
    },
  }
}

/**
 * Fetches from Railway and builds stacks. Used by the Next.js route and server code.
 */
export async function getDashboardPayload(): Promise<DashboardPayload> {
  const rows = await fetchSupplementRowsFromBackend()
  return buildDashboardFromRows(rows)
}

/**
 * In the browser, GET `/api/supplements/all` (proxy → backend `/api/supplements/all`). Server: direct fetch.
 */
export async function fetchDashboardData(): Promise<DashboardPayload> {
  if (typeof window !== "undefined") {
    const res = await fetch("/api/supplements/all", { cache: "no-store" })
    if (!res.ok) {
      const text = await res.text()
      let detail = text.slice(0, 200)
      try {
        const j = JSON.parse(text) as { error?: string }
        if (j.error) detail = j.error
      } catch {
        // use body snippet
      }
      throw new Error(
        res.status === 502
          ? `Supplements proxy: ${detail}`
          : `Could not load dashboard (${res.status}: ${detail})`,
      )
    }
    return (await res.json()) as DashboardPayload
  }
  return getDashboardPayload()
}

/** Mock log. Later: POST to your backend (e.g. dec stock by id) */
export async function logSupplement(
  input: LogSupplementInput,
): Promise<{ ok: true }> {
  if (typeof window !== "undefined") {
    console.info(
      "[memiLife] logSupplement (not persisted yet) →",
      publicApiOriginHint(),
      input,
    )
  }

  await new Promise((r) => setTimeout(r, 80))
  return { ok: true }
}
