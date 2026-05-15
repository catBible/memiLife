"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createTask, updateTask } from "@/lib/services/task"
import type { Task, TaskPatchBody, TaskWriteBody } from "@/types/task"

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocalValue(v: string): string | undefined {
  if (!v.trim()) return undefined
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString()
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  task: Task | null
  onSaved: () => void
}

export function TaskForm({ open, onOpenChange, mode, task, onSaved }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<string>("TODO")
  const [priority, setPriority] = useState("2")
  const [tagsRaw, setTagsRaw] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (mode === "edit" && task) {
      setTitle(task.title)
      setDescription(task.description ?? "")
      setStatus(task.status ?? "TODO")
      setPriority(String(task.priority ?? 2))
      setTagsRaw((task.tags ?? []).join(", "))
      setScheduledAt(toDatetimeLocalValue(task.scheduledAt))
      setEndAt(toDatetimeLocalValue(task.endAt))
      setDueAt(toDatetimeLocalValue(task.dueAt))
      setDurationMinutes(
        task.durationMinutes != null ? String(task.durationMinutes) : "",
      )
      setNote(task.note ?? "")
    } else {
      setTitle("")
      setDescription("")
      setStatus("TODO")
      setPriority("2")
      setTagsRaw("")
      setScheduledAt("")
      setEndAt("")
      setDueAt("")
      setDurationMinutes("")
      setNote("")
    }
  }, [open, mode, task])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError("กรุณากรอกหัวข้อ")
      return
    }
    const tags = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    const dur =
      durationMinutes.trim() === ""
        ? undefined
        : Number.parseInt(durationMinutes, 10)
    if (durationMinutes.trim() !== "" && Number.isNaN(dur)) {
      setError("ระยะเวลา (นาที) ต้องเป็นตัวเลข")
      return
    }
    if (dur != null && dur < 0) {
      setError("ระยะเวลา (นาที) ต้องไม่ติดลบ")
      return
    }
    const pri = Number.parseInt(priority, 10)
    if (Number.isNaN(pri)) {
      setError("ความสำคัญต้องเป็นตัวเลข")
      return
    }
    setSaving(true)
    try {
      if (mode === "create") {
        const body: TaskWriteBody = {
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority: pri,
          tags: tags.length ? tags : undefined,
          scheduledAt: fromDatetimeLocalValue(scheduledAt),
          endAt: fromDatetimeLocalValue(endAt),
          dueAt: fromDatetimeLocalValue(dueAt),
          durationMinutes: dur,
          note: note.trim() || undefined,
        }
        await createTask(body)
      } else if (task) {
        const patch: TaskPatchBody = {
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority: pri,
          tags,
          scheduledAt: fromDatetimeLocalValue(scheduledAt) ?? null,
          endAt: fromDatetimeLocalValue(endAt) ?? null,
          dueAt: fromDatetimeLocalValue(dueAt) ?? null,
          durationMinutes: dur ?? null,
          note: note.trim() || null,
        }
        await updateTask(task.id, patch)
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "เพิ่มงาน" : "แก้ไขงาน"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="task-title">หัวข้อ</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-desc">รายละเอียด</Label>
              <Textarea
                id="task-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>สถานะ</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-pri">ความสำคัญ (0–32767)</Label>
                <Input
                  id="task-pri"
                  type="number"
                  min={0}
                  max={32767}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-tags">แท็ก (คั่นด้วยจุลภาค)</Label>
              <Input
                id="task-tags"
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                placeholder="home, urgent"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="task-sch">เริ่ม (local)</Label>
                <Input
                  id="task-sch"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-end">จบ (local)</Label>
                <Input
                  id="task-end"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-due">ครบกำหนด (local)</Label>
                <Input
                  id="task-due"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-dur">ระยะเวลานับถอยหลัง (นาที)</Label>
              <Input
                id="task-dur"
                type="number"
                min={0}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="เช่น 15"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-note">บันทึก</Label>
              <Textarea
                id="task-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "บันทึก…" : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
