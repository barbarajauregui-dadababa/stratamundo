import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyzeButton from './AnalyzeButton'
import GeneratePlanButton from './GeneratePlanButton'
import PlanDisplay, { type PlanContent } from './PlanDisplay'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'
import misconceptionsRaw from '@/content/fractions-misconceptions.json'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface StandardReport {
  state: StandardState
  evidence_problem_ids: string[]
  flagged_misconception_ids: string[]
  reasoning: string
}

interface MasteryMap {
  standards: Record<string, StandardReport>
  overall_notes: string
}

interface CoherenceNode {
  id: string
  name: string
  statement: string
  grade: number
  role: 'prerequisite' | 'core'
  layer: number
}

interface Misconception {
  id: string
  name: string
}

const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
const misconceptions = misconceptionsRaw as unknown as { misconceptions: Misconception[] }

function standardName(id: string): string {
  return coherenceMap.nodes.find((n) => n.id === id)?.name ?? id
}

function misconceptionName(id: string): string {
  return misconceptions.misconceptions.find((m) => m.id === id)?.name ?? id
}

function sortedByLayer(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const la = coherenceMap.nodes.find((n) => n.id === a)?.layer ?? 99
    const lb = coherenceMap.nodes.find((n) => n.id === b)?.layer ?? 99
    if (la !== lb) return la - lb
    return a.localeCompare(b)
  })
}

export default async function ReportPage(props: PageProps<'/report/[id]'>) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('id, type, completed_at, mastery_map, learner_id, learners(name)')
    .eq('id', id)
    .single()

  if (error || !assessment) notFound()

  const learnerName = Array.isArray(assessment.learners)
    ? assessment.learners[0]?.name
    : (assessment.learners as { name: string } | null)?.name
  const displayName = learnerName ?? 'Learner'

  const masteryMap = assessment.mastery_map as MasteryMap | null
  const isCompleted = !!assessment.completed_at

  // Fetch the active plan for this assessment (if Plan Architect has run).
  let planContent: PlanContent | null = null
  let planGeneratedAt: string | null = null
  if (masteryMap) {
    const { data: planRow } = await supabase
      .from('plans')
      .select('plan_content, generated_at')
      .eq('assessment_id', id)
      .eq('status', 'active')
      .maybeSingle()
    if (planRow) {
      planContent = planRow.plan_content as PlanContent
      planGeneratedAt = planRow.generated_at as string
    }
  }

  // Bucket standards by state (hide not_assessed per Barbara's Q6 decision).
  const byState = {
    misconception: [] as string[],
    working: [] as string[],
    demonstrated: [] as string[],
  }
  if (masteryMap) {
    for (const [sid, r] of Object.entries(masteryMap.standards)) {
      if (r.state === 'not_assessed') continue
      byState[r.state].push(sid)
    }
  }

  return (
    <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col gap-8 py-12 px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Report</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Mastery map for <strong>{displayName}</strong>
          {isCompleted
            ? ` — completed ${new Date(assessment.completed_at!).toLocaleString()}`
            : ' — not yet completed'}
        </p>
      </header>

      {!isCompleted && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          This assessment has not been submitted yet. Finish it before running analysis.
        </div>
      )}

      {isCompleted && !masteryMap && (
        <section className="flex flex-col gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-medium">Step 1 — Analyze the responses</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Run analysis to produce the mastery map.
          </p>
          <AnalyzeButton assessmentId={id} />
        </section>
      )}

      {masteryMap && (
        <>
          {/* Banner summary — prefers plan's overall_notes if a plan exists,
              otherwise falls back to the mastery map's overall_notes. */}
          {(planContent?.overall_notes ?? masteryMap.overall_notes) && (
            <section className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 text-sm leading-relaxed">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Summary
              </div>
              {planContent?.overall_notes ?? masteryMap.overall_notes}
            </section>
          )}

          {/* Three buckets: red (attention), yellow (working), green (demonstrated). */}
          <section className="flex flex-col gap-4">
            <Bucket
              title="Needs attention"
              subtitle="Misconceptions detected. Start here."
              dot="bg-red-500"
              containerClass="bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900"
              standardIds={sortedByLayer(byState.misconception)}
              masteryMap={masteryMap}
              plan={planContent}
              defaultOpen
            />
            <Bucket
              title="Working on it"
              subtitle="Partial understanding. Support with activities."
              dot="bg-yellow-500"
              containerClass="bg-yellow-50/60 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
              standardIds={sortedByLayer(byState.working)}
              masteryMap={masteryMap}
              plan={planContent}
              defaultOpen
            />
            <Bucket
              title="Demonstrated"
              subtitle="Solid — no action needed this week."
              dot="bg-green-500"
              containerClass="bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-900"
              standardIds={sortedByLayer(byState.demonstrated)}
              masteryMap={masteryMap}
              plan={planContent}
              defaultOpen={false}
            />
          </section>

          {/* Plan generation action / status. */}
          {!planContent && (
            <section className="flex flex-col gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-medium">Step 2 — Generate plan</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                The Plan Architect reads the mastery map above and prescribes 2–3
                activities per priority gap. Takes 1–3 minutes.
              </p>
              <GeneratePlanButton assessmentId={id} />
            </section>
          )}
          {planContent && (
            <>
              <div className="text-xs text-zinc-500">
                Plan generated{' '}
                {planGeneratedAt && new Date(planGeneratedAt).toLocaleString()}.{' '}
                <GeneratePlanButton assessmentId={id} />
              </div>
              <PlanDisplay plan={planContent} />
            </>
          )}
        </>
      )}
    </main>
  )
}

function Bucket({
  title,
  subtitle,
  dot,
  containerClass,
  standardIds,
  masteryMap,
  plan,
  defaultOpen,
}: {
  title: string
  subtitle: string
  dot: string
  containerClass: string
  standardIds: string[]
  masteryMap: MasteryMap
  plan: PlanContent | null
  defaultOpen: boolean
}) {
  if (standardIds.length === 0) return null
  return (
    <details open={defaultOpen} className={`rounded-md border ${containerClass}`}>
      <summary className="cursor-pointer px-4 py-3 flex items-center gap-3 list-none">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="font-medium">{title}</span>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">({standardIds.length})</span>
        <span className="text-xs text-zinc-500 ml-2">{subtitle}</span>
      </summary>
      <ul className="flex flex-col gap-3 px-4 pb-4">
        {standardIds.map((sid) => {
          const report = masteryMap.standards[sid]
          const gap = plan?.priority_gaps.find((g) => g.standard_id === sid)
          return (
            <li
              key={sid}
              className="rounded-md bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{standardName(sid)}</span>
                  <span className="text-xs font-mono text-zinc-500">{sid}</span>
                </div>
              </div>
              {report.reasoning && (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {report.reasoning}
                </p>
              )}
              {report.flagged_misconception_ids.length > 0 && (
                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  Flagged:{' '}
                  {report.flagged_misconception_ids.map((m) => misconceptionName(m)).join(', ')}
                </div>
              )}
              {report.evidence_problem_ids.length > 0 && (
                <div className="mt-1 text-xs font-mono text-zinc-500">
                  Evidence: {report.evidence_problem_ids.join(', ')}
                </div>
              )}
              {gap && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">
                    Prescribed activities
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                    {gap.rationale_for_this_gap}
                  </p>
                  <ol className="text-sm text-zinc-700 dark:text-zinc-300 list-decimal ml-5 space-y-1">
                    {gap.activities
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((act) => (
                        <li key={act.resource_id}>
                          <span className="font-medium">
                            {act.resource_id}
                          </span>
                          : {act.rationale}
                        </li>
                      ))}
                  </ol>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </details>
  )
}
