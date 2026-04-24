'use client'

import { useCallback, useState } from 'react'
import { checkMatch, sumPieces, type Fraction } from '@/lib/fraction-math'
import type {
  BuildFractionProblem,
  PieceDenominator,
  PlacedPiece,
  TelemetryEvent,
} from './types'

/**
 * Option A mechanic (post-round-2 feedback).
 *
 * Visual principles:
 *   - All pieces are the SAME COLOR (sky-blue). Size is the only information.
 *   - No text labels on pieces.
 *   - Palette pieces are rendered at the EXACT dimensions they will occupy
 *     when placed — same width AND same height as their slot in the target.
 *   - Target bar has dotted division lines matching the goal's denominator
 *     only (no overlapping halves/thirds/fourths tick chaos).
 *   - Multi-whole targets start with 1 whole; learner taps "+" to add more.
 *   - Pieces flow left-to-right, naturally snapping against dotted divisions
 *     because their widths are factors/multiples of the division width.
 */

const BAR_HEIGHT_PX = 56
const WHOLE_GAP_PX = 16

function widthPerWholePx(numWholes: number): number {
  // Keep total within ~640px card width accounting for gaps and padding.
  if (numWholes <= 1) return 320
  if (numWholes === 2) return 260
  if (numWholes === 3) return 192
  return 144 // 4+
}

const PIECE_FILL = 'bg-sky-400'
const PIECE_BORDER = 'border-sky-700'

function pieceWidthPx(denominator: PieceDenominator, widthPerWhole: number): number {
  return widthPerWhole / denominator
}

function makePieceId(): string {
  return `p-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Compatible-denominator filter. A denominator D is compatible with the
 * goal's denominator N if one divides evenly into the other — meaning
 * pieces of size 1/D align cleanly with the dotted 1/N divisions on the
 * target. For N=4: {1, 2, 4, 8, 12} in our piece set. For N=3: {1, 3, 6, 12}.
 */
function compatibleWithGoal(
  goalDenominator: number,
  pool: PieceDenominator[]
): PieceDenominator[] {
  return pool.filter(
    (d) => d === goalDenominator || goalDenominator % d === 0 || d % goalDenominator === 0
  )
}

/**
 * R1 rule (Barbara, 2026-04-24): for build problems where goal numerator === 1,
 * drop goal.denominator from the palette IF the pruned palette still has MORE
 * THAN 3 denominators. Otherwise keep it (to avoid leaving the learner with
 * too few options).
 */
function applyR1(
  goalNumerator: number,
  goalDenominator: number,
  compatible: PieceDenominator[]
): PieceDenominator[] {
  if (goalNumerator !== 1) return compatible
  const pruned = compatible.filter((d) => d !== goalDenominator)
  return pruned.length > 3 ? pruned : compatible
}

interface PlacedPieceGeom extends PlacedPiece {
  leftPx: number
  widthPx: number
}

function computePlacedGeometry(
  placed: PlacedPiece[],
  widthPerWhole: number
): PlacedPieceGeom[] {
  const result: PlacedPieceGeom[] = []
  let logicalOffset = 0
  for (const p of placed) {
    const widthPx = pieceWidthPx(p.denominator, widthPerWhole)
    const wholeIndex = Math.floor(logicalOffset / widthPerWhole)
    const visualLeft = logicalOffset + wholeIndex * WHOLE_GAP_PX
    result.push({ ...p, leftPx: visualLeft, widthPx })
    logicalOffset += widthPx
  }
  return result
}

interface Props {
  problem: BuildFractionProblem
  onCommitSuccess?: (telemetry: TelemetryEvent[]) => void
  onTelemetryEvent?: (event: TelemetryEvent) => void
  /** Maximum wholes the learner can add via the "+" button. Default 5. */
  maxWholes?: number
}

type DragState =
  | { origin: 'palette'; denominator: PieceDenominator; pointerId: number }

type CommitState = 'idle' | 'failed' | 'success'

export default function FractionWorkspaceV2({
  problem,
  onCommitSuccess,
  onTelemetryEvent,
  maxWholes = 5,
}: Props) {
  const [startedAt] = useState<number>(() => Date.now())
  const [dropZoneEl, setDropZoneEl] = useState<HTMLDivElement | null>(null)

  const [placed, setPlaced] = useState<PlacedPiece[]>([])
  const [numWholes, setNumWholes] = useState<number>(1)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [commitState, setCommitState] = useState<CommitState>('idle')
  const [commitBounceKey, setCommitBounceKey] = useState(0)
  const [commitAttempts, setCommitAttempts] = useState(0)
  const [telemetryLog, setTelemetryLog] = useState<TelemetryEvent[]>([])

  const widthPerWhole = widthPerWholePx(numWholes)
  const wholesTotalPx = widthPerWhole * numWholes
  const wholesVisualWidthPx = wholesTotalPx + (numWholes - 1) * WHOLE_GAP_PX
  const locked = commitState !== 'idle'

  // Compute the palette based on the problem's available_denominators,
  // filtered to compatible + R1 rule applied.
  const compatiblePool = compatibleWithGoal(
    problem.goal.denominator,
    problem.available_denominators
  )
  const displayedDenominators = applyR1(
    problem.goal.numerator,
    problem.goal.denominator,
    compatiblePool
  )

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
      if (locked) return
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      setDrag({ origin: 'palette', denominator, pointerId: e.pointerId })
      setDragPos({ x: e.clientX, y: e.clientY })
    },
    [locked]
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
      if (overDrop && !locked) {
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
    [drag, isPointOverDropZone, placed, logEvent, startedAt, locked]
  )

  const removePlaced = useCallback(
    (pieceId: string) => {
      if (locked) return
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
    [locked, placed, logEvent, startedAt]
  )

  const handleAddWhole = useCallback(() => {
    if (locked) return
    if (numWholes >= maxWholes) return
    setNumWholes((n) => n + 1)
  }, [locked, numWholes, maxWholes])

  const handleCommit = useCallback(() => {
    if (locked || placed.length === 0) return
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
    setCommitAttempts((n) => n + 1)
    if (result === 'success') {
      setCommitState('success')
      onCommitSuccess?.([...telemetryLog, commitEvent])
    } else {
      setCommitState('failed')
      setCommitBounceKey((k) => k + 1)
    }
  }, [locked, placed, problem.goal, startedAt, logEvent, onCommitSuccess, telemetryLog])

  const handleTryAgain = useCallback(() => {
    logEvent({
      type: 'reset',
      t: Date.now() - startedAt,
      after_commit_attempt_number: commitAttempts,
    })
    setPlaced([])
    setNumWholes(1)
    setCommitState('idle')
  }, [logEvent, startedAt, commitAttempts])

  // --- Rendering ---

  const placedWithGeom = computePlacedGeometry(placed, widthPerWhole)
  const totalFilledLogicalPx = placedWithGeom.reduce((acc, p) => acc + p.widthPx, 0)
  const overhangPx = Math.max(0, totalFilledLogicalPx - wholesTotalPx)
  const gapPx = Math.max(0, wholesTotalPx - totalFilledLogicalPx)

  const currentSum = sumPieces(placed.map((p) => p.denominator))
  const canAddMore = numWholes < maxWholes && !locked

  const lastPiece = placedWithGeom[placedWithGeom.length - 1]
  const rightmostVisualPx = lastPiece ? lastPiece.leftPx + lastPiece.widthPx : 0
  const containerContentWidthPx = Math.max(wholesVisualWidthPx, rightmostVisualPx)
  // Extra padding: 16 each side + space for the "+" button on the right if present
  const plusButtonSpace = canAddMore ? 52 : 0
  const containerWidthPx = containerContentWidthPx + 32 + plusButtonSpace

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
        className={commitState === 'failed' ? 'animate-shake' : ''}
      >
        <div
          ref={setDropZoneEl}
          className="relative px-4 py-3 rounded-lg"
          style={{ width: containerWidthPx, height: BAR_HEIGHT_PX + 24 }}
        >
          {/* Whole-unit rectangles, side-by-side with gaps. Each whole shows
              (goalDenom - 1) dotted vertical divisions matching the goal's
              denominator. */}
          {Array.from({ length: numWholes }).map((_, i) => {
            const left = 16 + i * (widthPerWhole + WHOLE_GAP_PX)
            return (
              <div
                key={`whole-${i}`}
                className="absolute rounded-md border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-900"
                style={{
                  left,
                  top: 12,
                  width: widthPerWhole,
                  height: BAR_HEIGHT_PX,
                }}
              />
            )
          })}

          {/* "+" add-another-whole button to the right of the last whole */}
          {canAddMore && (
            <button
              type="button"
              onClick={handleAddWhole}
              aria-label="Add another whole"
              title="Add another whole"
              className="absolute rounded-md border-2 border-dashed border-zinc-400 dark:border-zinc-600 text-zinc-500 text-xl font-light flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              style={{
                left: 16 + numWholes * (widthPerWhole + WHOLE_GAP_PX),
                top: 12,
                width: 36,
                height: BAR_HEIGHT_PX,
              }}
            >
              +
            </button>
          )}

          {/* Placed pieces — positioned at their exact logical+gap-adjusted visual coords. */}
          {placedWithGeom.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => removePlaced(p.id)}
              aria-label="Click to remove this piece"
              title="Click to remove"
              className={`absolute rounded-sm border-2 ${PIECE_FILL} ${PIECE_BORDER} drop-shadow ${locked ? 'cursor-default' : 'hover:brightness-110 hover:ring-2 hover:ring-rose-400 cursor-pointer'} transition`}
              style={{
                left: p.leftPx + 16,
                top: 12,
                width: p.widthPx,
                height: BAR_HEIGHT_PX,
              }}
              disabled={locked}
            />
          ))}
        </div>

        <div className="h-5 mt-2 flex items-center justify-center">
          {overhangPx > 0 && commitState !== 'success' && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Your pieces go past {numWholes === 1 ? 'the whole' : `${numWholes} wholes`}.
              {canAddMore && ' Tap + to add another whole.'}
            </p>
          )}
          {overhangPx === 0 && gapPx > 0 && placed.length > 0 && commitState !== 'success' && (
            <p className="text-xs text-zinc-500">A gap remains.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {commitState === 'idle' && (
          <button
            type="button"
            onClick={handleCommit}
            disabled={placed.length === 0}
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Check my answer
          </button>
        )}
        {commitState === 'failed' && (
          <>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Not quite. Want to try a different way?
            </p>
            <button
              type="button"
              onClick={handleTryAgain}
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Try again
            </button>
          </>
        )}
        {commitState === 'success' && (
          <p className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950 px-6 text-sm font-medium text-emerald-900 dark:text-emerald-200">
            Locked in ✓
          </p>
        )}
      </div>

      {/* Palette — pieces at exact-size (same width AND height as their slot) */}
      <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Pieces</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {displayedDenominators.map((d) => (
            <button
              key={d}
              type="button"
              onPointerDown={(e) => handlePalettePointerDown(e, d)}
              onPointerMove={handlePalettePointerMove}
              onPointerUp={handlePalettePointerUp}
              disabled={locked}
              aria-label="Drag piece"
              className={`rounded-sm border-2 ${PIECE_FILL} ${PIECE_BORDER} drop-shadow cursor-grab active:cursor-grabbing touch-none disabled:opacity-40`}
              style={{
                width: pieceWidthPx(d, widthPerWhole),
                height: BAR_HEIGHT_PX,
              }}
            />
          ))}
        </div>
        <p className="text-xs text-zinc-500">
          {locked
            ? commitState === 'success'
              ? 'Locked in.'
              : 'Pieces are locked. Try again to clear and start over.'
            : 'Drag a piece into the target. Click a placed piece to remove it.'}
        </p>
      </div>

      <details className="w-full text-xs text-zinc-500 mt-2">
        <summary className="cursor-pointer">Debug</summary>
        <div className="mt-2 space-y-1">
          <div>Sum: {currentSum.numerator}/{currentSum.denominator}</div>
          <div>Goal: {problem.goal.numerator}/{problem.goal.denominator}</div>
          <div>Wholes shown: {numWholes} (max {maxWholes})</div>
          <div>Compatible palette pool: [{compatiblePool.join(', ')}]</div>
          <div>Displayed palette (after R1): [{displayedDenominators.join(', ')}]</div>
          <div>Commit attempts: {commitAttempts}</div>
          <div>Events: {telemetryLog.length}</div>
        </div>
      </details>

      {drag && dragPos && (
        <div
          className={`fixed pointer-events-none z-50 rounded-sm border-2 ${PIECE_FILL} ${PIECE_BORDER} shadow-lg`}
          style={{
            width: pieceWidthPx(drag.denominator, widthPerWhole),
            height: BAR_HEIGHT_PX,
            left: dragPos.x - pieceWidthPx(drag.denominator, widthPerWhole) / 2,
            top: dragPos.y - BAR_HEIGHT_PX / 2,
          }}
        />
      )}
    </div>
  )
}

function GoalDisplay({
  goal,
  commitState,
}: {
  goal: Fraction
  commitState: CommitState
}) {
  const ring =
    commitState === 'success'
      ? 'ring-4 ring-emerald-400'
      : commitState === 'failed'
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
