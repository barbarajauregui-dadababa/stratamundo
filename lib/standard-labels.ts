/**
 * Shared helpers for converting a CCSS-M coherence node into a short display
 * label, without paraphrasing. The verbatim statement is what comes from the
 * CCSS-M PDF; for UI surfaces we need something compact, so we extract the
 * earliest natural boundary in the statement and cut there.
 *
 * Per Barbara: short, but always a verbatim PREFIX of the published statement.
 * No invented words. The (i) popover shows the full verbatim statement.
 */

import coherenceMapRaw from '@/content/coherence-map-fractions.json'

export interface CoherenceNodeLite {
  id: string
  statement: string
  cluster_heading?: string
  role?: 'prerequisite' | 'core'
}

const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNodeLite[] }

/** Earliest boundary in a CCSS-M statement that produces a meaningful short
 *  label. Order matters: a comma comes earliest, then a parenthetical or
 *  prepositional clause start, then sentence-end markers. Falls back to a
 *  60-char word-boundary truncation. */
export function shortLabel(stmt: string, maxChars = 60): string {
  const candidates: number[] = []
  const indexOfMany = (needles: string[]): number => {
    let earliest = -1
    for (const n of needles) {
      const i = stmt.indexOf(n)
      if (i > 0 && (earliest === -1 || i < earliest)) earliest = i
    }
    return earliest
  }
  // Comma: earliest natural break in most CCSS-M statements.
  const comma = stmt.indexOf(',')
  if (comma > 0) candidates.push(comma)
  // Common subordinate-clause starters that tend to introduce examples /
  // methods / qualifiers in CCSS-M phrasing.
  const sub = indexOfMany([' by ', ' e.g.', ' such as ', ' when ', ' (', ' using '])
  if (sub > 0) candidates.push(sub)
  // Sentence-end markers.
  const semi = stmt.indexOf(';')
  if (semi > 0) candidates.push(semi)
  const period = stmt.indexOf('. ')
  if (period > 0) candidates.push(period)

  const earliest = candidates.length > 0 ? Math.min(...candidates) : -1
  let label: string
  if (earliest > 0 && earliest <= maxChars + 10) {
    label = stmt.slice(0, earliest).trim()
  } else {
    // Hard truncate at maxChars at the last word boundary.
    const slice = stmt.slice(0, maxChars)
    const lastSpace = slice.lastIndexOf(' ')
    label = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim() + '…'
  }
  return label
}

export function standardName(id: string): string {
  const node = coherenceMap.nodes.find((n) => n.id === id)
  if (!node) return id
  return shortLabel(node.statement)
}

export function standardStatement(id: string): string | undefined {
  return coherenceMap.nodes.find((n) => n.id === id)?.statement
}

export function standardIsPrerequisite(id: string): boolean {
  return coherenceMap.nodes.find((n) => n.id === id)?.role === 'prerequisite'
}
