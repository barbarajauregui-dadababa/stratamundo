/**
 * Mastery Voyage — replaces the tree visualization.
 *
 * A vertical scene of cloud strata. Each stratum represents one IM Section
 * (the 7 published groupings — but with the bridge "Size and Location"
 * folded into its host). The airship floats at the section the learner is
 * currently working on. Earlier strata (mastered) shimmer brass-gold;
 * later strata (not yet reached) are faint and high in the sky.
 *
 * Within each stratum, individual standards are pinned as small markers
 * with state-colored dots. Hover for the standard name.
 *
 * The visual narrative: a voyage upward through layers of mastery.
 */
import coherenceMapRaw from '@/content/coherence-map-fractions.json'
import { Airship } from '@/app/CloudStrata'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface CoherenceNode {
  id: string
  name: string
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
function standardName(id: string): string {
  return coherenceMap.nodes.find((n) => n.id === id)?.name ?? id
}

interface SectionDef {
  id: number
  shortName: string
  fullName: string
  standardIds: string[]
}

/** The 7 IM Sections drawn from G3 U5 + G4 U2, ordered low → high. */
const SECTIONS: SectionDef[] = [
  {
    id: 1,
    shortName: 'Introduction to Fractions',
    fullName: 'Introduction to Fractions',
    standardIds: ['2.G.A.3', '3.G.A.2', '3.NF.A.1'],
  },
  {
    id: 2,
    shortName: 'Fractions on the Number Line',
    fullName: 'Fractions on the Number Line',
    standardIds: ['3.NF.A.2.a', '3.NF.A.2.b'],
  },
  {
    id: 3,
    shortName: 'Equivalent Fractions',
    fullName: 'Equivalent Fractions',
    standardIds: ['3.NF.A.3.a', '3.NF.A.3.b', '3.NF.A.3.c'],
  },
  {
    id: 4,
    shortName: 'Fraction Comparisons',
    fullName: 'Fraction Comparisons',
    standardIds: ['3.NF.A.3.d'],
  },
  {
    id: 5,
    shortName: 'Equivalent Fractions, 4th',
    fullName: 'Equivalent Fractions (4th grade)',
    standardIds: ['4.NF.A.1'],
  },
  {
    id: 6,
    shortName: 'Fraction Comparison, 4th',
    fullName: 'Fraction Comparison (4th grade)',
    standardIds: ['4.NF.A.2'],
  },
]

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
  /** Number of completed activities per standard (drives flower count). */
  completedByStandard?: Record<string, number>
}

export default function MasteryVoyage({ masteryMap, completedByStandard }: Props) {
  const stateOf = (sid: string): StandardState =>
    masteryMap?.standards?.[sid]?.state ?? 'not_assessed'

  // Section status — derived. A section is:
  //   "mastered"        if all its standards are demonstrated
  //   "current"         if it's the lowest section with any non-demonstrated standard
  //   "later"           anything above the current
  //   "not_yet_reached" same as later but visually distinct only if no standards probed
  const sectionStatus: Record<number, 'mastered' | 'current' | 'later'> = {}
  let currentFound = false
  for (const s of SECTIONS) {
    const allDemonstrated =
      s.standardIds.length > 0 &&
      s.standardIds.every((sid) => stateOf(sid) === 'demonstrated')
    if (allDemonstrated) {
      sectionStatus[s.id] = 'mastered'
    } else if (!currentFound) {
      sectionStatus[s.id] = 'current'
      currentFound = true
    } else {
      sectionStatus[s.id] = 'later'
    }
  }
  // If everything is mastered, no current; treat the topmost as "current".
  if (!currentFound) {
    sectionStatus[SECTIONS[SECTIONS.length - 1].id] = 'current'
  }

  // Layout — vertical stack, top = highest section, bottom = foundation.
  // SVG viewBox 600 wide × 1100 tall, sections distributed top-to-bottom with
  // section 6 at the top (the apex of the voyage) and section 1 at the
  // bottom (the foundation).
  const VB_W = 600
  const VB_H = 1100
  const SECTIONS_TOP = 110
  const SECTIONS_BOTTOM = 1010
  const layerSpacing = (SECTIONS_BOTTOM - SECTIONS_TOP) / (SECTIONS.length - 1)
  const orderedTopDown = [...SECTIONS].reverse() // visually: high section first
  const yOf = (idx: number) => SECTIONS_TOP + idx * layerSpacing

  // Find the current section's vertical position — that's where the airship
  // floats.
  const currentIndex = orderedTopDown.findIndex(
    (s) => sectionStatus[s.id] === 'current',
  )
  const airshipY =
    currentIndex >= 0 ? yOf(currentIndex) : yOf(orderedTopDown.length - 1)

  return (
    <div className="w-full max-w-3xl mx-auto">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        aria-label="Mastery voyage visualization"
      >
        <defs>
          {/* Sky gradient — top of frame is upper atmosphere, bottom is warm haze */}
          <linearGradient id="voyage-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.04 235)" />
            <stop offset="40%" stopColor="oklch(0.92 0.025 75)" />
            <stop offset="100%" stopColor="oklch(0.85 0.06 55)" />
          </linearGradient>

          {/* Cloud fills, three states */}
          <radialGradient id="cloud-mastered" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="oklch(0.94 0.03 78 / 0.95)" />
            <stop offset="80%" stopColor="oklch(0.78 0.10 78 / 0.85)" />
            <stop offset="100%" stopColor="oklch(0.66 0.12 78 / 0.55)" />
          </radialGradient>
          <radialGradient id="cloud-current" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="oklch(0.99 0.012 75 / 0.95)" />
            <stop offset="80%" stopColor="oklch(0.92 0.025 75 / 0.85)" />
            <stop offset="100%" stopColor="oklch(0.78 0.04 70 / 0.55)" />
          </radialGradient>
          <radialGradient id="cloud-later" cx="0.5" cy="0.5" r="0.6">
            <stop offset="0%" stopColor="oklch(0.96 0.012 75 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.88 0.018 75 / 0.15)" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#voyage-sky)" />

        {/* Foundation/ground glow at the bottom */}
        <rect
          x="0"
          y={SECTIONS_BOTTOM + 20}
          width={VB_W}
          height={VB_H - SECTIONS_BOTTOM - 20}
          fill="oklch(0.82 0.07 55 / 0.3)"
        />
        <line
          x1="40"
          y1={SECTIONS_BOTTOM + 30}
          x2={VB_W - 40}
          y2={SECTIONS_BOTTOM + 30}
          stroke="oklch(0.45 0.10 65 / 0.45)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <text
          x={VB_W / 2}
          y={SECTIONS_BOTTOM + 56}
          textAnchor="middle"
          fontSize="10"
          fontFamily="var(--font-cinzel)"
          fill="oklch(0.45 0.10 65 / 0.85)"
          letterSpacing="3"
        >
          FOUNDATION
        </text>

        {/* Cloud strata */}
        {orderedTopDown.map((section, idx) => {
          const y = yOf(idx)
          const status = sectionStatus[section.id]
          return (
            <g key={section.id}>
              {/* Cloud body — wide ellipse */}
              <ellipse
                cx={VB_W / 2}
                cy={y}
                rx={210}
                ry={36}
                fill={
                  status === 'mastered'
                    ? 'url(#cloud-mastered)'
                    : status === 'current'
                      ? 'url(#cloud-current)'
                      : 'url(#cloud-later)'
                }
              />
              {/* Bumpy cloud top + bottom — small ellipse clusters */}
              {[-150, -100, -50, 0, 50, 100, 150].map((dx, i) => (
                <ellipse
                  key={`bump-${section.id}-${i}`}
                  cx={VB_W / 2 + dx}
                  cy={y - 14 + (i % 2) * 6}
                  rx={26}
                  ry={14}
                  fill={
                    status === 'mastered'
                      ? 'oklch(0.92 0.05 78 / 0.85)'
                      : status === 'current'
                        ? 'oklch(0.97 0.015 75 / 0.85)'
                        : 'oklch(0.94 0.014 75 / 0.35)'
                  }
                />
              ))}

              {/* Section label — left side, copperplate caps */}
              <text
                x={40}
                y={y - 18}
                fontSize="11"
                fontFamily="var(--font-cinzel)"
                fill={
                  status === 'mastered'
                    ? 'oklch(0.40 0.10 65)'
                    : status === 'current'
                      ? 'oklch(0.22 0.018 55)'
                      : 'oklch(0.62 0.014 55)'
                }
                letterSpacing="1.5"
                fontWeight={status === 'current' ? 700 : 500}
              >
                {`STRATUM ${toRoman(section.id)} · ${section.shortName.toUpperCase()}`}
              </text>
              {/* Status badge */}
              <text
                x={40}
                y={y - 4}
                fontSize="9"
                fontFamily="var(--font-special-elite)"
                fill={
                  status === 'mastered'
                    ? 'oklch(0.45 0.13 145)'
                    : status === 'current'
                      ? 'oklch(0.50 0.13 42)'
                      : 'oklch(0.62 0.014 55)'
                }
              >
                {status === 'mastered'
                  ? '✓ mastered'
                  : status === 'current'
                    ? '◊ current voyage'
                    : 'awaiting'}
              </text>

              {/* Standard markers — small dots clustered around the cloud */}
              <g>
                {section.standardIds.map((sid, i) => {
                  const n = section.standardIds.length
                  const dx = n === 1 ? 0 : (i - (n - 1) / 2) * 38
                  const cx = VB_W / 2 + dx + 80
                  const cy = y + 8
                  const completed = completedByStandard?.[sid] ?? 0
                  return (
                    <StandardMarker
                      key={sid}
                      cx={cx}
                      cy={cy}
                      state={stateOf(sid)}
                      label={standardName(sid)}
                      completed={completed}
                    />
                  )
                })}
              </g>
            </g>
          )
        })}

        {/* Airship — positioned at the current section, gently floating */}
        <g transform={`translate(${VB_W / 2 - 60} ${airshipY - 130})`}>
          <foreignObject x="0" y="0" width="120" height="140">
            <div className="animate-balloon-float w-full h-full flex items-center justify-center">
              {/* Inline SVG inside foreignObject so the animation utility class works */}
              <Airship className="h-full w-auto text-brass-deep" />
            </div>
          </foreignObject>
        </g>

        {/* Voyage axis label — right side */}
        <text
          x={VB_W - 30}
          y={SECTIONS_TOP - 10}
          fontSize="9"
          fontFamily="var(--font-cinzel)"
          fill="oklch(0.45 0.10 65 / 0.7)"
          letterSpacing="3"
          textAnchor="end"
        >
          ASCENT
        </text>
        <text
          x={VB_W - 30}
          y={SECTIONS_BOTTOM + 5}
          fontSize="9"
          fontFamily="var(--font-cinzel)"
          fill="oklch(0.45 0.10 65 / 0.7)"
          letterSpacing="3"
          textAnchor="end"
        >
          DEPARTURE
        </text>
      </svg>

      <Legend />
    </div>
  )
}

/**
 * Per-standard marker on a cloud stratum. State-colored, with a small
 * pennant (flower analog) for each completed activity.
 */
function StandardMarker({
  cx,
  cy,
  state,
  label,
  completed,
}: {
  cx: number
  cy: number
  state: StandardState
  label: string
  completed: number
}) {
  const fill = markerFill(state)
  const stroke = markerStroke(state)
  return (
    <g>
      <title>{`${label} — ${stateLabel(state)}${completed > 0 ? ` · ${completed} activity completed` : ''}`}</title>
      {/* Pennant pole */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - 18} stroke="oklch(0.30 0.04 50)" strokeWidth="0.9" />
      {/* Flag */}
      <path
        d={`M ${cx} ${cy - 18} L ${cx + 10} ${cy - 14} L ${cx} ${cy - 10} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth="0.8"
      />
      {/* Pole base dot */}
      <circle cx={cx} cy={cy} r="2.6" fill={fill} stroke={stroke} strokeWidth="0.8" />
      {/* Completed-activity pennants — small dots above the flag */}
      {Array.from({ length: Math.min(completed, 3) }).map((_, i) => (
        <circle
          key={i}
          cx={cx + 8 + i * 5}
          cy={cy - 22 - i * 3}
          r="1.6"
          fill="oklch(0.65 0.13 78)"
          stroke="oklch(0.40 0.10 65)"
          strokeWidth="0.5"
        />
      ))}
    </g>
  )
}

function markerFill(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return 'oklch(0.55 0.13 145)'
    case 'working':
      return 'oklch(0.70 0.13 70)'
    case 'misconception':
      return 'oklch(0.55 0.18 25)'
    case 'not_assessed':
      return 'oklch(0.78 0.014 75)'
  }
}

function markerStroke(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return 'oklch(0.34 0.13 145)'
    case 'working':
      return 'oklch(0.42 0.13 70)'
    case 'misconception':
      return 'oklch(0.34 0.18 25)'
    case 'not_assessed':
      return 'oklch(0.55 0.014 75)'
  }
}

function stateLabel(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return 'Mastered'
    case 'working':
      return 'Working on'
    case 'misconception':
      return 'Needs attention'
    case 'not_assessed':
      return 'Not yet probed'
  }
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let result = ''
  for (const [v, s] of map) {
    while (n >= v) {
      result += s
      n -= v
    }
  }
  return result
}

function Legend() {
  const items: { state: StandardState; label: string }[] = [
    { state: 'demonstrated', label: 'Mastered' },
    { state: 'working', label: 'Working on' },
    { state: 'misconception', label: 'Needs attention' },
    { state: 'not_assessed', label: 'Not yet probed' },
  ]
  return (
    <div
      className="mt-6 flex items-center justify-center gap-5 flex-wrap text-[11px] text-ink-soft"
      style={{ fontFamily: 'var(--font-special-elite)' }}
    >
      {items.map((it) => (
        <span key={it.state} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full border"
            style={{ backgroundColor: markerFill(it.state), borderColor: markerStroke(it.state) }}
            aria-hidden
          />
          {it.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: 'oklch(0.65 0.13 78)' }}
          aria-hidden
        />
        Pennant = completed activity
      </span>
    </div>
  )
}
