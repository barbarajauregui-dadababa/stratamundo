import Link from 'next/link'
import { Gear } from './Ornament'

/**
 * Global top navigation. Server component.
 *
 * Bold steampunk: dark mahogany ground with brass-deep border, brass
 * wordmark with a slowly-turning gear. Cinzel small caps everywhere.
 */
export default function TopNav() {
  return (
    <nav className="w-full border-b border-brass-deep/50 bg-background/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-cream hover:text-brass transition-colors"
        >
          <Gear
            teeth={10}
            className="h-5 w-5 text-brass animate-turn-slow"
          />
          <span
            className="text-base font-bold uppercase"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.22em' }}
          >
            Strata Mundo
          </span>
        </Link>

        <ul
          className="flex items-center gap-1 text-[11px]"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          <NavLink href="/" label="Home" />
          <NavLink href="/methodology" label="Methodology" />
          <NavLink href="/setup" label="New learner" />
          <li>
            <a
              href="https://github.com/barbarajauregui-dadababa/fractions-mastery-tracker"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 uppercase text-cream-faint hover:text-brass transition-colors"
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
        className="px-3 py-1.5 uppercase text-cream-soft hover:text-brass hover:underline hover:decoration-brass hover:decoration-1 hover:underline-offset-4 transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}
