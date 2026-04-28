'use client'

import { useState } from 'react'

export default function FeedbackForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setAttemptedSubmit(true)
    if (currentMissing().length > 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_name: name.trim() || null,
          contributor_email: email.trim(),
          message: message.trim(),
        }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Submission failed (${res.status})`)
        setIsSubmitting(false)
        return
      }
      setDone(true)
      setIsSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.')
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center py-4">
        <p
          className="text-xl tracking-[0.18em] uppercase text-brass-deep font-bold"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          ◇ Thank you ◇
        </p>
        <p
          className="text-base text-ink"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Your note is on its way to Barbara. A confirmation email is heading to {email || 'your inbox'}.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false)
            setName('')
            setEmail('')
            setMessage('')
          }}
          className="self-center inline-flex h-10 items-center justify-center rounded-sm border-2 border-brass-deep/60 bg-paper px-5 text-xs font-bold uppercase text-ink hover:bg-brass/20 transition-colors"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          Send another note
        </button>
      </div>
    )
  }

  function currentMissing(): string[] {
    const m: string[] = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) m.push('A valid email')
    if (message.trim().length < 5) m.push('A message (at least 5 characters)')
    return m
  }
  const missing = currentMissing()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FormField label="Your name" hint="Optional. So we know how to address you in our reply.">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name is fine"
          className={inputCls}
          style={{ fontFamily: 'var(--font-fraunces)' }}
        />
      </FormField>

      <FormField label="Your email" required hint="So we can confirm receipt and reply to you directly.">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputCls}
          style={{ fontFamily: 'var(--font-fraunces)' }}
          required
        />
      </FormField>

      <FormField
        label="Your message"
        required
        hint="A suggestion, a fix request, a thing that worked, or a thing that didn't."
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us anything — what to add, what to change, what to remove."
          rows={6}
          className={`${inputCls} resize-y min-h-[140px]`}
          style={{ fontFamily: 'var(--font-fraunces)' }}
          required
          minLength={5}
        />
      </FormField>

      {error && (
        <div
          className="rounded-sm border-2 border-red-700/50 bg-paper-deep px-4 py-3 text-sm text-red-700"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-sm bg-brass-deep px-7 text-xs font-bold uppercase text-cream hover:bg-brass disabled:opacity-50 transition-colors border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
          >
            {isSubmitting ? 'Sending…' : 'Send note ◇'}
          </button>
        </div>
        {missing.length > 0 && !isSubmitting && attemptedSubmit && (
          <div
            className="rounded-sm border-2 border-red-700/60 bg-red-50 px-4 py-3 text-sm text-red-800"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <div
              className="text-sm tracking-[0.2em] uppercase text-red-800 mb-1 font-bold"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Before you can send
            </div>
            <ul className="list-disc ml-5 space-y-0.5">
              {missing.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}
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
        className="text-sm tracking-[0.18em] uppercase text-brass-deep font-bold"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        {label}
        {required && <span className="text-red-700 ml-1" aria-hidden>*</span>}
      </span>
      {children}
      {hint && (
        <span
          className="text-xs text-ink-faint italic"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {hint}
        </span>
      )}
    </label>
  )
}
