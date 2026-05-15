"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { updateSchedule } from "@/lib/services/task"
import type { Task } from "@/types/task"

function timeFromIso(iso?: string | null): string {
  if (!iso) return "09:00"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "09:00"
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function dateFromIso(iso?: string | null): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function combineToIso(date: Date | undefined, timeHHMM: string): string | undefined {
  if (!date) return undefined
  const [hh, mm] = timeHHMM.split(":").map((x) => Number.parseInt(x, 10))
  const d = new Date(date)
  d.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0)
  return d.toISOString()
}

type Props = {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ScheduleEdit({ task, open, onOpenChange, onSaved }: Props) {
  const [schDate, setSchDate] = useState<Date | undefined>()
  const [schTime, setSchTime] = useState("09:00")
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [endTime, setEndTime] = useState("10:00")
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [dueTime, setDueTime] = useState("17:00")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !task) return
    setError(null)
    setSchDate(dateFromIso(task.scheduledAt))
    setSchTime(timeFromIso(task.scheduledAt))
    setEndDate(dateFromIso(task.endAt))
    setEndTime(timeFromIso(task.endAt))
    setDueDate(dateFromIso(task.dueAt))
    setDueTime(timeFromIso(task.dueAt))
  }, [open, task])

  async function handleSave() {
    if (!task) return
    const scheduledAt = combineToIso(schDate, schTime)
    const endAt = combineToIso(endDate, endTime)
    const dueAt = combineToIso(dueDate, dueTime)
    if (!scheduledAt && !endAt && !dueAt) {
      setError("เลือกอย่างน้อยหนึ่งวันเวลา")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateSchedule(task.id, { scheduledAt, endAt, dueAt })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ตารางเวลา</DialogTitle>
        </DialogHeader>
        {!task ? (
          <p className="text-sm text-muted-foreground">ไม่มีงานที่เลือก</p>
        ) : (
          <div className="grid gap-6 py-2">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <ScheduleRow
              label="เวลาเริ่ม (scheduled)"
              date={schDate}
              onDate={setSchDate}
              time={schTime}
              onTime={setSchTime}
            />
            <ScheduleRow
              label="เวลาจบ (end)"
              date={endDate}
              onDate={setEndDate}
              time={endTime}
              onTime={setEndTime}
            />
            <ScheduleRow
              label="Deadline (due)"
              date={dueDate}
              onDate={setDueDate}
              time={dueTime}
              onTime={setDueTime}
            />
            <p className="text-xs text-muted-foreground">
              เก็บเป็น UTC บนเซิร์ฟเวอร์ — เลือกวัน/เวลาตาม timezone ของเบราว์เซอร์
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ปิด
          </Button>
          <Button disabled={!task || saving} onClick={() => void handleSave()}>
            {saving ? "บันทึก…" : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScheduleRow({
  label,
  date,
  onDate,
  time,
  onTime,
}: {
  label: string
  date: Date | undefined
  onDate: (d: Date | undefined) => void
  time: string
  onTime: (t: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-w-[10rem] justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              {date ? format(date, "PPP") : "เลือกวัน"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          className="w-32"
          value={time}
          onChange={(e) => onTime(e.target.value)}
        />
      </div>
    </div>
  )
}
