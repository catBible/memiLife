import { proxySpring } from "@/lib/server/proxy-spring"
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  return proxySpring(req, "/api/tasks")
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  return proxySpring(req, "/api/tasks", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  })
}
