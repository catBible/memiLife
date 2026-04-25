"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Utensils } from "lucide-react"

type WindowMode = "eating" | "fasting"

function getIf168Window(now: Date): {
  mode: WindowMode
  progress: number
  remainingMs: number
} {
  const y = now.getFullYear()
  const mo = now.getMonth()
  const da = now.getDate()
  const today12 = new Date(y, mo, da, 12, 0, 0, 0)
  const today20 = new Date(y, mo, da, 20, 0, 0, 0)
  const t = now.getTime()

  if (t >= today12.getTime() && t < today20.getTime()) {
    const total = today20.getTime() - today12.getTime()
    const elapsed = t - today12.getTime()
    return {
      mode: "eating",
      progress: (elapsed / total) * 100,
      remainingMs: today20.getTime() - t,
    }
  }

  if (t >= today20.getTime()) {
    const fastStart = today20.getTime()
    const tomorrow12 = new Date(today12)
    tomorrow12.setDate(tomorrow12.getDate() + 1)
    const fastTotal = tomorrow12.getTime() - fastStart
    const elapsed = t - fastStart
    return {
      mode: "fasting",
      progress: (elapsed / fastTotal) * 100,
      remainingMs: tomorrow12.getTime() - t,
    }
  }

  const yesterday20 = new Date(today20)
  yesterday20.setDate(yesterday20.getDate() - 1)
  const fastStart = yesterday20.getTime()
  const fastEnd = today12.getTime()
  const fastTotal = fastEnd - fastStart
  const elapsed = t - fastStart
  return {
    mode: "fasting",
    progress: (elapsed / fastTotal) * 100,
    remainingMs: fastEnd - t,
  }
}

function formatRemaining(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function FastingTracker() {
  /** null until client mount — avoids SSR/client clock mismatch hydration errors */
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { mode, progress, remainingMs } = useMemo(() => {
    if (!currentTime) {
      return {
        mode: "fasting" as WindowMode,
        progress: 0,
        remainingMs: 0,
      }
    }
    return getIf168Window(currentTime)
  }, [currentTime])

  const isEatingWindow = mode === "eating"
  const clampedProgress = Math.min(100, Math.max(0, progress))

  const countdownText = !currentTime
    ? "…"
    : isEatingWindow
      ? `${formatRemaining(remainingMs)} until fasting`
      : `${formatRemaining(remainingMs)} until eating`

  const targetText = isEatingWindow
    ? "Eating window ends at 8:00 PM"
    : "Eating window starts at 12:00 PM"

  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = Number(
    (circumference - (clampedProgress / 100) * circumference).toFixed(4),
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Timer className="h-5 w-5 text-muted-foreground" />
          IF 16/8 Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 pt-4">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-secondary"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={
                !currentTime
                  ? "text-muted-foreground/40"
                  : isEatingWindow
                    ? "text-success"
                    : "text-chart-1"
              }
              style={{
                transition: currentTime ? "stroke-dashoffset 0.35s linear" : undefined,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`flex items-center gap-2 text-lg font-semibold ${
                !currentTime
                  ? "text-muted-foreground"
                  : isEatingWindow
                    ? "text-success"
                    : "text-chart-1"
              }`}
            >
              {!currentTime ? (
                <>
                  <Timer className="h-5 w-5" />
                  …
                </>
              ) : isEatingWindow ? (
                <>
                  <Utensils className="h-5 w-5" />
                  Eating
                </>
              ) : (
                <>
                  <Timer className="h-5 w-5" />
                  Fasting
                </>
              )}
            </div>
            <span className="mt-1 text-2xl font-bold text-foreground">
              {currentTime ? `${Math.round(clampedProgress)}%` : "—"}
            </span>
          </div>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-lg font-medium text-foreground">{countdownText}</p>
          <p className="text-sm text-muted-foreground">{targetText}</p>
        </div>
      </CardContent>
    </Card>
  )
}
