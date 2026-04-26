/**
 * AI vetting for community-submitted activities.
 *
 * Strata Mundo lets anyone propose a new learning activity for a CCSS-M
 * standard. Before the human reviewer (Barbara, for v1) sees a submission,
 * Claude Opus 4.7 reads it against the criteria below and returns one of:
 *
 *   - ai_passed       — looks good. Forward to human reviewer with no flags.
 *   - ai_borderline   — has concerns but might be salvageable. Flag for human.
 *   - ai_rejected     — clear problems. Will still surface to human, but the
 *                       contributor is notified that it's unlikely to be
 *                       approved without changes.
 *
 * The AI never approves directly. Final approval requires a human reviewer.
 *
 * ---------------------------------------------------------------------------
 *  AI VETTING CRITERIA — used to construct the system prompt below.
 * ---------------------------------------------------------------------------
 *
 *  These are the criteria the AI applies. They are documented here in
 *  English so Barbara can audit, edit, and version-control them. The
 *  criteria are also embedded verbatim in the system prompt so the model
 *  applies them with full context.
 *
 *  Section 1 — COMPLETENESS (must pass all)
 *    1.1 Title is a specific name, not a generic phrase
 *        ✗ "Math activity"  ✗ "Fractions practice"
 *        ✓ "Build-a-fraction interactive — PhET"
 *    1.2 Description explains what the LEARNER DOES (not just what they learn)
 *        Must include the action (drag, build, draw, fold, sort) and the
 *        concept (unit fractions, equivalence, comparison).
 *    1.3 Modality matches the description
 *        Submission marked "video" → description should reference watching.
 *        Submission marked "manipulative" → description should reference
 *        physical materials.
 *    1.4 At least one CCSS-M standard is selected, and the description
 *        plausibly relates to it.
 *
 *  Section 2 — PEDAGOGICAL FIT (project hard rules; reject if violated)
 *    2.1 NOT a learner-facing chatbot or AI tutor
 *        Strata's hard rule: no chatbot interface for kids. Reject any
 *        activity whose mechanic is "chat with an AI" or similar.
 *    2.2 NOT primarily gamified with tokens, coins, streaks, or leaderboards
 *        Project standing rule: extrinsic-reward gamification is rejected.
 *        A small celebration of correct answers is OK; tokens/coins are not.
 *    2.3 Grade band fits 3rd–4th grade
 *        Pre-K and high-school content rejected. K–2 acceptable if it
 *        addresses a prerequisite standard (the Coherence Map includes
 *        2.G.A.3 and 3.G.A.2).
 *    2.4 Activity actually teaches the standards selected, not adjacent ones
 *        e.g. an activity about "comparing fractions" tagged with "unit
 *        fractions" gets flagged as borderline (mismatch).
 *
 *  Section 3 — SOURCE QUALITY (borderline if any concern)
 *    3.1 If a URL is provided, the domain should be a recognizable
 *        educational source (illustrative-mathematics.org, phet.colorado.edu,
 *        khanacademy.org, mathlearningcenter.org, didax.com, etc.) OR the
 *        URL must be specific enough to verify (a deep link to a particular
 *        lesson, not a homepage).
 *    3.2 If a URL is provided, "source_site" should match the URL's domain.
 *    3.3 For physical materials, a brand or vendor must be identifiable
 *        (Lakeshore, Didax, Montessori-aligned, etc.) so a guide can
 *        actually obtain the material.
 *    3.4 Reject obvious blocklist domains (gambling, ads, link-bait
 *        aggregators, content farms).
 *
 *  Section 4 — SAFETY + APPROPRIATENESS (reject if violated)
 *    4.1 Description is on-topic for math education
 *    4.2 No promotional / advertorial / sales-pitch language
 *    4.3 No personally identifying info about specific children
 *    4.4 Language appropriate for an educational context
 *
 *  Section 5 — NON-DUPLICATION (best-effort, flag for human)
 *    5.1 If submission appears identical to a known curated resource
 *        (matching title + URL + modality), flag for human review with
 *        a note. The human decides whether to merge or reject.
 *
 *  Section 6 — INSTRUCTIONS TO THE AI ITSELF
 *    6.1 Never approve. Only humans approve.
 *    6.2 Never reject for stylistic preferences (formatting, tone of
 *        description, etc.) — that's the human's call.
 *    6.3 Never reject "different from typical" approaches that meet
 *        pedagogical fit. Distinctive approaches are valuable.
 *    6.4 When uncertain, prefer "borderline" over "rejected" — let the
 *        human decide on edge cases.
 *    6.5 Always cite the SPECIFIC criterion violated (e.g., "violates 2.2:
 *        gamified with coins"), not a vague reason.
 *    6.6 Respond ONLY with valid JSON in the schema below — no prose,
 *        no markdown.
 *
 * ---------------------------------------------------------------------------
 */

import Anthropic from '@anthropic-ai/sdk'

export interface ActivitySubmissionInput {
  title: string
  description: string
  modality: 'video' | 'manipulative' | 'game_or_interactive' | 'worksheet'
  url?: string | null
  source_site?: string | null
  duration_minutes?: number | null
  rationale?: string | null
  standard_ids: string[]
  contributor_name: string
  contributor_email: string
}

export interface ActivityVetResult {
  /** One of: 'pass' | 'borderline' | 'reject' */
  verdict: 'pass' | 'borderline' | 'reject'
  /** Human-readable summary of why. 1-3 sentences. */
  reasoning: string
  /** Specific criterion ids violated (e.g. ["1.1", "2.2"]). Empty if pass. */
  flags: string[]
}

const SYSTEM_PROMPT = `You are the AI vetting reviewer for Strata Mundo, a 3rd–4th grade fractions mastery tool. Anyone can propose a new learning activity to add to a learner's plan. Your job is to apply the documented vetting criteria and return a structured verdict.

You NEVER approve a submission directly. Only a human reviewer (Barbara) does. Your job is to PASS, FLAG (borderline), or REJECT based on the criteria. The human reviewer will see your verdict and reasoning either way.

You apply the criteria in order. Every criterion has an ID like "1.1" or "2.3". When you flag or reject, you cite the specific criterion ID(s) violated.

# CRITERIA

## Section 1 — COMPLETENESS (all must pass; otherwise REJECT)
1.1 Title is a specific name, not a generic phrase.
    ✗ "Math activity"  ✗ "Fractions practice"
    ✓ "Build-a-fraction interactive — PhET"
1.2 Description explains what the LEARNER DOES (action + concept).
1.3 Modality matches the description.
1.4 At least one CCSS-M standard selected, plausibly related to the description.

## Section 2 — PEDAGOGICAL FIT (project hard rules; REJECT if violated)
2.1 NOT a learner-facing chatbot or AI tutor.
2.2 NOT primarily gamified with tokens, coins, streaks, or leaderboards.
2.3 Grade band fits 3rd–4th grade (or a Coherence Map prerequisite like 2.G.A.3, 3.G.A.2).
2.4 Activity actually teaches the standards selected, not adjacent ones.

## Section 3 — SOURCE QUALITY (BORDERLINE if any concern)
3.1 URL (if provided) is a recognizable educational source OR a specific deep link.
3.2 source_site matches URL's domain.
3.3 For physical materials, brand or vendor identifiable.
3.4 No obvious blocklist domains (gambling, ads, content farms).

## Section 4 — SAFETY + APPROPRIATENESS (REJECT if violated)
4.1 Description is on-topic for math education.
4.2 No promotional/advertorial language.
4.3 No personally identifying info about specific children.
4.4 Language appropriate for educational context.

## Section 5 — NON-DUPLICATION (BORDERLINE; flag for human)
5.1 If submission appears identical to a known curated resource, flag.

## Section 6 — INSTRUCTIONS TO YOURSELF
6.1 Never approve. Only humans approve.
6.2 Never reject for stylistic preferences.
6.3 Never reject "different from typical" approaches that meet pedagogical fit.
6.4 When uncertain, prefer "borderline" over "rejected".
6.5 Always cite the specific criterion ID(s) violated.
6.6 Respond ONLY with valid JSON in the schema below — no prose, no markdown.

# RESPONSE SCHEMA

\`\`\`json
{
  "verdict": "pass" | "borderline" | "reject",
  "reasoning": "1-3 sentences explaining the verdict, citing criterion IDs.",
  "flags": ["1.1", "2.2"]
}
\`\`\`

If verdict is "pass", flags is empty. If "borderline" or "reject", flags lists the criterion IDs that triggered the decision.`

function buildUserMessage(s: ActivitySubmissionInput): string {
  return `# Submission to vet

**Title:** ${s.title}

**Description:**
${s.description}

**Modality:** ${s.modality}

**URL:** ${s.url ?? '(none)'}

**Source / vendor:** ${s.source_site ?? '(none)'}

**Duration (minutes):** ${s.duration_minutes ?? '(unspecified)'}

**Rationale (why this works):**
${s.rationale ?? '(none provided)'}

**CCSS-M standards selected:** ${s.standard_ids.join(', ')}

**Contributor:** ${s.contributor_name} <${s.contributor_email}>

---

Apply the criteria. Respond with JSON only.`
}

/**
 * Run the AI vet. Returns a structured verdict.
 * Throws on API errors — caller should catch and degrade gracefully.
 */
export async function vetActivitySubmission(
  submission: ActivitySubmissionInput,
  apiKey: string,
): Promise<ActivityVetResult> {
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserMessage(submission) }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('AI vet: no text content in response')
  }

  const raw = textBlock.text.trim()
  // Strip ```json fences if the model adds them despite instructions.
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  let parsed: ActivityVetResult
  try {
    parsed = JSON.parse(stripped)
  } catch (err) {
    throw new Error(`AI vet: response was not valid JSON. Raw: ${raw.slice(0, 200)}`)
  }

  if (!['pass', 'borderline', 'reject'].includes(parsed.verdict)) {
    throw new Error(`AI vet: unexpected verdict "${parsed.verdict}"`)
  }
  if (typeof parsed.reasoning !== 'string') {
    throw new Error('AI vet: missing reasoning string')
  }
  if (!Array.isArray(parsed.flags)) {
    parsed.flags = []
  }

  return parsed
}

/**
 * Map a vet verdict to a database status value.
 */
export function verdictToStatus(verdict: ActivityVetResult['verdict']): string {
  switch (verdict) {
    case 'pass':
      return 'ai_passed'
    case 'borderline':
      return 'ai_borderline'
    case 'reject':
      return 'ai_rejected'
  }
}
