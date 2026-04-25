/**
 * Inline SVG ornaments for the steampunk treatment.
 * No external dependencies. Render at any size, any color (currentColor-based).
 */

/**
 * Ornamental rule — a horizontal divider with a center filigree.
 * Used between major sections.
 */
export function OrnamentalRule({
  className,
  width = 320,
}: {
  className?: string
  width?: number
}) {
  return (
    <svg
      viewBox={`0 0 ${width} 24`}
      className={className}
      stroke="currentColor"
      fill="none"
      aria-hidden
    >
      {/* Left swash */}
      <path
        d={`M 0 12 L ${width / 2 - 60} 12 C ${width / 2 - 40} 12 ${width / 2 - 35} 6 ${width / 2 - 30} 12`}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Right swash (mirror) */}
      <path
        d={`M ${width} 12 L ${width / 2 + 60} 12 C ${width / 2 + 40} 12 ${width / 2 + 35} 6 ${width / 2 + 30} 12`}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Center diamond + dots */}
      <circle cx={width / 2 - 20} cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx={width / 2 + 20} cy="12" r="2" fill="currentColor" stroke="none" />
      <path
        d={`M ${width / 2 - 12} 12 L ${width / 2} 6 L ${width / 2 + 12} 12 L ${width / 2} 18 Z`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx={width / 2} cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Corner flourish — for the four corners of "diagram plate" cards.
 * `corner` decides which way the flourish points.
 */
export function CornerFlourish({
  corner,
  className,
}: {
  corner: 'tl' | 'tr' | 'bl' | 'br'
  className?: string
}) {
  // Base flourish drawn for top-left; rotate to other corners.
  const rotation = {
    tl: 0,
    tr: 90,
    br: 180,
    bl: 270,
  }[corner]

  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      stroke="currentColor"
      fill="none"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden
    >
      {/* Outer L corner */}
      <path d="M 4 14 L 4 4 L 14 4" />
      {/* Inner echo line */}
      <path d="M 8 16 L 8 8 L 16 8" opacity="0.55" />
      {/* Curl into the corner */}
      <path d="M 14 4 C 18 4 20 6 20 10" />
      {/* Outward filigree */}
      <path d="M 4 18 C 4 22 6 24 10 24" opacity="0.55" />
      {/* Decorative dot */}
      <circle cx="6" cy="6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Cartouche frame — ornate text-frame for hero titles.
 * Renders as an absolute-positioned overlay; child content sits inside.
 */
export function CartoucheFrame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 200"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      {/* Inner rectangle */}
      <rect x="20" y="20" width="560" height="160" rx="4" />
      {/* Outer doubled rule, slightly offset */}
      <rect x="12" y="12" width="576" height="176" rx="6" opacity="0.5" strokeWidth="0.8" />
      {/* Top center cartouche bump */}
      <path d="M 280 12 C 280 4 320 4 320 12" strokeWidth="1.5" />
      <path d="M 270 20 C 270 8 330 8 330 20" strokeWidth="0.8" opacity="0.5" />
      {/* Bottom center mirror */}
      <path d="M 280 188 C 280 196 320 196 320 188" strokeWidth="1.5" />
      <path d="M 270 180 C 270 192 330 192 330 180" strokeWidth="0.8" opacity="0.5" />
      {/* Side scrolls */}
      <path d="M 12 90 C 4 90 4 110 12 110" strokeWidth="1.5" />
      <path d="M 588 90 C 596 90 596 110 588 110" strokeWidth="1.5" />
      {/* Corner dots */}
      <circle cx="20" cy="20" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="580" cy="20" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="20" cy="180" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="580" cy="180" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * Decorative gear — a single gear silhouette. Inline so it can be sized
 * and colored freely. Animate via the .animate-turn-slow class.
 */
export function Gear({
  teeth = 12,
  className,
}: {
  teeth?: number
  className?: string
}) {
  // Build a gear path procedurally so the tooth count is parametric.
  const cx = 50
  const cy = 50
  const outerR = 44
  const innerR = 38
  const hubR = 14
  const holeR = 5
  const path: string[] = []
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2
    const a1 = ((i + 0.25) / teeth) * Math.PI * 2
    const a2 = ((i + 0.75) / teeth) * Math.PI * 2
    const a3 = ((i + 1) / teeth) * Math.PI * 2
    path.push(
      i === 0
        ? `M ${cx + outerR * Math.cos(a0)} ${cy + outerR * Math.sin(a0)}`
        : `L ${cx + outerR * Math.cos(a0)} ${cy + outerR * Math.sin(a0)}`,
    )
    path.push(`L ${cx + outerR * Math.cos(a1)} ${cy + outerR * Math.sin(a1)}`)
    path.push(`L ${cx + innerR * Math.cos(a1)} ${cy + innerR * Math.sin(a1)}`)
    path.push(`L ${cx + innerR * Math.cos(a2)} ${cy + innerR * Math.sin(a2)}`)
    path.push(`L ${cx + outerR * Math.cos(a2)} ${cy + outerR * Math.sin(a2)}`)
    path.push(`L ${cx + outerR * Math.cos(a3)} ${cy + outerR * Math.sin(a3)}`)
  }
  path.push('Z')
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={path.join(' ')} />
      {/* Central hub */}
      <circle cx={cx} cy={cy} r={hubR} />
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={holeR} fill="currentColor" stroke="none" />
      {/* 4 spoke marks */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        const x1 = cx + (hubR + 2) * Math.cos(a)
        const y1 = cy + (hubR + 2) * Math.sin(a)
        const x2 = cx + (innerR - 4) * Math.cos(a)
        const y2 = cy + (innerR - 4) * Math.sin(a)
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" opacity="0.6" />
        )
      })}
    </svg>
  )
}

/**
 * Roman-numeral mark — for chapter / problem numbering in display.
 */
export function RomanNumeral({
  n,
  className,
}: {
  n: number
  className?: string
}) {
  return (
    <span className={className} style={{ fontFamily: 'var(--font-cinzel)' }}>
      {toRoman(n)}
    </span>
  )
}

function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
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
