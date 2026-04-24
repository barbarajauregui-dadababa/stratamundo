'use client'

import { useCallback, useEffect, useState } from 'react'
import { checkMatch, sumPieces, type Fraction } from '@/lib/fraction-math'
import type {
  BuildFractionProblem,
  PieceDenominator,
  PlacedPiece,
  TelemetryEvent,
} from './types'

/** Pixel width representing one whole unit (1/1 of a bar). Pieces are sized
 *  as WIDTH_PER_WHOLE / denominator. Multi-unit targets (goal > 1) render
 *  numWholes * WIDTH_PER_WHOLE total. */
const WIDTH_PER_WHOLE_PX = 320
const BAR_HEIGHT_PX = 64

const PIECE_COLORS: Record<PieceDenominator, string> = {
  1: 'bg-lime-500',
  2: 'bg-sky-400',
  3: 'bg-purple-400',
  4: 'bg-emerald-400',
  5: 'bg-pink-400',
  6: 'bg-orange-400',
  8: 'bg-amber-400',
  10: 'bg-rose-400',
  12: 'bg-teal-400',
}

const PIECE_BORDER: Record<PieceDenominator, string> = {
  1: 'border-lime-700',
  2: 'border-sky-600',
  3: 'border-purple-600',
  4: 'border-emerald-600',
  5: 'border-pink-600',
  6: 'border-orange-600',
  8: 'border-amber-600',
  10: 'border-rose-600',
  12: 'border-teal-600',
}

function pieceWidthPx(denominator: PieceDenominator): number {
  return WIDTH_PER_WHOLE_PX / denominator
}

function pieceLabel(denominator: PieceDenominator): string {
  return denominator === 1 ? '1' : `1/${denominator}`
}

function makePieceId(): string {
  return `p-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}`
}

interface PlacedPieceGeom extends PlacedPiece {
  leftPx: number
  widthPx: number
}

function computePlacedGeometry(placed: PlacedPiece[]): PlacedPieceGeom[] {
  const result: PlacedPieceGeom[] = []
  let offset = 0
  for (const p of placed) {
    const widthPx = pieceWidthPx(p.denominator)
    result.push({ ...p, leftPx: offset, widthPx })
    offset += widthPx
  }
  return result
}

interface Props {
  problem: BuildFractionProblem
  onCommitSuccess?: (telemetry: TelemetryEvent[]) => void
  /** Fired on every telemetry event — caller can persist to Supabase. */
  onTelemetryEvent?: (event: TelemetryEvent) => void
}

type DragState =
  | { origin: 'palette'; denominator: PieceDenominator; pointerId: number }

export default function FractionWorkspace({ problem, onCommitSuccess, onTelemetryEvent }: Props) {
  const [startedAt] = useState<number>(() => Date.now())
  const [dropZoneEl, setDropZoneEl] = useState<HTMLDivElement | null>(null)

  const [placed, setPlaced] = useState<PlacedPiece[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [commitState, setCommitState] = useState<'idle' | 'bouncing' | 'success'>('idle')
  const [commitBounceKey, setCommitBounceKey] = useState(0)
  const [telemetryLog, setTelemetryLog] = useState<TelemetryEvent[]>([])

  const numWholes = Math.max(1, problem.target_whole_value ?? 1)
  const totalTargetWidthPx = WIDTH_PER_WHOLE_PX * numWholes

  const logEvent = useCallback(
    (event: TelemetryEvent) => {
      setTelemetryLog((prev) => [...prev, event])
      onTelemetryEvent?.(event)
    },
    [onTelemetryEvent]
  )

  const isPointOverDropZone = useCallback(
    (x: number, y: number): boolean => {
      if (!dropZoneEl) return false
      const r = dropZoneEl.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    },
    [dropZoneEl]
  )

  const handlePalettePointerDown = useCallback(
    (e: React.PointerEvent, denominator: PieceDenominator) => {
      if (commitState === 'success') return
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      setDrag({ origin: 'palette', denominator, pointerId: e.pointerId })
      setDragPos({ x: e.clientX, y: e.clientY })
    },
    [commitState]
  )

  const handlePalettePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      setDragPos({ x: e.clientX, y: e.clientY })
    },
    [drag]
  )

  const handlePalettePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      const overDrop = isPointOverDropZone(e.clientX, e.clientY)
      ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      if (overDrop) {
        const newPiece: PlacedPiece = { id: makePieceId(), denominator: drag.denominator }
        const next = [...placed, newPiece]
        setPlaced(next)
        logEvent({
          type: 'placement',
          t: Date.now() - startedAt,
          denominator: drag.denominator,
          placed_count_after: next.length,
        })
      }
      setDrag(null)
      setDragPos(null)
    },
    [drag, isPointOverDropZone, placed, logEvent, startedAt]
  )

  const removePlaced = useCallback(
    (pieceId: string) => {
      if (commitState === 'success') return
      const piece = placed.find((p) => p.id === pieceId)
      if (!piece) return
      const next = placed.filter((p) => p.id !== pieceId)
      setPlaced(next)
      logEvent({
        type: 'removal',
        t: Date.now() - startedAt,
        denominator: piece.denominator,
        placed_count_after: next.length,
      })
    },
    [commitState, placed, logEvent, startedAt]
  )

  const handleCommit = useCallback(() => {
    if (commitState === 'success' || placed.length === 0) return
    const result = checkMatch(
      placed.map((p) => p.denominator),
      problem.goal
    )
    const commitEvent: TelemetryEvent = {
      type: 'commit_attempt',
      t: Date.now() - startedAt,
      placed: placed.map((p) => p.denominator),
      result,
    }
    logEvent(commitEvent)
    if (result === 'success') {
      setCommitState('success')
      onCommitSuccess?.([...telemetryLog, commitEvent])
    } else {
      setCommitState('bouncing')
      setCommitBounceKey((k) => k + 1)
    }
  }, [commitState, placed, problem.goal, startedAt, logEvent, onCommitSuccess, telemetryLog])

  useEffect(() => {
    if (commitState !== 'bouncing') return
    const t = setTimeout(() => setCommitState('idle'), 450)
    return () => clearTimeout(t)
  }, [commitState, commitBounceKey])

  // --- Rendering ---

  const placedWithGeom = computePlacedGeometry(placed)
  const totalFilledPx = placedWithGeom.reduce((acc, p) => acc + p.widthPx, 0)
  const overhangPx = Math.max(0, totalFilledPx - totalTargetWidthPx)
  const gapPx = Math.max(0, totalTargetWidthPx - totalFilledPx)

  const currentSum = sumPieces(placed.map((p) => p.denominator))

  // Unit divider positions (vertical lines at each whole-unit boundary, when numWholes > 1)
  const dividerXs: number[] = []
  for (let i = 1; i < numWholes; i++) dividerXs.push(i * WIDTH_PER_WHOLE_PX)

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {problem.framing_text && (
        <p className="text-center text-zinc-700 dark:text-zinc-300 max-w-lg">
          {problem.framing_text}
        </p>
      )}

      <GoalDisplay goal={problem.goal} commitState={commitState} />

      <div
        key={commitBounceKey}
        className={commitState === 'bouncing' ? 'animate-shake' : ''}
      >
        {/* Drop zone — a padded rectangle around the bar(s) so pieces can land
            in the overhang area, not just inside the whole(s). */}
        <div
          ref={setDropZoneEl}
          className="relative px-4 py-3 rounded-lg"
          style={{ width: totalTargetWidthPx + overhangPx + 32 }}
        >
          {/* Bar(s) outline — one big rounded rectangle numWholes wholes wide,
              with vertical dividers at each whole boundary. */}
          <div
            className="relative rounded-md border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-900"
            style={{ width: totalTargetWidthPx, height: BAR_HEIGHT_PX }}
          >
            {dividerXs.map((x) => (
              <div
                key={x}
                className="absolute top-0 h-full border-l-2 border-dashed border-zinc-300 dark:border-zinc-700"
                style={{ left: x }}
              />
            ))}
          </div>

          {/* Placed pieces positioned over (and potentially past) the bar area.
              Offset accounts for the drop zone's px-4 padding. */}
          {placedWithGeom.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => removePlaced(p.id)}
              aria-label={`Remove ${pieceLabel(p.denominator)} piece — click to remove`}
              title="Click to remove"
              className={`absolute rounded-sm border-2 ${PIECE_COLORS[p.denominator]} ${PIECE_BORDER[p.denominator]} flex items-center justify-center text-xs font-bold text-white drop-shadow hover:brightness-110 hover:ring-2 hover:ring-rose-400 transition cursor-pointer`}
              style={{
                left: p.leftPx + 16, // +16 to account for drop zone's px-4 padding
                top: 12, // drop zone's py-3 + a bit
                width: p.widthPx,
                height: BAR_HEIGHT_PX,
              }}
              disabled={commitState === 'success'}
            >
              {pieceLabel(p.denominator)}
            </button>
          ))}
        </div>
        <div className="h-5 mt-2 flex items-center justify-center">
          {overhangPx > 0 && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Your pieces go past {numWholes === 1 ? 'the whole' : `${numWholes} wholes`}.
            </p>
          )}
          {overhangPx === 0 && gapPx > 0 && placed.length > 0 && (
            <p className="text-xs text-zinc-500">A gap remains.</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCommit}
        disabled={placed.length === 0 || commitState === 'success'}
        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {commitState === 'success' ? 'Locked in ✓' : 'Check my answer'}
      </button>

      <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Pieces</p>
        <div className="flex flex-wrap items-end justify-center gap-3">
          {problem.available_denominators.map((d) => (
            <button
              key={d}
              type="button"
              onPointerDown={(e) => handlePalettePointerDown(e, d)}
              onPointerMove={handlePalettePointerMove}
              onPointerUp={handlePalettePointerUp}
              disabled={commitState === 'success'}
              className={`rounded-sm border-2 ${PIECE_COLORS[d]} ${PIECE_BORDER[d]} h-10 flex items-center justify-center text-xs font-bold text-white drop-shadow cursor-grab active:cursor-grabbing touch-none disabled:opacity-40`}
              style={{ width: pieceWidthPx(d) }}
              aria-label={`Drag a ${pieceLabel(d)} piece`}
            >
              {pieceLabel(d)}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Drag a piece into the bar. Click a placed piece to remove it.
        </p>
      </div>

      <details className="w-full text-xs text-zinc-500 mt-2">
        <summary className="cursor-pointer">Debug (current state)</summary>
        <div className="mt-2 space-y-1">
          <div>
            Sum: {currentSum.numerator}/{currentSum.denominator}
          </div>
          <div>
            Placed: [{placed.map((p) => pieceLabel(p.denominator)).join(', ')}]
          </div>
          <div>Target wholes: {numWholes}</div>
          <div>Events: {telemetryLog.length}</div>
        </div>
      </details>

      {drag && dragPos && (
        <div
          className={`fixed pointer-events-none z-50 rounded-sm border-2 ${PIECE_COLORS[drag.denominator]} ${PIECE_BORDER[drag.denominator]} h-10 flex items-center justify-center text-xs font-bold text-white shadow-lg`}
          style={{
            width: pieceWidthPx(drag.denominator),
            left: dragPos.x - pieceWidthPx(drag.denominator) / 2,
            top: dragPos.y - 20,
          }}
        >
          {pieceLabel(drag.denominator)}
        </div>
      )}
    </div>
  )
}

function GoalDisplay({
  goal,
  commitState,
}: {
  goal: Fraction
  commitState: 'idle' | 'bouncing' | 'success'
}) {
  const ring =
    commitState === 'success'
      ? 'ring-4 ring-emerald-400'
      : commitState === 'bouncing'
      ? 'ring-4 ring-rose-400'
      : 'ring-2 ring-zinc-300 dark:ring-zinc-700'
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-wide text-zinc-500">Goal</span>
      <div
        className={`rounded-md bg-white dark:bg-zinc-950 px-6 py-3 ${ring} transition-all`}
      >
        <div className="flex flex-col items-center leading-none">
          <span className="text-3xl font-semibold">{goal.numerator}</span>
          <span className="w-10 border-t-2 border-zinc-700 dark:border-zinc-300 my-1" />
          <span className="text-3xl font-semibold">{goal.denominator}</span>
        </div>
      </div>
    </div>
  )
}
