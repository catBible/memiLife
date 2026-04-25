"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sun, Moon, Pill, Clock, Utensils, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { logSupplement, type SupplementStockItem } from "@/lib/services/dashboard"

export type SupplementStackViewProps = {
  stackId: "noon" | "night"
  title: string
  icon: "noon" | "night"
  items: SupplementStockItem[]
  triggerTime: string
}

function isMagnesium(name: string): boolean {
  return name.toLowerCase().includes("magnesium")
}

function isBedtimeDoseWindow(d: Date): boolean {
  const h = d.getHours()
  return h >= 0 && h < 1
}

/** e.g. "12:00" 24h → แสดง local th-TH */
function formatDoseTimeLabel(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return hhmm
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return hhmm
  const d = new Date(2000, 0, 1, h, min, 0, 0)
  return d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function formatMealTimingLabel(raw: string): string {
  const s = raw.trim().toLowerCase()
  if (s === "before") return "ก่อนอาหาร"
  if (s === "after") return "หลังอาหาร"
  return raw.trim()
}

function formatLastTakenAtLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function SupplementStack({
  stackId,
  title,
  icon,
  items: initialItems,
  triggerTime,
}: SupplementStackViewProps) {
  const [stocks, setStocks] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialItems.map((i) => [i.id, i.stock])),
  )
  /** null until client mount — same hydration fix as FastingTracker */
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setStocks(Object.fromEntries(initialItems.map((i) => [i.id, i.stock])))
  }, [initialItems])

  useEffect(() => {
    if (icon !== "night") return
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [icon])

  const showBedtimeHighlight =
    icon === "night" && now !== null && isBedtimeDoseWindow(now)

  const Icon = icon === "noon" ? Sun : Moon

  const handleConfirm = useCallback(async () => {
    if (initialItems.length === 0) return
    const snapshot = { ...stocks }
    const depleted = initialItems.filter((i) => (snapshot[i.id] ?? 0) <= 0)
    if (depleted.length > 0) {
      toast.error("Some supplements are out of stock.", {
        description: depleted.map((d) => d.name).join(", "),
      })
      return
    }

    const next: Record<string, number> = { ...snapshot }
    const entries = initialItems.map((i) => {
      const before = snapshot[i.id] ?? 0
      const newStock = Math.max(0, before - 1)
      next[i.id] = newStock
      return { itemId: i.id, previousStock: before, newStock }
    })

    setStocks(next)
    await logSupplement({ stackId, entries })

    toast.success("Dose logged", {
      description: `${title} · ${initialItems.map((i) => `${i.name} (${next[i.id]} left)`).join(" · ")}`,
    })
  }, [initialItems, stackId, stocks, title])

  const rows = useMemo(
    () =>
      initialItems.map((item) => ({
        ...item,
        stock: stocks[item.id] ?? item.stock,
      })),
    [initialItems, stocks],
  )

  return (
    <Card
      className={cn(
        "bg-card border-border transition-shadow duration-300",
        showBedtimeHighlight && "ring-2 ring-chart-1/60 shadow-md shadow-chart-1/10",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Icon
              className={cn(
                "h-5 w-5",
                icon === "noon" ? "text-warning" : "text-chart-1",
              )}
            />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            {triggerTime}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/**
         * ~3 rows visible; 4+ items need scroll. Radix ScrollArea shows thumb on overflow.
         */}
        <ScrollArea
          className="h-44 w-full rounded-lg border border-border/60 bg-secondary/20"
        >
          <div className="space-y-2 p-1 pr-3" role="list">
            {rows.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs leading-relaxed text-muted-foreground">
                ยังไม่มีรายการในกลุ่มนี้ — กลองแยกจาก <span className="whitespace-nowrap">dose_time (HH:mm)</span> อย่างเดียว: กลางคืน
                ต้อง 17:00–04:59, กลางวัน 05:00–16:59
              </p>
            ) : null}
            {rows.map((item) => {
              const bedtimeRow = showBedtimeHighlight && isMagnesium(item.name)
              return (
                <div
                  key={item.id}
                  role="listitem"
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2",
                    bedtimeRow && "bg-chart-1/15 ring-1 ring-chart-1/40",
                  )}
                >
                  <Pill
                    className={cn(
                      "h-4 w-4 shrink-0",
                      bedtimeRow ? "text-chart-1" : "text-muted-foreground",
                    )}
                  />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                  {item.brand ? (
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {item.brand}
                    </span>
                  ) : null}
                  {item.doseTime || item.mealTiming || item.lastTakenAt ? (
                    <span className="mt-1 flex flex-col gap-0.5 text-xs text-foreground/80">
                      {item.doseTime ? (
                        <span className="flex items-center gap-1.5">
                          <Clock
                            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <span>
                            กินเวลา {formatDoseTimeLabel(item.doseTime)} น.
                          </span>
                        </span>
                      ) : null}
                      {item.mealTiming ? (
                        <span className="flex items-center gap-1.5">
                          <Utensils
                            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          <span>{formatMealTimingLabel(item.mealTiming)}</span>
                        </span>
                      ) : null}
                      {item.lastTakenAt ? (
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <CalendarCheck
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden
                          />
                          <span>
                            ทานล่าสุด {formatLastTakenAtLabel(item.lastTakenAt)}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {bedtimeRow && (
                      <Badge
                        variant="outline"
                        className="border-chart-1/50 text-[10px] uppercase tracking-wide text-chart-1"
                      >
                        Bedtime Dose
                      </Badge>
                    )}
                    {item.dosage && (
                      <Badge variant="outline" className="text-xs">
                        {item.dosage}
                      </Badge>
                    )}
                    <Badge
                      variant={item.stock <= 0 ? "destructive" : "secondary"}
                      className="tabular-nums"
                    >
                      ×{item.stock}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        <Button
          onClick={handleConfirm}
          disabled={initialItems.length === 0}
          className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90"
        >
          <Check className="mr-2 h-4 w-4" />
          Confirm Taken
        </Button>
      </CardContent>
    </Card>
  )
}
