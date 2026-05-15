import { proxySpring } from "@/lib/server/proxy-spring"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  return proxySpring(req, `/api/tasks/${id}`)
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const body = await req.text()
  return proxySpring(req, `/api/tasks/${id}`, {
    method: "PATCH",
    body,
    headers: { "content-type": "application/json" },
  })
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  return proxySpring(req, `/api/tasks/${id}`, { method: "DELETE" })
}
