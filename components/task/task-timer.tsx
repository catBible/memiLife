"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { pauseTimer, startTimer, stopTimer } from "@/lib/services/task"
import type { Task } from "@/types/task"

function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0")
}

function formatMmSs(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${pad2(s / 60)}:${pad2(s % 60)}`
}

/** Elapsed seconds including an active running segment from timerStartedAt. */
function effectiveElapsedSec(task: Task): number {
  let base = task.timerElapsedSec ?? 0
  if (task.timerStartedAt) {
    const start = new Date(task.timerStartedAt).getTime()
    if (!Number.isNaN(start)) {
      base += (Date.now() - start) / 1000
    }
  }
  return Math.floor(base)
}

type Props = {
  task: Task
  onTimerChange: (t: Task) => void
}

export function TaskTimer({ task, onTimerChange }: Props) {
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)
  const notifiedRef = useRef(false)

  const durationSec = useMemo(() => {
    const m = task.durationMinutes
    /** 0 หรือติดลบ = ไม่ใช้ countdown (ใช้ stopwatch เท่านั้น) */
    if (m == null || Number.isNaN(m) || m <= 0) return null
    return m * 60
  }, [task.durationMinutes])

  const elapsed = useMemo(() => effectiveElapsedSec(task), [task, tick])

  const remaining =
    durationSec != null ? durationSec - elapsed : null

  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (remaining != null && remaining <= 0 && task.timerStartedAt) {
      if (!notifiedRef.current) {
        notifiedRef.current = true
        toast.info("หมดเวลานับถอยหลัง", { description: task.title })
      }
    } else if (remaining == null || remaining > 0) {
      notifiedRef.current = false
    }
  }, [remaining, task.timerStartedAt, task.title])

  const display =
    durationSec != null
      ? formatMmSs(remaining != null ? Math.max(0, remaining) : 0)
      : formatMmSs(elapsed)

  async function call(
    label: "start" | "pause" | "stop",
    fn: (id: number) => Promise<Task>,
  ) {
    setLoading(label)
    try {
      const next = await fn(task.id)
      onTimerChange(next)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-mono tabular-nums text-muted-foreground">
        {durationSec != null ? "เหลือ " : ""}
        {display}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!!task.timerStartedAt || !!loading}
        onClick={() => void call("start", startTimer)}
      >
        {loading === "start" ? "…" : "Start"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!task.timerStartedAt || !!loading}
        onClick={() => void call("pause", pauseTimer)}
      >
        {loading === "pause" ? "…" : "Pause"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={!!loading}
        onClick={() => void call("stop", stopTimer)}
      >
        {loading === "stop" ? "…" : "Stop"}
      </Button>
    </div>
  )
}
