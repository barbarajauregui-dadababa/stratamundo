/**
 * Cloud-strata atmospheric backdrop. CSS-only layered gradients suggesting
 * stratified cloud bands. Used as a decorative `<div>` behind hero content.
 *
 * The layers gently drift (different speeds via animate-drift-slow) so the
 * sky has subtle motion. Honors the brand name — Strata — visibly.
 */
export function CloudStrata({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ''}`}
    >
      {/* Sky gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, oklch(0.92 0.025 75) 0%, oklch(0.96 0.02 70) 35%, oklch(0.93 0.03 60) 100%)',
        }}
      />
      {/* High thin cirrus stratum */}
      <div
        className="absolute inset-0 animate-drift-slow"
        style={{
          opacity: 0.55,
          background:
            'repeating-linear-gradient(115deg, transparent 0px, transparent 32px, oklch(0.99 0.01 70 / 0.45) 32px, oklch(0.99 0.01 70 / 0.45) 36px, transparent 36px, transparent 80px)',
        }}
      />
      {/* Mid stratus band */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: '40%',
          height: '160px',
          background:
            'radial-gradient(ellipse 60% 60% at 30% 50%, oklch(0.94 0.018 75 / 0.85) 0%, transparent 70%), radial-gradient(ellipse 70% 60% at 75% 60%, oklch(0.94 0.018 75 / 0.7) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
      />
      {/* Lower warm haze stratum */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: '40%',
          background:
            'linear-gradient(180deg, transparent 0%, oklch(0.90 0.04 60 / 0.6) 60%, oklch(0.85 0.06 55 / 0.55) 100%)',
        }}
      />
      {/* Subtle texture — a light noise-like grain via radial-gradient stipple */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.12,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, oklch(0.30 0.02 60) 0px, transparent 1px), radial-gradient(circle at 70% 60%, oklch(0.30 0.02 60) 0px, transparent 1px), radial-gradient(circle at 45% 80%, oklch(0.30 0.02 60) 0px, transparent 1px)',
          backgroundSize: '6px 6px, 7px 7px, 5px 5px',
        }}
      />
    </div>
  )
}

/**
 * A simple stylized airship/balloon silhouette in inline SVG.
 * No external image — works at any size/color (via currentColor).
 */
export function Airship({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        {/* Brass-toned gradient for the basket */}
        <linearGradient id="basket-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.10 65)" />
          <stop offset="100%" stopColor="oklch(0.36 0.08 50)" />
        </linearGradient>
        {/* Balloon envelope — striped panels, parchment + warm */}
        <linearGradient id="balloon-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.94 0.025 75)" />
          <stop offset="60%" stopColor="oklch(0.86 0.04 60)" />
          <stop offset="100%" stopColor="oklch(0.72 0.07 50)" />
        </linearGradient>
      </defs>

      {/* Balloon envelope — slightly egg-shaped, panels indicated */}
      <ellipse
        cx="100"
        cy="78"
        rx="68"
        ry="74"
        fill="url(#balloon-fill)"
        stroke="oklch(0.30 0.04 50)"
        strokeWidth="1.2"
      />
      {/* Vertical panel seams (subtle stripes) */}
      {[-50, -25, 0, 25, 50].map((x) => (
        <path
          key={x}
          d={`M ${100 + x} 6 Q ${100 + x * 0.6} 78 ${100 + x} 150`}
          stroke="oklch(0.30 0.04 50 / 0.28)"
          strokeWidth="0.7"
          fill="none"
        />
      ))}
      {/* Top vent ring */}
      <ellipse cx="100" cy="6" rx="14" ry="3" fill="oklch(0.30 0.04 50 / 0.4)" stroke="none" />

      {/* Horizon equator band */}
      <path
        d="M 32 78 Q 100 90 168 78"
        stroke="oklch(0.30 0.04 50 / 0.45)"
        strokeWidth="0.9"
        fill="none"
      />

      {/* Suspension cables */}
      <line x1="40" y1="142" x2="74" y2="180" stroke="oklch(0.36 0.06 50)" strokeWidth="0.8" />
      <line x1="100" y1="152" x2="100" y2="180" stroke="oklch(0.36 0.06 50)" strokeWidth="0.8" />
      <line x1="160" y1="142" x2="126" y2="180" stroke="oklch(0.36 0.06 50)" strokeWidth="0.8" />
      <line x1="65" y1="146" x2="86" y2="180" stroke="oklch(0.36 0.06 50)" strokeWidth="0.8" />
      <line x1="135" y1="146" x2="114" y2="180" stroke="oklch(0.36 0.06 50)" strokeWidth="0.8" />

      {/* Basket — wicker rectangle with brass bands */}
      <rect
        x="68"
        y="180"
        width="64"
        height="38"
        rx="2"
        fill="url(#basket-fill)"
        stroke="oklch(0.25 0.04 50)"
        strokeWidth="1"
      />
      {/* Wicker weave hint */}
      <line x1="68" y1="192" x2="132" y2="192" stroke="oklch(0.25 0.04 50 / 0.4)" strokeWidth="0.6" />
      <line x1="68" y1="204" x2="132" y2="204" stroke="oklch(0.25 0.04 50 / 0.4)" strokeWidth="0.6" />
      {/* Vertical wicker */}
      {[78, 88, 100, 112, 122].map((x) => (
        <line key={x} x1={x} y1="180" x2={x} y2="218" stroke="oklch(0.25 0.04 50 / 0.4)" strokeWidth="0.6" />
      ))}

      {/* Anchor / pennant */}
      <line x1="100" y1="218" x2="100" y2="234" stroke="oklch(0.36 0.06 50)" strokeWidth="0.9" />
      <path d="M 100 222 L 110 225 L 100 228 Z" fill="oklch(0.50 0.13 42)" stroke="oklch(0.36 0.06 50)" strokeWidth="0.6" />
    </svg>
  )
}
