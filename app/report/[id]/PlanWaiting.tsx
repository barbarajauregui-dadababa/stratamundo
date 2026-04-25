'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GeneratePlanButton from './GeneratePlanButton'

const POLL_INTERVAL_MS = 7000
const TIMEOUT_MS = 4 * 60 * 1000 // 4 minutes — Plan Architect should finish in 1–3 min

interface Props {
  assessmentId: string
}

export default function PlanWaiting({ assessmentId }: Props) {
  const router = useRouter()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setElapsedMs(elapsed)
      if (elapsed >= TIMEOUT_MS) {
        setTimedOut(true)
        clearInterval(interval)
        return
      }
      // Refresh the route — server component re-renders, and if the plan
      // has landed in the database, the parent will render PlanDisplay
      // instead of <PlanWaiting/>.
      router.refresh()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [router])

  if (timedOut) {
    return (
      <section className="flex flex-col gap-3 rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-5">
        <div className="text-sm font-medium text-amber-900 dark:text-amber-200">
          Plan Architect didn&apos;t complete in time
        </div>
        <p className="text-sm text-amber-900/80 dark:text-amber-200/80">
          This sometimes happens on the first plan after a deploy. Click below to
          run it now.
        </p>
        <GeneratePlanButton assessmentId={assessmentId} />
      </section>
    )
  }

  const seconds = Math.floor(elapsedMs / 1000)
  return (
    <section className="flex items-center gap-3 rounded-md border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 px-5 py-4">
      <Spinner />
      <div className="flex-1">
        <div className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Plan Architect is working on your plan… ~1–3 minutes
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-500 mt-0.5">
          You can read the mastery map above while it works.{' '}
          {seconds > 0 && `(${seconds}s elapsed)`}
        </div>
      </div>
    </section>
  )
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-stone-500 dark:text-stone-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M12 2 a 10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
