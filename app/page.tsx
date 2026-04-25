"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { FastingTracker } from "@/components/dashboard/fasting-tracker"
import { SupplementStack } from "@/components/dashboard/supplement-stack"
import { FinancialProgress } from "@/components/dashboard/financial-progress"
import { ResumeCard } from "@/components/dashboard/resume-card"
import {
  fetchDashboardData,
  type DashboardPayload,
} from "@/lib/services/dashboard"

export default function Dashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchDashboardData()
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((e) => {
        if (cancelled) return
        const isDev = process.env.NODE_ENV === "development"
        setLoadError(
          isDev && e instanceof Error
            ? e.message
            : "Could not load dashboard (using empty state).",
        )
      })
    return () => {
      cancelled = true
    }
  }, [])

  const noon = data?.supplementStacks.noon
  const night = data?.supplementStacks.night

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <Header />

        {loadError && (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loadError}
          </p>
        )}

        <main className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-1">
              <FastingTracker />
            </div>

            <div className="space-y-6 md:col-span-1">
              {noon ? (
                <SupplementStack
                  stackId={noon.stackId}
                  title={noon.title}
                  icon={noon.icon}
                  items={noon.items}
                  triggerTime={noon.triggerTime}
                />
              ) : (
                <SupplementSkeleton label="Noon stack" />
              )}
              {night ? (
                <SupplementStack
                  stackId={night.stackId}
                  title={night.title}
                  icon={night.icon}
                  items={night.items}
                  triggerTime={night.triggerTime}
                />
              ) : (
                <SupplementSkeleton label="Night stack" />
              )}
            </div>

            <div className="space-y-6 md:col-span-2 lg:col-span-1">
              <FinancialProgress />
              <ResumeCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SupplementSkeleton({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-8 text-center text-sm text-muted-foreground">
      Loading {label}…
    </div>
  )
}
