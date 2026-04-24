"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Code2 } from "lucide-react"

export function ResumeCard() {
  const skills = ["Angular", "Java", "PostgreSQL", "Cursor AI Expert"]

  return (
    <Card className="bg-card border-border group cursor-pointer transition-all duration-200 hover:border-chart-1/50 hover:bg-card/80">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-1/10">
              <Code2 className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Interactive Resume</h3>
              <p className="text-xs text-muted-foreground">Full-Stack Developer</p>
            </div>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-chart-1" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="text-xs font-normal"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
