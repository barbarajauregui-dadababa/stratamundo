/**
 * Mastery Voyage — vertical scene of cloud strata across the 4th-grade
 * math Progressions.
 *
 * Five strata = the 5 CCSS-M Progressions for 4th grade. Below them,
 * the LAUNCH FROM THE FOUNDATION (ground, where every voyage begins).
 * The airship parks at the active Progression — currently Fractions
 * (the only one Strata Mundo has content for in v1).
 *
 * The cloudscape painting (Denis, 1786) becomes the full-bleed
 * atmospheric backdrop. Strata float over it; the painting darkens
 * toward the bottom, fades to bright atmosphere at the top.
 *
 * Per Barbara: 5 strata, not 6. Strata = Progressions, not IM Sections.
 * Sections live inside the Progression box on the report page.
 */
import Image from 'next/image'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface ProgressionDef {
  /** CCSS Domain code */
  code: string
  /** Display name */
  name: string
  /** Status in v1 */
  status: 'active' | 'v15'
  /** Roman numeral position (top to bottom in the visual; low = foundation) */
  index: number
}

/** The 5 4th-grade math Progressions, ordered low → high (visual top = high). */
const PROGRESSIONS: ProgressionDef[] = [
  { code: '4.G',   name: 'Geometry',                    status: 'v15',    index: 5 },
  { code: '4.MD',  name: 'Measurement & Data',          status: 'v15',    index: 4 },
  { code: '4.NF',  name: 'Number & Operations — Fractions', status: 'active', index: 3 },
  { code: '4.OA',  name: 'Operations & Algebraic Thinking', status: 'v15',    index: 2 },
  { code: '4.NBT', name: 'Number & Operations in Base Ten', status: 'v15',    index: 1 },
]

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
  /** Number of completed activities per standard. */
  completedByStandard?: Record<string, number>
}

export default function MasteryVoyage({ masteryMap }: Props) {
  // Counts within the active (Fractions) Progression — the only one
  // we have data for in v1.
  const counts = { demonstrated: 0, working: 0, misconception: 0, not_assessed: 0 }
  if (masteryMap?.standards) {
    for (const entry of Object.values(masteryMap.standards)) {
      counts[entry.state] = (counts[entry.state] ?? 0) + 1
    }
  }
  const totalProbed =
    counts.demonstrated + counts.working + counts.misconception
  const totalStandards = totalProbed + counts.not_assessed

  return (
    <div className="w-full max-w-4xl mx-auto">
      <section
        className="relative overflow-hidden rounded-sm border-2 border-brass-deep/50 vignette"
        style={{ minHeight: 720 }}
      >
        {/* Cloudscape painting full-bleed backdrop */}
        <div className="absolute inset-0">
          <Image
            src="/images/cloudscape-denis.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            style={{ filter: 'sepia(0.15) brightness(1.05) contrast(1.05)' }}
          />
          {/* Atmospheric darken: bottom warm-dark, mid clear, top sky-light */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, oklch(0.30 0.04 230 / 0.45) 0%, oklch(0.40 0.06 220 / 0.30) 30%, oklch(0.45 0.05 75 / 0.20) 60%, oklch(0.20 0.05 50 / 0.55) 92%, oklch(0.13 0.014 50 / 0.85) 100%)',
            }}
          />
        </div>

        {/* Top of frame — APEX label */}
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <p
            className="text-[10px] tracking-[0.4em] uppercase text-cream-soft"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Apex of the voyage
          </p>
        </div>

        {/* The 5 strata, stacked from index=5 (top) down to index=1 (bottom) */}
        <ol className="relative z-10 flex flex-col gap-1 px-6 sm:px-12 py-16">
          {PROGRESSIONS.map((p) => (
            <ProgressionStratum
              key={p.code}
              progression={p}
              counts={p.code === '4.NF' ? counts : null}
              totalProbed={p.code === '4.NF' ? totalProbed : 0}
              totalStandards={p.code === '4.NF' ? totalStandards : 0}
            />
          ))}
        </ol>

        {/* Ground / launch label */}
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <p
            className="text-[10px] tracking-[0.4em] uppercase text-cream-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◇ Launch from the foundation ◇
          </p>
        </div>

        {/* Subtle foreground vignette helper from class */}
      </section>

      <Legend />
    </div>
  )
}

function ProgressionStratum({
  progression,
  counts,
  totalProbed,
  totalStandards,
}: {
  progression: ProgressionDef
  counts: { demonstrated: number; working: number; misconception: number; not_assessed: number } | null
  totalProbed: number
  totalStandards: number
}) {
  const active = progression.status === 'active'
  return (
    <li
      className={`relative flex items-center gap-4 px-4 py-5 sm:py-6 rounded-sm transition-colors ${
        active
          ? 'border-2 border-brass-glow bg-paper/85 backdrop-blur-sm shadow-[0_0_25px_oklch(0.74_0.14_80/0.45)]'
          : 'border border-cream-faint/30 bg-background/40 backdrop-blur-sm opacity-70'
      }`}
    >
      {/* Code chip */}
      <div className="flex flex-col items-center justify-center min-w-[54px]">
        <span
          className={`text-xs ${active ? 'text-brass-deep' : 'text-cream-faint'}`}
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.12em' }}
        >
          {progression.code}
        </span>
      </div>

      {/* Title + body */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-base sm:text-lg leading-snug ${
            active ? 'text-ink' : 'text-cream-soft'
          }`}
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
        >
          {progression.name}
        </h3>
        {active && counts ? (
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-ink-soft"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <CountChip label="Mastered" value={counts.demonstrated} colorClass="bg-emerald-600" />
            <CountChip label="Working on" value={counts.working} colorClass="bg-amber-600" />
            <CountChip label="Needs attention" value={counts.misconception} colorClass="bg-red-600" />
            <CountChip label="Not yet probed" value={counts.not_assessed} colorClass="bg-stone-400" />
          </div>
        ) : (
          <p
            className="mt-1 text-[11px] italic text-cream-faint tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Coming in v1.5
          </p>
        )}
        {active && totalProbed > 0 && (
          <p
            className="mt-1 text-[11px] text-ink-faint italic"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            {totalProbed} of {totalStandards} standards probed so far.
          </p>
        )}
      </div>

      {/* Airship floats AT the active stratum (right side, animated) */}
      {active && (
        <div
          className="absolute right-2 sm:right-6 -top-12 sm:-top-16 animate-balloon-float ember-glow pointer-events-none"
          style={{ width: 88 }}
        >
          <Image
            src="/images/balloon-versailles.jpg"
            alt="Airship parked at the Fractions Progression"
            width={300}
            height={490}
            className="w-full h-auto"
            style={{ filter: 'sepia(0.4) brightness(1.05) contrast(1.05)', mixBlendMode: 'screen' }}
          />
          <p
            className="text-center text-[8px] tracking-[0.2em] uppercase text-brass-deep mt-1"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◊ You are here
          </p>
        </div>
      )}

      {/* Stratum number (Roman) on far left for the active one */}
      {active && (
        <div
          className="absolute left-2 -top-2 text-brass-deep"
          style={{ fontFamily: 'var(--font-cinzel)', fontSize: 14, letterSpacing: '0.15em' }}
        >
          STRATUM {romanFor(progression.index)}
        </div>
      )}
    </li>
  )
}

function CountChip({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} aria-hidden />
      <span className="text-ink-soft">
        <strong className="text-ink">{value}</strong> {label.toLowerCase()}
      </span>
    </span>
  )
}

function romanFor(n: number): string {
  return ['', 'I', 'II', 'III', 'IV', 'V'][n] ?? String(n)
}

function Legend() {
  const items: { color: string; label: string }[] = [
    { color: 'bg-emerald-600', label: 'Mastered' },
    { color: 'bg-amber-600', label: 'Working on' },
    { color: 'bg-red-600', label: 'Needs attention' },
    { color: 'bg-stone-400', label: 'Not yet probed' },
  ]
  return (
    <div
      className="mt-6 flex items-center justify-center gap-5 flex-wrap text-[11px] text-cream-soft"
      style={{ fontFamily: 'var(--font-special-elite)' }}
    >
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${it.color}`} aria-hidden />
          {it.label}
        </span>
      ))}
    </div>
  )
}
