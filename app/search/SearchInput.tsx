'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  initialQuery: string
}

export default function SearchInput({ initialQuery }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search activities, math standards, or contributors…"
        className="flex-1 h-12 rounded-sm border-2 border-brass-deep bg-paper text-ink px-4 text-base focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint"
        style={{ fontFamily: 'var(--font-fraunces)' }}
        autoComplete="off"
      />
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center rounded-sm bg-brass-deep px-6 text-xs font-bold uppercase text-cream hover:bg-brass transition-colors border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
      >
        Search ◇
      </button>
    </form>
  )
}
