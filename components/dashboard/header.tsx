"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User, GraduationCap, ListTodo } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Header() {
  const [dateLabel, setDateLabel] = useState<string | null>(null)

  useEffect(() => {
    const format = () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    setDateLabel(format())
    const id = setInterval(() => setDateLabel(format()), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex items-center justify-between py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Good morning, Developer
        </h1>
        <p className="text-sm text-muted-foreground">{dateLabel ?? "…"}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks
          </Link>
        </Button>
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-foreground">Profile</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="h-3 w-3" />
            SSRU Computer Engineering
          </span>
        </div>
        <Avatar className="h-10 w-10 border-2 border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
