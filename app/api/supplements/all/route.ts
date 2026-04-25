import { NextResponse } from "next/server"
import { getDashboardPayload } from "@/lib/services/dashboard"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Browser calls this; server proxies to Spring: GET {origin}/api/supplements/all
 * (รายการทั้งหมด ไม่ใช่แบบ page) แล้ว build กอง noon/night
 */
export async function GET() {
  try {
    const payload = await getDashboardPayload()
    return NextResponse.json(payload)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
