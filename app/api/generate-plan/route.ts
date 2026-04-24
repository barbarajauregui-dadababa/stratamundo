import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildPlanArchitectUserMessage } from '@/lib/plan-architect-prompt'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'
import misconceptionsRaw from '@/content/fractions-misconceptions.json'
import resourcesRaw from '@/content/fractions-resources.json'

/**
 * Managed Agent sessions can run for minutes. Vercel's Hobby plan caps server
 * functions at 60s; Pro at 300s. Set the ceiling to the max Vercel allows so
 * the synchronous stream-consume has room to complete. If the Plan Architect
 * exceeds this, we need to move to an async polling pattern.
 */
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const agentId = process.env.PLAN_ARCHITECT_AGENT_ID
  const environmentId = process.env.PLAN_ARCHITECT_ENVIRONMENT_ID

  if (!apiKey || !agentId || !environmentId) {
    return NextResponse.json(
      {
        error:
          'Plan Architect not configured. Required env vars: ANTHROPIC_API_KEY, PLAN_ARCHITECT_AGENT_ID, PLAN_ARCHITECT_ENVIRONMENT_ID. Run scripts/setup-plan-architect.ts first.',
      },
      { status: 500 }
    )
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

  // Fetch the assessment + its learner_id + the mastery map that the analysis
  // step produced. We cannot generate a plan until analysis has run.
  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select('id, learner_id, mastery_map')
    .eq('id', assessmentId)
    .single()
  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'assessment not found' }, { status: 404 })
  }
  if (!assessment.mastery_map) {
    return NextResponse.json(
      { error: 'assessment has not been analyzed yet; run analysis first' },
      { status: 400 }
    )
  }

  // Pull any prior plans for this learner — so the Plan Architect knows what
  // to avoid re-prescribing if a past activity didn't clear the misconception.
  const { data: priorPlans } = await supabase
    .from('plans')
    .select('id, assessment_id, generated_at, plan_content')
    .eq('learner_id', assessment.learner_id)
    .order('generated_at', { ascending: false })
    .limit(3)

  const client = new Anthropic({ apiKey })

  // 1. Start a session against the Plan Architect agent.
  const session = await client.beta.sessions.create({
    agent: agentId,
    environment_id: environmentId,
    title: `Plan for assessment ${assessmentId}`,
  })

  // 2. Open the event stream FIRST so we don't miss early events.
  const stream = await client.beta.sessions.events.stream(session.id)

  // 3. Send the user message containing the mastery map + reference data.
  const userMessage = buildPlanArchitectUserMessage({
    mastery_map: assessment.mastery_map,
    resource_library: resourcesRaw,
    misconception_taxonomy: misconceptionsRaw,
    coherence_map_subgraph: coherenceMapRaw,
    prior_plans: priorPlans ?? [],
  })

  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: 'user.message',
        content: [{ type: 'text', text: userMessage }],
      },
    ],
  })

  // 4. Collect the agent's text output until the session goes idle.
  let collectedText = ''
  for await (const event of stream) {
    if (event.type === 'agent.message') {
      for (const block of event.content) {
        if (block.type === 'text') {
          collectedText += block.text
        }
      }
    } else if (event.type === 'session.status_idle') {
      break
    }
  }

  // 5. Parse the agent's final output. Strip markdown fences defensively.
  let planText = collectedText.trim()
  if (planText.startsWith('```')) {
    planText = planText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  let planContent: unknown
  try {
    planContent = JSON.parse(planText)
  } catch {
    return NextResponse.json(
      {
        error: 'Plan Architect returned invalid JSON',
        raw: collectedText.slice(0, 1000),
        session_id: session.id,
      },
      { status: 500 }
    )
  }

  // 6. Supersede any previous active plan for this learner/assessment, then
  // save the new plan.
  await supabase
    .from('plans')
    .update({ status: 'superseded' })
    .eq('learner_id', assessment.learner_id)
    .eq('status', 'active')

  const { data: savedPlan, error: insertError } = await supabase
    .from('plans')
    .insert({
      learner_id: assessment.learner_id,
      assessment_id: assessment.id,
      plan_content: planContent,
      status: 'active',
    })
    .select('id, generated_at')
    .single()
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({
    plan_id: savedPlan.id,
    generated_at: savedPlan.generated_at,
    session_id: session.id,
    plan_content: planContent,
  })
}
