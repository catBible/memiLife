import { backendOriginForServer } from "@/lib/services/dashboard"
import type {
  ApiEnvelope,
  Task,
  TaskPatchBody,
  TaskWriteBody,
  UpdateScheduleBody,
} from "@/types/task"

function tasksUrl(path = ""): string {
  const base =
    typeof window === "undefined"
      ? `${backendOriginForServer()}/api/tasks`
      : "/api/tasks"
  return path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base
}

function extractApiErrorMessage(data: unknown, fallbackText: string): string {
  if (typeof data === "object" && data !== null) {
    const o = data as Record<string, unknown>
    if (typeof o.detail === "string" && o.detail) return o.detail
    if (typeof o.message === "string" && o.message) return o.message
    if (typeof o.title === "string" && o.title) return o.title
    if (typeof o.error === "string" && o.error) return o.error
  }
  return fallbackText.slice(0, 400)
}

function unwrap<T>(raw: unknown): T {
  if (
    raw &&
    typeof raw === "object" &&
    "success" in raw &&
    "data" in (raw as ApiEnvelope<T>)
  ) {
    return (raw as ApiEnvelope<T>).data
  }
  return raw as T
}

function unwrapRequired<T>(raw: unknown, label: string): T {
  const v = unwrap<T>(raw)
  if (v == null || v === undefined) {
    throw new Error(`Invalid response: missing ${label}`)
  }
  return v
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  let data: unknown
  try {
    data = JSON.parse(text) as unknown
  } catch {
    throw new Error(`Invalid JSON (${res.status}): ${text.slice(0, 200)}`)
  }
  if (!res.ok) {
    const msg = extractApiErrorMessage(data, text)
    throw new Error(`${res.status}: ${msg}`)
  }
  return data as T
}

/** Server or client: list tasks (unwraps ApiResponse). */
export async function getAllTasks(): Promise<Task[]> {
  const res = await fetch(tasksUrl(), {
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  const data = unwrap<Task[]>(raw)
  if (!Array.isArray(data)) {
    throw new Error("Invalid tasks response: expected data array")
  }
  return data
}

export async function getTaskById(id: number): Promise<Task> {
  const res = await fetch(tasksUrl(`/${id}`), {
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}

export async function createTask(dto: TaskWriteBody): Promise<Task> {
  const res = await fetch(tasksUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}

export async function updateTask(
  id: number,
  dto: TaskPatchBody,
): Promise<Task> {
  const res = await fetch(tasksUrl(`/${id}`), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(tasksUrl(`/${id}`), {
    method: "DELETE",
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  await parseJson<unknown>(res)
}

export async function updateSchedule(
  id: number,
  dto: UpdateScheduleBody,
): Promise<Task> {
  const res = await fetch(tasksUrl(`/${id}/schedule`), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}

export async function startTimer(id: number): Promise<Task> {
  const res = await fetch(tasksUrl(`/${id}/timer/start`), {
    method: "PATCH",
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}

export async function pauseTimer(id: number): Promise<Task> {
  const res = await fetch(tasksUrl(`/${id}/timer/pause`), {
    method: "PATCH",
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}

export async function stopTimer(id: number): Promise<Task> {
  const res = await fetch(tasksUrl(`/${id}/timer/stop`), {
    method: "PATCH",
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  })
  const raw = await parseJson<unknown>(res)
  return unwrapRequired<Task>(raw, "task")
}
