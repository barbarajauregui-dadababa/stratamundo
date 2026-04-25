'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePlanButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runPlan() {
    if (isRunning) return
    setIsRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_id: assessmentId }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Plan generation failed with status ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Plan generation failed.'
      setError(message)
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={runPlan}
        disabled={isRunning}
        className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white disabled:opacity-50 hover:bg-stone-800 w-fit"
      >
        {isRunning
          ? 'Plan Architect is thinking… this can take 1–3 minutes'
          : 'Generate plan'}
      </button>
      {error && <p className="text-sm text-red-700 dark:text-red-300">{error}</p>}
    </div>
  )
}
