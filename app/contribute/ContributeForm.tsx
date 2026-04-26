'use client'

import { useState } from 'react'
import StandardSearchPicker from './StandardSearchPicker'

const MODALITIES: { value: string; label: string; hint: string }[] = [
  { value: 'video', label: 'Video', hint: 'A video the learner watches.' },
  { value: 'manipulative', label: 'Hands-on / manipulative', hint: 'A physical material the learner touches and arranges.' },
  { value: 'game_or_interactive', label: 'Game or interactive', hint: 'A digital simulation, game, or interactive applet.' },
  { value: 'worksheet', label: 'Worksheet', hint: 'A printable or PDF practice set.' },
]

interface Props {
  /** When provided, locks the standard picker to that standard.
   *  Used by the "Suggest activity for this standard" entry point on the report. */
  initialStandardId?: string
}

export default function ContributeForm({ initialStandardId }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [modality, setModality] = useState('manipulative')
  const [url, setUrl] = useState('')
  const [sourceSite, setSourceSite] = useState('')
  const [duration, setDuration] = useState('')
  const [rationale, setRationale] = useState('')
  const [standardIds, setStandardIds] = useState<string[]>(
    initialStandardId ? [initialStandardId] : [],
  )
  const [contributorName, setContributorName] = useState('')
  const [contributorEmail, setContributorEmail] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<null | {
    verdict: 'pass' | 'borderline' | 'reject' | null
    reasoning: string | null
    flags: string[]
    submission_id: string
  }>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        modality,
        url: url.trim() || null,
        source_site: sourceSite.trim() || null,
        duration_minutes: duration ? Number(duration) : null,
        rationale: rationale.trim() || null,
        standard_ids: standardIds,
        contributor_name: contributorName.trim(),
        contributor_email: contributorEmail.trim(),
      }

      const res = await fetch('/api/submit-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        error?: string
        debug?: string
        submission_id?: string
        vet?: { verdict: 'pass' | 'borderline' | 'reject'; reasoning: string; flags: string[] } | null
        vet_error?: string | null
      }

      if (!res.ok) {
        setError(data.error ?? `Submission failed (${res.status})`)
        setIsSubmitting(false)
        return
      }

      setResult({
        verdict: data.vet?.verdict ?? null,
        reasoning: data.vet?.reasoning ?? data.vet_error ?? null,
        flags: data.vet?.flags ?? [],
        submission_id: data.submission_id ?? '',
      })
      setIsSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.')
      setIsSubmitting(false)
    }
  }

  if (result) {
    return <ResultPanel result={result} onReset={() => {
      setResult(null)
      setTitle('')
      setDescription('')
      setUrl('')
      setSourceSite('')
      setDuration('')
      setRationale('')
      setStandardIds(initialStandardId ? [initialStandardId] : [])
    }} />
  }

  const canSubmit =
    title.trim().length >= 3 &&
    description.trim().length >= 20 &&
    standardIds.length > 0 &&
    contributorName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contributorEmail.trim()) &&
    !isSubmitting

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormField label="Activity title" required>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Build-a-fraction interactive — PhET"
          className={inputCls}
          style={{ fontFamily: 'var(--font-fraunces)' }}
          required
          minLength={3}
        />
      </FormField>

      <FormField
        label="What does the learner do?"
        required
        hint="Describe the activity from the learner's perspective. What action do they take, and what concept does it teach? (At least 20 characters.)"
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="The learner drags fraction pieces onto a target bar and tries to build a target fraction using equivalent piece sizes. Teaches that 1/2 = 2/4 = 4/8 by physical equivalence."
          rows={4}
          className={`${inputCls} resize-y min-h-[88px]`}
          style={{ fontFamily: 'var(--font-fraunces)' }}
          required
          minLength={20}
        />
      </FormField>

      <FormField label="Modality" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODALITIES.map((m) => (
            <label
              key={m.value}
              className={`relative cursor-pointer rounded-sm border-2 px-3 py-2.5 transition-colors ${
                modality === m.value
                  ? 'border-brass-deep bg-brass/20 shadow-[0_0_8px_oklch(0.74_0.14_80/0.25)]'
                  : 'border-brass-deep/30 bg-paper hover:border-brass-deep/60'
              }`}
            >
              <input
                type="radio"
                name="modality"
                value={m.value}
                checked={modality === m.value}
                onChange={(e) => setModality(e.target.value)}
                className="sr-only"
              />
              <div
                className="text-sm text-ink"
                style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.08em', fontWeight: 700 }}
              >
                {m.label}
              </div>
              <div
                className="text-[11px] text-ink-soft italic mt-0.5"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                {m.hint}
              </div>
            </label>
          ))}
        </div>
      </FormField>

      <FormField
        label="Standard(s) it teaches"
        required
        hint="Search by name or by CCSS-M code. Select at least one."
      >
        <StandardSearchPicker
          selected={standardIds}
          onChange={setStandardIds}
          lockedToStandard={initialStandardId}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Link" hint="Optional. URL to the activity if it lives online.">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className={inputCls}
            style={{ fontFamily: 'var(--font-fraunces)' }}
          />
        </FormField>
        <FormField label="Source / vendor" hint="Optional. e.g., Khan Academy, PhET, Lakeshore, Didax.">
          <input
            type="text"
            value={sourceSite}
            onChange={(e) => setSourceSite(e.target.value)}
            placeholder="e.g., phet.colorado.edu or Lakeshore"
            className={inputCls}
            style={{ fontFamily: 'var(--font-fraunces)' }}
          />
        </FormField>
      </div>

      <FormField label="Duration (minutes)" hint="Optional. About how long does this activity take?">
        <input
          type="number"
          min={1}
          max={120}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={`${inputCls} max-w-[10rem]`}
          style={{ fontFamily: 'var(--font-fraunces)' }}
        />
      </FormField>

      <FormField
        label="Why does this work?"
        hint="Optional, but valued. The pedagogical insight — what makes this activity effective for the standards above?"
      >
        <textarea
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Direct manipulation lets the learner discover equivalence through size-matching, before they have the language for it."
          rows={3}
          className={`${inputCls} resize-y min-h-[64px]`}
          style={{ fontFamily: 'var(--font-fraunces)' }}
        />
      </FormField>

      <div className="border-t-2 border-brass-deep/30 pt-5 flex flex-col gap-4">
        <p
          className="text-[10px] tracking-[0.25em] uppercase text-brass-deep"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          ◇ Your details ◇
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Your name" required>
            <input
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              placeholder="First and last name"
              className={inputCls}
              style={{ fontFamily: 'var(--font-fraunces)' }}
              required
              minLength={2}
            />
          </FormField>
          <FormField label="Your email" required hint="So we can confirm receipt and follow up if we have questions.">
            <input
              type="email"
              value={contributorEmail}
              onChange={(e) => setContributorEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
              style={{ fontFamily: 'var(--font-fraunces)' }}
              required
            />
          </FormField>
        </div>
      </div>

      {error && (
        <div
          className="rounded-sm border-2 border-red-700/50 bg-paper-deep px-4 py-3 text-sm text-red-700"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-11 items-center justify-center rounded-sm bg-brass-deep px-7 text-xs font-bold uppercase text-cream hover:bg-brass disabled:opacity-50 transition-colors border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          {isSubmitting ? 'Vetting… ~10 sec' : 'Submit for vetting ◇'}
        </button>
        <p
          className="text-xs text-ink-faint italic"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Your submission is reviewed by Claude Opus 4.7 first, then by a human.
        </p>
      </div>
    </form>
  )
}

const inputCls =
  'w-full h-10 rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint'

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] tracking-[0.2em] uppercase text-brass-deep"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        {label}
        {required && <span className="text-red-700 ml-1" aria-hidden>*</span>}
      </span>
      {children}
      {hint && (
        <span
          className="text-[11px] text-ink-faint italic"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {hint}
        </span>
      )}
    </label>
  )
}

function ResultPanel({
  result,
  onReset,
}: {
  result: { verdict: 'pass' | 'borderline' | 'reject' | null; reasoning: string | null; flags: string[]; submission_id: string }
  onReset: () => void
}) {
  const verdict = result.verdict
  const headline =
    verdict === 'pass'
      ? '✓ Submission received and AI-vetted: PASS'
      : verdict === 'borderline'
        ? '◇ Submission received and AI-vetted: BORDERLINE'
        : verdict === 'reject'
          ? '⚠ Submission received and AI-vetted: REJECT'
          : '◇ Submission received'
  const subtext =
    verdict === 'pass'
      ? 'Your activity passed automated review. A human reviewer will look at it next.'
      : verdict === 'borderline'
        ? 'Our automated review flagged some concerns. A human reviewer will take a closer look.'
        : verdict === 'reject'
          ? "Our automated review found issues. A human will still see it. If you'd like to revise and resubmit, the issues are listed below."
          : 'A human reviewer will take it from here.'

  const verdictColor =
    verdict === 'pass'
      ? 'border-emerald-700 bg-emerald-50'
      : verdict === 'borderline'
        ? 'border-brass-deep bg-brass/15'
        : verdict === 'reject'
          ? 'border-red-700 bg-red-50'
          : 'border-brass-deep/50 bg-paper-deep/30'

  return (
    <div className={`relative rounded-sm border-2 ${verdictColor} p-6 flex flex-col gap-3 shadow-[0_0_20px_oklch(0.74_0.14_80/0.18)]`}>
      <h2
        className="text-2xl text-ink"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
      >
        {headline}
      </h2>
      <p className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
        {subtext}
      </p>
      {result.reasoning && (
        <div className="rounded-sm bg-paper px-4 py-3 border border-brass-deep/30">
          <div
            className="text-[10px] tracking-[0.2em] uppercase text-brass-deep mb-1"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            AI reviewer notes
          </div>
          <p className="text-sm text-ink-soft italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
            {result.reasoning}
          </p>
          {result.flags.length > 0 && (
            <div className="mt-2 text-xs text-ink-faint" style={{ fontFamily: 'var(--font-special-elite)' }}>
              Flags: {result.flags.join(', ')}{' '}
              <span className="italic">
                — see <a className="underline text-copper hover:text-brass-deep" href="/methodology#vetting">criteria documentation</a>.
              </span>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-ink-faint italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
        Submission ID: <span style={{ fontFamily: 'var(--font-special-elite)' }}>{result.submission_id}</span>
      </p>
      <button
        type="button"
        onClick={onReset}
        className="self-start mt-2 inline-flex h-9 items-center justify-center rounded-sm border-2 border-brass-deep px-4 text-[10px] font-bold uppercase text-ink hover:bg-brass-deep/10 transition-colors"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
      >
        Submit another
      </button>
    </div>
  )
}
