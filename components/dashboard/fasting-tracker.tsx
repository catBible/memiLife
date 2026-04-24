"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, Utensils } from "lucide-react"

export function FastingTracker() {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Eating window: 12:00 PM - 08:00 PM (12:00 - 20:00)
  const eatingStartHour = 12
  const eatingEndHour = 20
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  
  const isEatingWindow = currentHour >= eatingStartHour && currentHour < eatingEndHour
  
  // Calculate progress and countdown
  let progress = 0
  let countdownText = ""
  let targetText = ""
  
  if (isEatingWindow) {
    // During eating window
    const minutesIntoEating = (currentHour - eatingStartHour) * 60 + currentMinute
    const totalEatingMinutes = (eatingEndHour - eatingStartHour) * 60
    progress = (minutesIntoEating / totalEatingMinutes) * 100
    
    const remainingMinutes = totalEatingMinutes - minutesIntoEating
    const hours = Math.floor(remainingMinutes / 60)
    const mins = remainingMinutes % 60
    countdownText = `${hours}h ${mins}m until fasting`
    targetText = "Eating window ends at 8:00 PM"
  } else {
    // During fasting window
    let fastingMinutes = 0
    let totalFastingMinutes = 16 * 60 // 16 hours
    
    if (currentHour >= eatingEndHour) {
      // After 8 PM, before midnight
      fastingMinutes = (currentHour - eatingEndHour) * 60 + currentMinute
    } else {
      // After midnight, before noon
      fastingMinutes = (24 - eatingEndHour + currentHour) * 60 + currentMinute
    }
    
    progress = (fastingMinutes / totalFastingMinutes) * 100
    
    const remainingMinutes = totalFastingMinutes - fastingMinutes
    const hours = Math.floor(remainingMinutes / 60)
    const mins = remainingMinutes % 60
    countdownText = hours > 0 ? `${hours}h ${mins}m until eating` : `${mins}m until eating`
    targetText = "Eating window starts at 12:00 PM"
  }

  // SVG circle calculations
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

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
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-secondary"
            />
            {/* Progress circle */}
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
              className={isEatingWindow ? "text-success" : "text-chart-1"}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`flex items-center gap-2 text-lg font-semibold ${isEatingWindow ? "text-success" : "text-chart-1"}`}>
              {isEatingWindow ? (
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
            <span className="text-2xl font-bold text-foreground mt-1">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium text-foreground">{countdownText}</p>
          <p className="text-sm text-muted-foreground">{targetText}</p>
        </div>
      </CardContent>
    </Card>
  )
}
