import Image from 'next/image'
import FeedbackForm from './FeedbackForm'
import { CornerFlourish, OrnamentalRule } from '@/app/Ornament'

export const metadata = {
  title: 'Help us improve · Strata Mundo',
  description:
    'Send a suggestion, request a fix, or tell us what worked. Barbara reads every note.',
}

export default function FeedbackPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: 'oklch(0.88 0.025 70)' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Image
          src="/images/cloudscape-denis.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          style={{ filter: 'sepia(0.4) brightness(1.05) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.88 0.025 70 / 0.25) 0%, oklch(0.86 0.028 68 / 0.40) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 items-center text-center">
          <p
            className="text-base sm:text-lg tracking-[0.3em] uppercase text-brass-deep font-bold"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◇ Help us improve ◇
          </p>
          <h1
            className="text-3xl sm:text-4xl tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Send a note to Strata Mundo
          </h1>
          <OrnamentalRule className="h-5 text-brass-deep mt-1" width={300} />
          <ul
            className="text-base text-ink-soft italic max-w-xl space-y-1.5 text-left list-disc pl-5"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <li>Suggest a feature, request a fix, or tell us what worked.</li>
            <li>Barbara reads every note personally.</li>
            <li>You&apos;ll get a confirmation email; replies usually go out within a few days.</li>
          </ul>
        </header>

        <section className="relative rounded-sm border-2 border-brass-deep/60 bg-[oklch(0.98_0.012_78)] p-6 sm:p-8 shadow-[0_0_25px_oklch(0.74_0.14_80/0.18)]">
          <CornerFlourish corner="tl" className="absolute top-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="tr" className="absolute top-2 right-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="bl" className="absolute bottom-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="br" className="absolute bottom-2 right-2 h-5 w-5 text-brass-deep" />

          <FeedbackForm />
        </section>
      </div>
    </main>
  )
}
