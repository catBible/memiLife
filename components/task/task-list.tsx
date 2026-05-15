"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteTask as deleteTaskRemote } from "@/lib/services/task"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduleEdit } from "@/components/task/schedule-edit"
import { TaskDeleteDialog } from "@/components/task/task-delete-dialog"
import { TaskForm } from "@/components/task/task-form"
import { TaskTimer } from "@/components/task/task-timer"
import type { Task } from "@/types/task"

type Props = {
  initialTasks: Task[]
}

export function TaskList({ initialTasks }: Props) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [scheduleTask, setScheduleTask] = useState<Task | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  function refresh() {
    router.refresh()
  }

  function openCreate() {
    setFormMode("create")
    setEditTask(null)
    setFormOpen(true)
  }

  function openEdit(t: Task) {
    setFormMode("edit")
    setEditTask(t)
    setFormOpen(true)
  }

  function openSchedule(t: Task) {
    setScheduleTask(t)
    setScheduleOpen(true)
  }

  function openDelete(t: Task) {
    setDeleteTask(t)
    setDeleteOpen(true)
  }

  function replaceTask(updated: Task) {
    setTasks((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Memi Task</h1>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">← Dashboard</Link>
          </Button>
          <Button type="button" onClick={openCreate}>
            เพิ่มงาน
          </Button>
        </div>
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        task={editTask}
        onSaved={refresh}
      />

      <ScheduleEdit
        task={scheduleTask}
        open={scheduleOpen}
        onOpenChange={(o) => {
          setScheduleOpen(o)
          if (!o) setScheduleTask(null)
        }}
        onSaved={refresh}
      />

      <TaskDeleteDialog
        task={deleteTask}
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o)
          if (!o) setDeleteTask(null)
        }}
        loading={deleteLoading}
        onConfirm={async () => {
          if (!deleteTask) return
          setDeleteLoading(true)
          try {
            await deleteTaskRemote(deleteTask.id)
            setDeleteOpen(false)
            setDeleteTask(null)
            refresh()
          } finally {
            setDeleteLoading(false)
          }
        }}
      />

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            ยังไม่มีงาน — กด &quot;เพิ่มงาน&quot; เพื่อสร้างรายการแรก
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li key={t.id}>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {t.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {t.status} · priority {t.priority}
                      {(t.tags?.length ?? 0) > 0
                        ? ` · ${(t.tags ?? []).join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(t)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openSchedule(t)}
                    >
                      ตาราง
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => openDelete(t)}
                    >
                      ลบ
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {t.description && (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {t.description}
                    </p>
                  )}
                  <TaskTimer task={t} onTimerChange={replaceTask} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
