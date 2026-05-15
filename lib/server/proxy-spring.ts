import { backendOriginForServer } from "@/lib/services/dashboard"
import { NextRequest, NextResponse } from "next/server"

function resolveApiKey(req: NextRequest): string {
  return (
    req.headers.get("x-api-key") ??
    process.env.MEMI_BACKEND_API_KEY ??
    ""
  ).trim()
}

/**
 * Forwards to Spring Boot. Mutating methods get X-API-Key from the incoming request or MEMI_BACKEND_API_KEY.
 */
export async function proxySpring(
  req: NextRequest,
  springPath: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const url = `${backendOriginForServer()}${springPath}`
  const headers = new Headers(init.headers)
  const key = resolveApiKey(req)
  if (key) {
    headers.set("X-API-Key", key)
  }
  const res = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type":
        res.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  })
}
