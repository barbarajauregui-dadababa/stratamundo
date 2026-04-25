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

        {/* Slow-turning gear in upper-right corner */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-12 text-brass-deep/60 pointer-events-none animate-turn-slow drop-shadow-sm">
          <Gear className="h-20 w-20 sm:h-28 sm:w-28" teeth={14} />
        </div>
        <div className="absolute top-20 right-32 hidden sm:block text-brass-deep/45 pointer-events-none animate-turn-slow-reverse">
          <Gear className="h-14 w-14" teeth={10} />
        </div>

        {/* Airship — gently floating */}
        <div className="absolute bottom-6 left-4 sm:bottom-8 sm:left-12 animate-balloon-float pointer-events-none opacity-90">
          <Airship className="h-36 sm:h-48 w-auto text-brass-deep" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 sm:py-32 flex flex-col items-center text-center gap-6">
          <p
            className="text-[11px] tracking-[0.3em] uppercase text-ink-faint"
            style={{ fontFamily: 'var(--font-special-elite)' }}
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
              className="text-base sm:text-lg italic text-ink-soft leading-relaxed"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              A diagnostic that reads <em>how</em> a learner reasons, a plan that prescribes the next steps in pedagogically sound order, and a probe loop that verifies mastery as the voyage unfolds.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            <Link
              href="/setup"
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-6 text-sm font-semibold uppercase text-paper hover:bg-ink-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-deep focus-visible:ring-offset-2"
              style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.12em' }}
            >
              Begin the voyage
            </Link>
            <Link
              href="/methodology"
              className="inline-flex h-12 items-center justify-center rounded-md border-2 border-brass-deep/60 bg-paper/70 backdrop-blur px-6 text-sm font-semibold uppercase text-ink hover:bg-paper-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-deep focus-visible:ring-offset-2"
              style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.12em' }}
            >
              Methodology
            </Link>
          </div>
        </div>
      </section>

      {/* THREE-QUESTION SECTIONS — diagram plates */}
      <section className="bg-paper py-16 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <p
              className="text-[10px] tracking-[0.3em] uppercase text-ink-faint"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Three questions · the math mastery voyage
            </p>
            <h2
              className="text-3xl sm:text-4xl tracking-tight text-ink max-w-3xl"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              Three questions every guide and parent needs answered
            </h2>
            <OrnamentalRule className="h-5 text-brass-deep/50 mt-2" width={280} />
          </div>

          <DiagramPlate
            index={1}
            kicker="Where is the learner in their math journey, really?"
            problemTitle="No comprehensive diagnostic that names what is mastered and what is misunderstood"
            problemBullets={[
              'Traditional schools push a fixed curriculum — ignoring what each learner has already mastered or where the foundation is shaky',
              'Mastery-based settings want to tailor — but no tool maps mastered concepts, named misconceptions, and areas to work on',
              'Khan’s course challenge probes only some skills, measures performance (right/wrong), not true mastery',
              'Without the full picture, a tailored curriculum is guesswork',
            ]}
            solutionTitle="A telemetry-based diagnostic, with a probe loop"
            solutionBullets={[
              'Reads the trajectory — drags, removals, commits, resets, timing — not just the final answer',
              'Names specific misconceptions with evidence pointing to the problems where they fired',
              'Categorical states — Mastered / Working on / Needs attention / Not yet probed — never percentages',
              'Loop, not one-shot: assess → diagnose → plan → activities → focused probe → mastery declared, or re-plan',
              'The probe loop is what distinguishes a diagnostic of current misconception from proof of mastery',
            ]}
          />

          <DiagramPlate
            index={2}
            kicker="What should they work on next, exactly?"
            problemTitle="Knowing the gaps does not tell you what to work on first"
            problemBullets={[
              'Concept dependencies are real but invisible',
              'Boxed curricula assume linear order — ignoring what is already known',
              'Without a map, guides re-cover mastered material or skip foundational gaps',
            ]}
            solutionTitle="A mastery atlas that shows the whole universe"
            solutionBullets={[
              'Every standard, every prerequisite, in one view',
              'Concept dependencies visible at a glance',
              'Skip what is mastered; focus where it is needed',
              'Built on the published Common Core Coherence Map and the Illustrative Mathematics curriculum sections',
              'Maximum flexibility for a tailored learning path',
            ]}
          />

          <DiagramPlate
            index={3}
            kicker="What different effective tools are out there to truly master that skill?"
            problemTitle="No easy way to find varied ways of learning a concept"
            problemBullets={[
              'Hours hunting for videos, exercises, and hands-on activities across sources',
              'Boxed curricula offer the same type of practice — limited variation',
              'Off-screen, real-world, hands-on activities are especially hard to find',
              'Math learned in isolation gets forgotten — true mastery comes from APPLYING it',
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

      {/* FOOTER ATTRIBUTION */}
      <footer className="bg-paper py-10 px-6 text-center border-t border-stone-300/40">
        <OrnamentalRule className="h-4 text-brass-deep/40 mx-auto mb-4" width={220} />
        <p
          className="text-[11px] text-ink-faint italic max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Sections from Illustrative Mathematics K-5 (CC BY 4.0). Standards from CCSS-M and the Achievethecore Coherence Map. Progressions from the Institute for Mathematics and Education, University of Arizona. MIT licensed.
        </p>
      </footer>
    </main>
  )
}

/**
 * "Diagram plate" — a problem-and-remedy pair styled as a Victorian
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
          className="text-[10px] tracking-[0.25em] uppercase text-ink-faint mt-1 italic"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {kicker}
        </p>
      </div>

      {/* Problem & remedy panels */}
      <div className="grid sm:grid-cols-2 gap-5">
        <PanelCard
          ribbonLabel="The condition observed"
          ribbonClass="bg-paper-deep border-stone-400/60 text-ink-soft"
          title={problemTitle}
          bullets={problemBullets}
        />
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
      <CornerFlourish corner="tl" className={`absolute top-1.5 left-1.5 h-5 w-5 ${accent ? 'text-brass-deep/70' : 'text-stone-400'}`} />
      <CornerFlourish corner="tr" className={`absolute top-1.5 right-1.5 h-5 w-5 ${accent ? 'text-brass-deep/70' : 'text-stone-400'}`} />
      <CornerFlourish corner="bl" className={`absolute bottom-1.5 left-1.5 h-5 w-5 ${accent ? 'text-brass-deep/70' : 'text-stone-400'}`} />
      <CornerFlourish corner="br" className={`absolute bottom-1.5 right-1.5 h-5 w-5 ${accent ? 'text-brass-deep/70' : 'text-stone-400'}`} />

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
