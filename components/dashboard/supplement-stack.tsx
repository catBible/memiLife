"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sun, Moon, Pill } from "lucide-react"
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
        <div className="space-y-2">
          {rows.map((item) => {
            const bedtimeRow = showBedtimeHighlight && isMagnesium(item.name)
            return (
              <div
                key={item.id}
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
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  {item.name}
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
        <Button
          onClick={handleConfirm}
          className="w-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90"
        >
          <Check className="mr-2 h-4 w-4" />
          Confirm Taken
        </Button>
      </CardContent>
    </Card>
  )
}
