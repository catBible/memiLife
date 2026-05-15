import { TaskList } from "@/components/task/task-list"
import { getAllTasks } from "@/lib/services/task"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TasksPage() {
  let tasks: Awaited<ReturnType<typeof getAllTasks>> = []
  let error: string | null = null
  try {
    tasks = await getAllTasks()
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {error && (
          <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <TaskList initialTasks={tasks} />
      </div>
    </div>
  )
}
