'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CompletedActivity {
  resource_id: string
  done_at: string
}

interface Resource {
  id: string
  title: string
  modality: string
  source_site?: string
  url?: string | null
}

interface Props {
  planId: string
  order: number
  resourceId: string
  rationale: string
  resource: Resource | undefined
  completedAt: string | null
  /** All completed activities currently stored on the plan; needed for optimistic update. */
  allCompleted: CompletedActivity[]
}

export default function ActivityTile({
  planId,
  order,
  resourceId,
  rationale,
  resource,
  completedAt: initialCompletedAt,
  allCompleted,
}: Props) {
  const supabase = createClient()
  const [completedAt, setCompletedAt] = useState<string | null>(initialCompletedAt)
  const [isPending, startTransition] = useTransition()
  const [showWhy, setShowWhy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDone() {
    setError(null)
    const wasCompleted = completedAt !== null
    const now = new Date().toISOString()
    const optimistic = wasCompleted ? null : now
    setCompletedAt(optimistic)

    startTransition(async () => {
      const { data: row, error: readErr } = await supabase
        .from('plans')
        .select('plan_content')
        .eq('id', planId)
        .single()
      if (readErr || !row) {
        setCompletedAt(wasCompleted ? initialCompletedAt : null)
        setError('Could not save — please retry.')
        return
      }
      const content = row.plan_content as { _completed_activities?: CompletedActivity[] }
      const current = content._completed_activities ?? allCompleted
      const next = wasCompleted
        ? current.filter((c) => c.resource_id !== resourceId)
        : [...current.filter((c) => c.resource_id !== resourceId), { resource_id: resourceId, done_at: now }]

      const { error: writeErr } = await supabase
        .from('plans')
        .update({ plan_content: { ...content, _completed_activities: next } })
        .eq('id', planId)
      if (writeErr) {
        setCompletedAt(wasCompleted ? initialCompletedAt : null)
        setError('Could not save — please retry.')
      }
    })
  }

  const isDone = completedAt !== null
  const title = resource?.title ?? resourceId

  return (
    <li
      className={`rounded-md border p-3 transition-colors ${
        isDone
          ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-900'
          : 'bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              isDone
                ? 'bg-green-600 text-white'
                : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            }`}
            aria-hidden
          >
            {isDone ? '✓' : order}
          </span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className={`font-medium text-sm ${isDone ? 'line-through text-zinc-500' : ''}`}>
              {title}
            </span>
            {resource?.modality && (
              <span className="text-xs text-zinc-500">
                {resource.modality}
                {resource.source_site && !resource.url ? ` · ${resource.source_site}` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {resource?.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-700 dark:text-blue-300 hover:underline whitespace-nowrap"
            >
              Open ↗
            </a>
          )}
          <button
            type="button"
            onClick={toggleDone}
            disabled={isPending}
            className={`inline-flex h-7 items-center justify-center rounded-md px-2.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              isDone
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
          >
            {isDone ? 'Done' : 'Mark done'}
          </button>
        </div>
      </div>
      {isDone && completedAt && (
        <div className="mt-1 ml-8 text-xs text-green-700 dark:text-green-400">
          Completed {new Date(completedAt).toLocaleString()}
        </div>
      )}
      <div className="mt-2 ml-8">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {showWhy ? 'Hide rationale' : 'Why this activity?'}
        </button>
        {showWhy && (
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {rationale}
          </p>
        )}
      </div>
      {error && <p className="mt-1 ml-8 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </li>
  )
}
