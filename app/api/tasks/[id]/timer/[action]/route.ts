import { proxySpring } from "@/lib/server/proxy-spring"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const TIMER_ACTIONS = new Set(["start", "pause", "stop"])

type Ctx = { params: Promise<{ id: string; action: string }> }

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id, action } = await ctx.params
  if (!TIMER_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: "Invalid timer action; use start, pause, or stop." },
      { status: 400 },
    )
  }
  return proxySpring(req, `/api/tasks/${id}/timer/${action}`, {
    method: "PATCH",
  })
}
