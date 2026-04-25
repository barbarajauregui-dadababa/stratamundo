import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MasteryVoyage from './MasteryVoyage'
import { OrnamentalRule } from '@/app/Ornament'

interface MasteryMap {
  standards: Record<string, { state: 'misconception' | 'working' | 'demonstrated' | 'not_assessed' }>
}

export default async function LearnerDashboardPage(
  props: PageProps<'/learner/[id]'>
) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: learner, error: learnerErr } = await supabase
    .from('learners')
    .select('id, name, age, grade_level')
    .eq('id', id)
    .single()
  if (learnerErr || !learner) notFound()

  const { data: assessments } = await supabase
    .from('assessments')
    .select('id, completed_at, mastery_map, type')
    .eq('learner_id', id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const latest = assessments?.[0]
  const masteryMap = (latest?.mastery_map as MasteryMap | null) ?? null

  // Count completed activities per standard (drives pennant count).
  const completedByStandard: Record<string, number> = {}
  if (latest) {
    const { data: planRow } = await supabase
      .from('plans')
      .select('plan_content')
      .eq('assessment_id', latest.id)
      .eq('status', 'active')
      .maybeSingle()
    type PlanShape = {
      priority_gaps?: { standard_id: string; activities: { resource_id: string }[] }[]
      _completed_activities?: { resource_id: string }[]
    }
    const plan = (planRow?.plan_content as PlanShape | null) ?? null
    if (plan) {
      const completedIds = new Set(
        (plan._completed_activities ?? []).map((c) => c.resource_id)
      )
      for (const gap of plan.priority_gaps ?? []) {
        for (const act of gap.activities ?? []) {
          if (completedIds.has(act.resource_id)) {
            completedByStandard[gap.standard_id] =
              (completedByStandard[gap.standard_id] ?? 0) + 1
          }
        }
      }
    }
  }

  const counts = { demonstrated: 0, working: 0, misconception: 0, not_assessed: 0, total: 11 }
  if (masteryMap?.standards) {
    for (const entry of Object.values(masteryMap.standards)) {
      counts[entry.state] = (counts[entry.state] ?? 0) + 1
    }
  } else {
    counts.not_assessed = 11
  }

  return (
    <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col gap-8 py-10 px-6">
      <header className="flex flex-col gap-2 items-center text-center">
        <p
          className="text-[10px] tracking-[0.3em] uppercase text-ink-faint"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Mastery voyage of
        </p>
        <h1
          className="text-3xl sm:text-4xl tracking-tight text-ink"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
        >
          {learner.name}
        </h1>
        {latest?.completed_at && (
          <p
            className="text-[11px] text-ink-faint italic mt-1"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            Snapshot from{' '}
            {new Date(latest.completed_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {!latest && (
          <p className="text-sm text-ink-soft">
            No completed assessments yet — every stratum awaits your first probe.
          </p>
        )}
        <OrnamentalRule className="h-4 text-brass-deep/50 mt-3" width={240} />
      </header>

      {/* Counts strip — now in a brass-bordered ledger style */}
      <section className="flex items-center justify-center gap-4 sm:gap-8 rounded-md border-2 border-brass-deep/40 bg-paper-deep/50 px-6 py-5 text-sm">
        <Stat label="Mastered" value={counts.demonstrated} accent="text-emerald-700" />
        <Divider />
        <Stat label="Working on" value={counts.working} accent="text-amber-700" />
        <Divider />
        <Stat label="Needs attention" value={counts.misconception} accent="text-red-700" />
        <Divider />
        <Stat label="Not yet probed" value={counts.not_assessed} accent="text-stone-500" />
      </section>

      <MasteryVoyage
        masteryMap={masteryMap}
        completedByStandard={completedByStandard}
      />

      <section className="flex flex-wrap gap-3 pt-4 border-t border-stone-300/60 justify-center">
        {latest && (
          <Link
            href={`/report/${latest.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-5 text-sm font-semibold tracking-wider uppercase text-paper hover:bg-ink-soft"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            View latest report
          </Link>
        )}
        <Link
          href="/setup"
          className="inline-flex h-10 items-center justify-center rounded-md border-2 border-brass-deep/60 px-5 text-sm font-semibold tracking-wider uppercase text-ink hover:bg-paper-deep"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Begin a new voyage
        </Link>
      </section>

      <footer
        className="text-[10px] text-ink-faint italic text-center"
        style={{ fontFamily: 'var(--font-special-elite)' }}
      >
        Strata structure from Illustrative Mathematics, Grade 3 Unit 5 and Grade 4 Unit 2 (CC BY 4.0).
      </footer>
    </main>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`text-3xl ${accent}`}
        style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700 }}
      >
        {value}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.18em] text-ink-faint mt-1"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <span className="h-9 w-px bg-brass-deep/30" aria-hidden />
}
