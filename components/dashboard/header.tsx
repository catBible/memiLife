"use client"

import { User, GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <header className="flex items-center justify-between py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Good morning, Developer
        </h1>
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </div>
      <div className="flex items-center gap-3">
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
