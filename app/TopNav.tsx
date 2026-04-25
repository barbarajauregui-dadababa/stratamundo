import Link from 'next/link'
import { Gear } from './Ornament'

/**
 * Global top navigation. Server component — no client state.
 *
 * Steampunk: warm paper backdrop with a brass-deep bottom rule,
 * Cinzel brand wordmark with a small slowly-turning gear, ink-soft
 * nav links in Cinzel small caps with brass underline on hover.
 */
export default function TopNav() {
  return (
    <nav className="w-full border-b border-brass-deep/30 bg-paper/85 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {/* Brand: tiny gear + Cinzel wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 text-ink hover:text-ink-soft transition-colors"
        >
          <Gear
            teeth={8}
            className="h-4 w-4 text-brass-deep/65 animate-turn-slow"
          />
          <span
            className="text-base font-semibold uppercase"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
          >
            Strata Mundo
          </span>
        </Link>

        <ul
          className="flex items-center gap-1 text-[11px]"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.15em' }}
        >
          <NavLink href="/" label="Home" />
          <NavLink href="/methodology" label="Methodology" />
          <NavLink href="/setup" label="New learner" />
          <li>
            <a
              href="https://github.com/barbarajauregui-dadababa/fractions-mastery-tracker"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 uppercase text-ink-faint hover:text-ink transition-colors"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="px-3 py-1.5 uppercase text-ink-soft hover:text-ink hover:underline hover:decoration-brass-deep/60 hover:decoration-1 hover:underline-offset-4 transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}
