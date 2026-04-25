/**
 * Dashboard + supplement API boundary. Swap implementations when Java backend is ready;
 * keep callers on these functions and NEXT_PUBLIC_API_URL in .env.local.
 */

export type SupplementStockItem = {
  id: string
  name: string
  dosage?: string
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

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")
}

/** Mock dashboard payload. Later: GET `${apiBase()}/dashboard` */
export async function fetchDashboardData(): Promise<DashboardPayload> {
  const base = apiBase()
  if (typeof window !== "undefined" && base) {
    console.info("[memiLife] fetchDashboardData → will use", `${base}/dashboard`)
  }

  await new Promise((r) => setTimeout(r, 120))

  return {
    supplementStacks: {
      noon: {
        stackId: "noon",
        title: "Noon Stack",
        icon: "noon",
        triggerTime: "12:00 PM",
        items: [
          { id: "vit-c", name: "Vitamin C", stock: 30 },
          { id: "vit-b", name: "Vitamin B", stock: 30 },
          { id: "fish-oil", name: "Fish Oil", stock: 24 },
        ],
      },
      night: {
        stackId: "night",
        title: "Night Stack",
        icon: "night",
        triggerTime: "12:30 AM",
        items: [
          {
            id: "mag-l-threonate",
            name: "Magnesium L-Threonate",
            dosage: "2 Capsules",
            stock: 18,
          },
        ],
      },
    },
  }
}

/** Mock log. Later: POST `${apiBase()}/supplements/log` with JSON body */
export async function logSupplement(input: LogSupplementInput): Promise<{ ok: true }> {
  const base = apiBase()
  if (typeof window !== "undefined" && base) {
    console.info("[memiLife] logSupplement → will use", `${base}/supplements/log`, input)
  }

  await new Promise((r) => setTimeout(r, 80))
  return { ok: true }
}
