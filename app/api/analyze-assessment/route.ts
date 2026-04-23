import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAllProblems } from '@/lib/problem-selection'
import { ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_INSTRUCTIONS } from '@/lib/analysis-prompt'
import conceptGraphRaw from '@/content/fractions-concept-graph.json'
import misconceptionsRaw from '@/content/fractions-misconceptions.json'

// Opus is the premium tier; 10–25 sec typical runtime. Raise Vercel timeout
// so the synchronous fetch doesn't get cut off on slow analyses.
export const maxDuration = 60

type LearnerResponse = { problem_id: string; answer: string | null; work_shown: string | null }

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set on server' }, { status: 500 })
  }

  let body: { assessment_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  const assessmentId = body.assessment_id
  if (!assessmentId) {
    return NextResponse.json({ error: 'assessment_id required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select('id, completed_at, responses')
    .eq('id', assessmentId)
    .single()
  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'assessment not found' }, { status: 404 })
  }
  if (!assessment.completed_at) {
    return NextResponse.json({ error: 'assessment not yet completed' }, { status: 400 })
  }

  const responses = (assessment.responses as LearnerResponse[] | null) ?? []
  if (responses.length === 0) {
    return NextResponse.json({ error: 'assessment has no responses' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })

  // Cache breakpoint strategy: system prompt + full problem bank + misconceptions are
  // stable across every analysis call (same bank, same taxonomy). Put the cache marker
  // on the last system block so the whole system array is cached. Learner responses
  // vary per call and stay uncached. One breakpoint = minimum overhead, max hit rate.

  const problemBank = getAllProblems()
  const conceptGraph = conceptGraphRaw as unknown as { nodes: Array<{ id: string }> }
  const subSkillIds = conceptGraph.nodes.map((n) => n.id)

  const apiResponse = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4000,
    system: [
      { type: 'text', text: ANALYSIS_SYSTEM_PROMPT },
      {
        type: 'text',
        text: `PROBLEM BANK (reference):\n${JSON.stringify(problemBank, null, 2)}`,
      },
      {
        type: 'text',
        text: `MISCONCEPTION TAXONOMY (reference):\n${JSON.stringify(misconceptionsRaw, null, 2)}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `LEARNER RESPONSES:
${JSON.stringify(responses, null, 2)}

SUB-SKILL LIST (produce an entry for each, even if "not_assessed"):
${JSON.stringify(subSkillIds)}

${ANALYSIS_USER_INSTRUCTIONS}`,
      },
    ],
  })

  const firstBlock = apiResponse.content[0]
  if (!firstBlock || firstBlock.type !== 'text') {
    return NextResponse.json({ error: 'unexpected response format from model' }, { status: 500 })
  }

  let jsonText = firstBlock.text.trim()
  // Defensively strip markdown code fences if the model wraps its output.
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  let masteryMap: unknown
  try {
    masteryMap = JSON.parse(jsonText)
  } catch {
    return NextResponse.json(
      { error: 'model returned invalid JSON', raw: firstBlock.text.slice(0, 500) },
      { status: 500 }
    )
  }

  const { error: updateError } = await supabase
    .from('assessments')
    .update({ mastery_map: masteryMap })
    .eq('id', assessmentId)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    mastery_map: masteryMap,
    usage: apiResponse.usage,
  })
}
