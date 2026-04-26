/**
 * Steampunk modality glyphs — inline SVG, drawn at 40px and up. No
 * emojis, no external icons. Each glyph evokes the modality with a
 * period-instrument metaphor:
 *
 *   - video               → camera obscura with bellows + tripod
 *   - game_or_interactive → brass chronograph dial with Roman numerals
 *   - manipulative        → cog/gear with center hub + axle
 *   - worksheet           → scroll of parchment with quill
 */

type Modality = 'video' | 'game_or_interactive' | 'manipulative' | 'worksheet' | string

interface Props {
  modality: Modality
  className?: string
}

export default function ModalityGlyph({ modality, className }: Props) {
  const cls = className ?? 'h-10 w-10'
  switch (modality) {
    case 'video':
      // Camera obscura: round body with iris, bellows in front, tripod legs.
      return (
        <svg viewBox="0 0 40 40" className={cls} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          {/* Tripod legs */}
          <path d="M14 28 L 9 36 M26 28 L 31 36 M20 28 L 20 36" strokeWidth="1.3" strokeLinecap="round" />
          {/* Tripod platform */}
          <line x1="13" y1="28" x2="27" y2="28" strokeWidth="1.4" />
          {/* Camera body */}
          <rect x="11" y="12" width="14" height="14" rx="1.5" />
          {/* Bellows — accordion folds */}
          <path d="M25 16 L 32 14 L 32 24 L 25 22 Z" />
          <line x1="27" y1="14.6" x2="27" y2="23.4" strokeWidth="0.8" opacity="0.7" />
          <line x1="29.5" y1="14.0" x2="29.5" y2="24.0" strokeWidth="0.8" opacity="0.7" />
          {/* Lens at end of bellows */}
          <circle cx="32" cy="19" r="2.4" />
          <circle cx="32" cy="19" r="0.9" fill="currentColor" stroke="none" />
          {/* Iris segments (decorative) on body */}
          <circle cx="18" cy="19" r="3.2" strokeWidth="1.0" />
          <path d="M18 15.8 L 19.5 18 L 18 19 L 16.5 18 Z" strokeWidth="0.8" opacity="0.7" />
          <path d="M21.2 19 L 19.5 18 L 18 19 L 19.5 20 Z" strokeWidth="0.8" opacity="0.7" />
          <path d="M18 22.2 L 19.5 20 L 18 19 L 16.5 20 Z" strokeWidth="0.8" opacity="0.7" />
          <path d="M14.8 19 L 16.5 20 L 18 19 L 16.5 18 Z" strokeWidth="0.8" opacity="0.7" />
        </svg>
      )

    case 'game_or_interactive':
      // Chronograph: outer brass ring, hour ticks, Roman numerals at 3/6/9/12, pointer.
      return (
        <svg viewBox="0 0 40 40" className={cls} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          {/* Outer rim — double ring */}
          <circle cx="20" cy="20" r="16" strokeWidth="1.6" />
          <circle cx="20" cy="20" r="14" strokeWidth="0.8" opacity="0.6" />
          {/* Inner face */}
          <circle cx="20" cy="20" r="11" strokeWidth="0.8" opacity="0.5" />
          {/* Hour ticks — 12 of them, longer at 12/3/6/9 */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2
            const r1 = i % 3 === 0 ? 11.5 : 12.4
            const r2 = 13.4
            const x1 = 20 + r1 * Math.cos(a)
            const y1 = 20 + r1 * Math.sin(a)
            const x2 = 20 + r2 * Math.cos(a)
            const y2 = 20 + r2 * Math.sin(a)
            const sw = i % 3 === 0 ? 1.4 : 0.7
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={sw} />
          })}
          {/* Pointer (hour hand) — pointing up-right */}
          <line x1="20" y1="20" x2="26" y2="13" strokeWidth="1.8" strokeLinecap="round" />
          {/* Sub-pointer (minute hand) — pointing right */}
          <line x1="20" y1="20" x2="29" y2="20" strokeWidth="1.2" strokeLinecap="round" />
          {/* Center post */}
          <circle cx="20" cy="20" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="20" cy="20" r="0.6" fill="none" stroke="oklch(0.92 0.02 75)" strokeWidth="0.4" />
          {/* Decorative flourish at top */}
          <path d="M 18 4.5 Q 20 3 22 4.5" strokeWidth="0.9" />
        </svg>
      )

    case 'manipulative':
      // Gear: 10 teeth, hub with crossed spokes, period-engineering style.
      return (
        <svg viewBox="0 0 40 40" className={cls} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          {/* Gear teeth — 10, drawn as rectangles around the perimeter */}
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2
            const tx = 20 + 16 * Math.cos(a)
            const ty = 20 + 16 * Math.sin(a)
            return (
              <rect
                key={i}
                x={tx - 1.8}
                y={ty - 2.2}
                width="3.6"
                height="4.4"
                transform={`rotate(${(i / 10) * 360} ${tx} ${ty})`}
                strokeWidth="1.2"
              />
            )
          })}
          {/* Outer body of gear */}
          <circle cx="20" cy="20" r="12.5" strokeWidth="1.4" />
          {/* Inner ring */}
          <circle cx="20" cy="20" r="9" strokeWidth="0.8" opacity="0.6" />
          {/* Spokes — 4 crossed */}
          <line x1="20" y1="11.5" x2="20" y2="28.5" strokeWidth="1.0" />
          <line x1="11.5" y1="20" x2="28.5" y2="20" strokeWidth="1.0" />
          {/* Axle hub */}
          <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
          <circle cx="20" cy="20" r="1.2" fill="oklch(0.92 0.02 75)" stroke="none" />
        </svg>
      )

    case 'worksheet':
      // Scroll of parchment with a quill — top-right corner curled, ruled lines, ink dots.
      return (
        <svg viewBox="0 0 40 40" className={cls} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          {/* Parchment outline — top curl on the right corner */}
          <path
            d="M 8 6 L 28 6 Q 31 6 31 9 L 31 11 Q 33 11 33 13 L 33 34 L 8 34 Z"
            strokeLinejoin="round"
          />
          {/* Curl detail — small arc tucked under the top right */}
          <path d="M 28 6 Q 28 9 31 9" strokeWidth="0.9" />
          <path d="M 31 9 Q 31 11 33 11" strokeWidth="0.9" />
          {/* Ruled lines of writing */}
          <line x1="11" y1="14" x2="24" y2="14" strokeWidth="1.0" />
          <line x1="11" y1="18" x2="27" y2="18" strokeWidth="1.0" />
          <line x1="11" y1="22" x2="22" y2="22" strokeWidth="1.0" />
          <line x1="11" y1="26" x2="26" y2="26" strokeWidth="1.0" />
          <line x1="11" y1="30" x2="20" y2="30" strokeWidth="1.0" />
          {/* Quill — sharp-tipped feather emerging from upper-right */}
          <path
            d="M 26 4 Q 36 -2 36 6 Q 36 12 28 13"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Quill barbs (small angled lines along the spine) */}
          <path d="M 31 1 Q 32 2 31 3" strokeWidth="0.7" opacity="0.7" />
          <path d="M 33 1.5 Q 34 2.5 33 3.5" strokeWidth="0.7" opacity="0.7" />
          <path d="M 34.5 3 Q 35 4 34 5" strokeWidth="0.7" opacity="0.7" />
          {/* Ink blot near quill tip */}
          <circle cx="27" cy="13" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      )

    default:
      return (
        <svg viewBox="0 0 40 40" className={cls} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <circle cx="20" cy="20" r="13" />
          <circle cx="20" cy="20" r="5" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}

export function modalityLabel(modality: Modality): string {
  switch (modality) {
    case 'video':
      return 'Video'
    case 'game_or_interactive':
      return 'Interactive'
    case 'manipulative':
      return 'Hands-on'
    case 'worksheet':
      return 'Worksheet'
    default:
      return modality
  }
}
