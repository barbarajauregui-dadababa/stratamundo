/**
 * One-time setup script — creates the Plan Architect agent and its environment
 * on Anthropic's Managed Agents infrastructure.
 *
 * Run ONCE locally:
 *   npx tsx scripts/setup-plan-architect.ts
 *
 * Output: two IDs to copy into .env.local (and Vercel env vars):
 *   PLAN_ARCHITECT_AGENT_ID=agent_...
 *   PLAN_ARCHITECT_ENVIRONMENT_ID=env_...
 *
 * Idempotent-ish: running it again just creates another agent/environment.
 * We only need one of each for v1, so run once and save the IDs.
 */

import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { PLAN_ARCHITECT_SYSTEM_PROMPT } from '../lib/plan-architect-prompt'

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set. Put it in .env.local.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  console.log('Creating Plan Architect agent...')
  const agent = await client.beta.agents.create({
    name: 'Plan Architect — Fractions Mastery Tracker',
    model: 'claude-opus-4-7',
    system: PLAN_ARCHITECT_SYSTEM_PROMPT,
    tools: [{ type: 'agent_toolset_20260401' }],
  })
  console.log(`  agent.id: ${agent.id}`)
  console.log(`  agent.version: ${agent.version}`)

  console.log('\nCreating environment...')
  const environment = await client.beta.environments.create({
    name: 'plan-architect-env',
    config: {
      type: 'cloud',
      networking: { type: 'unrestricted' },
    },
  })
  console.log(`  environment.id: ${environment.id}`)

  console.log('\n✅ Setup complete. Add these to .env.local AND Vercel env vars:\n')
  console.log(`PLAN_ARCHITECT_AGENT_ID=${agent.id}`)
  console.log(`PLAN_ARCHITECT_ENVIRONMENT_ID=${environment.id}`)
  console.log('')
}

main().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
