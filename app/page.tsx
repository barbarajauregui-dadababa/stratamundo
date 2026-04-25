import Link from 'next/link'
import { CloudStrata, Airship } from './CloudStrata'
import {
  CartoucheFrame,
  CornerFlourish,
  Gear,
  OrnamentalRule,
  RomanNumeral,
} from './Ornament'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* HERO — cartouche-framed brand over cloud-strata sky with ascending airship */}
      <section className="relative overflow-hidden border-b border-stone-300/60">
        <CloudStrata />

        {/* Slow-turning gear in upper-right corner — distant ornament */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-12 text-brass-deep/35 pointer-events-none animate-turn-slow">
          <Gear className="h-20 w-20 sm:h-28 sm:w-28" teeth={14} />
        </div>
        <div className="absolute top-20 right-32 hidden sm:block text-brass-deep/25 pointer-events-none animate-turn-slow-reverse">
          <Gear className="h-14 w-14" teeth={10} />
        </div>

        {/* Airship — small, lower-left, gently floating */}
        <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-16 animate-balloon-float pointer-events-none">
          <Airship className="h-44 w-auto sm:h-56 text-brass-deep/80" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center gap-6">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-ink-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Built with Opus 4.7 · A math mastery voyage
          </p>

          {/* Cartouche-framed brand */}
          <div className="relative w-full max-w-2xl">
            <CartoucheFrame className="absolute inset-0 w-full h-full text-brass-deep/70" />
            <div className="relative px-12 py-10 flex flex-col gap-2 items-center">
              <h1
                className="text-5xl sm:text-7xl font-bold tracking-wide text-ink"
                style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.05em' }}
              >
                Strata Mundo
              </h1>
              <p
                className="text-base sm:text-lg italic text-ink-soft mt-1"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Your math mastery voyage.
              </p>
            </div>
          </div>

          <OrnamentalRule className="h-6 text-brass-deep/60 mt-2" width={320} />

          <div className="flex flex-col gap-3 max-w-2xl">
            <p
              className="text-base sm:text-lg text-ink-soft leading-relaxed"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              A diagnostic that reads <em>how</em> a learner reasons, a plan that
              prescribes the next steps in pedagogically sound order, and a probe
              loop that verifies mastery as the voyage unfolds.
            </p>
            <ul
              className="text-sm text-ink-faint space-y-1 mt-1"
              style={{ fontFamily: 'var(--font-special-elite)' }}
            >
              <li>· What needs to be mastered — and corrected</li>
              <li>· What to teach, in what order</li>
              <li>· How to teach it — and where to find the activities</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            <Link
              href="/setup"
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-6 text-sm font-semibold tracking-wider uppercase text-paper hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-deep focus-visible:ring-offset-2"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Begin the voyage
            </Link>
            <Link
              href="/methodology"
              className="inline-flex h-12 items-center justify-center rounded-md border-2 border-brass-deep/60 bg-paper/70 backdrop-blur px-6 text-sm font-semibold tracking-wider uppercase text-ink hover:bg-paper-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-deep focus-visible:ring-offset-2"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* THREE-PROBLEM SECTIONS — diagram plates */}
      <section className="bg-paper py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-ink-faint"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Three problems · three voyages
            </p>
            <h2
              className="text-3xl sm:text-4xl tracking-tight text-ink"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              The math mastery voyage answers three questions
            </h2>
            <OrnamentalRule className="h-5 text-brass-deep/50 mt-2" width={280} />
          </div>

          <DiagramPlate
            index={1}
            kicker="What needs to be mastered and corrected"
            problemTitle="No comprehensive assessment that finds gaps and misconceptions"
            problemBullets={[
              'Traditional schools push a fixed curriculum — ignoring what each learner has already mastered or where the foundation is shaky',
              'Mastery-based schools want to tailor — but no tool maps mastered concepts, named misconceptions, and areas to work on',
              'Khan’s course challenge probes only some skills, measures performance (right/wrong), not true mastery',
              'Without the full picture, a tailored curriculum is guesswork',
            ]}
            solutionTitle="A telemetry-based diagnostic, with a probe loop"
            solutionBullets={[
              'Reads the trajectory — drags, removals, commits, resets, timing — not just final answers',
              'Names specific misconceptions with evidence pointing to the problems where they fired',
              'Categorical states — Mastered / Working on / Needs attention / Not yet probed — never percentages',
              'Loop, not one-shot: assess → diagnose → plan → activities → focused probe → mastery declared, or re-plan',
              'The probe loop is what distinguishes diagnostic-of-current-misconception from proof-of-mastery',
            ]}
          />

          <DiagramPlate
            index={2}
            kicker="In what order to teach, and learn"
            problemTitle="Knowing the gaps doesn’t tell you what to teach first"
            problemBullets={[
              'Concept dependencies are real but invisible',
              'Boxed curricula assume linear order — ignoring what’s already known',
              'Without a map, guides re-teach mastered material or skip foundational gaps',
            ]}
            solutionTitle="A mastery atlas that shows the whole universe"
            solutionBullets={[
              'Every standard, every prerequisite, in one view',
              'Concept dependencies visible at a glance',
              'Skip what’s mastered; focus where it’s needed',
              'Built on the published Common Core Coherence Map and the Illustrative Mathematics curriculum sections',
              'Maximum flexibility for a tailored curriculum',
            ]}
          />

          <DiagramPlate
            index={3}
            kicker="What to use, how to teach, how to learn"
            problemTitle="No easy way to find varied ways of learning a concept"
            problemBullets={[
              'Hours hunting for videos, exercises, and hands-on activities across sources',
              'Boxed curricula offer the same type of practice — limited variation',
              'Off-screen, real-world, hands-on activities are especially hard to find',
              'Math taught in isolation gets forgotten — true mastery comes from APPLYING it',
            ]}
            solutionTitle="A tailored plan from a curated, multimodal library"
            solutionBullets={[
              'Concrete → representational → abstract sequencing per gap',
              'On-screen + off-screen + hands-on activities per concept',
              'Math applied across contexts — not learned in isolation',
              'Plan is a living document — shifts as the learner’s mastery evolves',
              'Library grown by the community: AI-vetted, human-approved (vision)',
            ]}
          />
        </div>
      </section>

      {/* DISTINCTIVE CALLOUT */}
      <section className="bg-paper-deep py-16 px-6 border-y border-stone-300/60">
        <div className="max-w-3xl mx-auto flex flex-col gap-5 items-center text-center">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-ink-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            What is distinctive
          </p>
          <h2
            className="text-2xl sm:text-3xl tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Two moves no other AI math tutor makes
          </h2>
          <ul
            className="list-disc ml-6 space-y-3 text-ink-soft text-left max-w-2xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <li>
              <span className="font-semibold text-ink">
                Named misconception detection with traceable evidence
              </span>
              {' '}— wrong-answer patterns mapped to misconceptions from the
              literature, citing the problems where they fired.
            </li>
            <li>
              <span className="font-semibold text-ink">
                Strategy-switching on reset is positive evidence of mastery
              </span>
              {' '}— self-correction is one of the strongest mastery signals
              research has (Rittle-Johnson 2017, Siegler’s overlapping-waves
              theory).
            </li>
          </ul>
        </div>
      </section>

      {/* FOOTER ATTRIBUTION */}
      <footer className="bg-paper py-8 px-6 text-center">
        <OrnamentalRule className="h-4 text-brass-deep/40 mx-auto mb-4" width={220} />
        <p
          className="text-[11px] text-ink-faint italic max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Sections from Illustrative Mathematics K-5 (CC BY 4.0). Standards from
          CCSS-M and the Achievethecore Coherence Map. Progressions from the
          Institute for Mathematics and Education, University of Arizona. MIT
          licensed.
        </p>
      </footer>
    </main>
  )
}

/**
 * "Diagram plate" — a problem-and-solution pair styled as a Victorian
 * scientific plate. Roman numeral chapter mark on the left, two paneled
 * cards on the right with corner flourishes.
 */
function DiagramPlate({
  index,
  kicker,
  problemTitle,
  problemBullets,
  solutionTitle,
  solutionBullets,
}: {
  index: number
  kicker: string
  problemTitle: string
  problemBullets: string[]
  solutionTitle: string
  solutionBullets: string[]
}) {
  return (
    <article className="grid sm:grid-cols-[120px_1fr] gap-6 sm:gap-10">
      {/* Roman numeral + kicker */}
      <div className="flex flex-col gap-1 sm:gap-2 items-center sm:items-end sm:text-right">
        <RomanNumeral
          n={index}
          className="text-6xl sm:text-7xl text-brass-deep leading-none"
        />
        <p
          className="text-[10px] tracking-[0.25em] uppercase text-ink-faint mt-1"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {kicker}
        </p>
      </div>

      {/* Problem & solution panels */}
      <div className="grid sm:grid-cols-2 gap-5">
        {/* PROBLEM panel */}
        <PanelCard
          ribbonLabel="Observed problem"
          ribbonClass="bg-paper-deep border-stone-400/60 text-ink-soft"
          title={problemTitle}
          bullets={problemBullets}
        />
        {/* SOLUTION panel */}
        <PanelCard
          ribbonLabel="Strata Mundo · the remedy"
          ribbonClass="bg-brass/15 border-brass-deep/60 text-brass-deep"
          title={solutionTitle}
          bullets={solutionBullets}
          accent
        />
      </div>
    </article>
  )
}

function PanelCard({
  ribbonLabel,
  ribbonClass,
  title,
  bullets,
  accent = false,
}: {
  ribbonLabel: string
  ribbonClass: string
  title: string
  bullets: string[]
  accent?: boolean
}) {
  return (
    <div
      className={`relative bg-paper border ${
        accent
          ? 'border-brass-deep/60 shadow-[inset_0_0_0_1px_oklch(0.65_0.12_78/0.18)]'
          : 'border-stone-300/80'
      } p-5 sm:p-6 flex flex-col gap-3 rounded-sm`}
    >
      {/* Corner flourishes */}
      <CornerFlourish
        corner="tl"
        className={`absolute top-1.5 left-1.5 h-5 w-5 ${
          accent ? 'text-brass-deep/70' : 'text-stone-400'
        }`}
      />
      <CornerFlourish
        corner="tr"
        className={`absolute top-1.5 right-1.5 h-5 w-5 ${
          accent ? 'text-brass-deep/70' : 'text-stone-400'
        }`}
      />
      <CornerFlourish
        corner="bl"
        className={`absolute bottom-1.5 left-1.5 h-5 w-5 ${
          accent ? 'text-brass-deep/70' : 'text-stone-400'
        }`}
      />
      <CornerFlourish
        corner="br"
        className={`absolute bottom-1.5 right-1.5 h-5 w-5 ${
          accent ? 'text-brass-deep/70' : 'text-stone-400'
        }`}
      />

      {/* Ribbon / kicker */}
      <span
        className={`inline-flex w-fit text-[9px] tracking-[0.2em] uppercase border px-2 py-1 rounded-sm ${ribbonClass}`}
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        {ribbonLabel}
      </span>

      <h3
        className="text-lg sm:text-xl text-ink leading-snug pr-2"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
      >
        {title}
      </h3>

      <ul
        className="list-disc ml-5 space-y-1.5 text-sm text-ink-soft leading-relaxed"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
