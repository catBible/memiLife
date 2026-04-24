"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Sun, Moon, Pill } from "lucide-react"
import { cn } from "@/lib/utils"

interface SupplementStackProps {
  title: string
  icon: "noon" | "night"
  items: { name: string; dosage?: string }[]
  triggerTime: string
}

export function SupplementStack({ title, icon, items, triggerTime }: SupplementStackProps) {
  const [taken, setTaken] = useState(false)

  const Icon = icon === "noon" ? Sun : Moon

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Icon className={cn(
              "h-5 w-5",
              icon === "noon" ? "text-warning" : "text-chart-1"
            )} />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            {triggerTime}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2"
            >
              <Pill className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium text-foreground">
                {item.name}
              </span>
              {item.dosage && (
                <Badge variant="outline" className="text-xs">
                  {item.dosage}
                </Badge>
              )}
            </div>
          ))}
        </div>
        <Button
          onClick={() => setTaken(!taken)}
          className={cn(
            "w-full transition-all duration-200",
            taken
              ? "bg-success hover:bg-success/90 text-success-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          {taken ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Taken
            </>
          ) : (
            "Confirm Taken"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
