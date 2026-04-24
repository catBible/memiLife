"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Target } from "lucide-react"

export function FinancialProgress() {
  const remaining = 1900000 // 1.9M THB
  const total = 3000000 // Estimated original loan
  const paid = total - remaining
  const progress = (paid / total) * 100

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Home className="h-5 w-5 text-muted-foreground" />
          Home Loan Refinance (KTB)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-bold text-foreground">1.9M</span>
            <span className="ml-1 text-sm text-muted-foreground">THB</span>
          </div>
          <span className="text-sm text-muted-foreground">remaining</span>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-chart-1 to-chart-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(paid)} THB paid</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Goal */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
          <Target className="h-4 w-4 text-chart-2" />
          <span className="text-sm font-medium text-foreground">
            Refinance Goal: Feb 2026
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
