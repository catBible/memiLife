/** Task row from Spring API (camelCase). */
export type Task = {
  id: number
  title: string
  description?: string | null
  status: string
  priority: number
  tags: string[]
  scheduledAt?: string | null
  endAt?: string | null
  dueAt?: string | null
  durationMinutes?: number | null
  actualMinutes?: number | null
  timerStartedAt?: string | null
  timerElapsedSec: number
  note?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type TaskWriteBody = {
  title: string
  description?: string | null
  status?: string | null
  priority?: number | null
  tags?: string[] | null
  scheduledAt?: string | null
  endAt?: string | null
  dueAt?: string | null
  durationMinutes?: number | null
  actualMinutes?: number | null
  note?: string | null
}

export type TaskPatchBody = Partial<TaskWriteBody>

export type UpdateScheduleBody = {
  scheduledAt?: string | null
  endAt?: string | null
  dueAt?: string | null
}

export type ApiEnvelope<T> = {
  success: boolean
  data: T
  message?: string | null
}
