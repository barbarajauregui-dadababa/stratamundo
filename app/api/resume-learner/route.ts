import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendResumeEmail } from '@/lib/email-resume'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  let body: { email?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  ) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  const email = body.email.trim().toLowerCase()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('learners')
    .select('id, name')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(20)

  // Privacy: respond success regardless of whether learners were found.
  // If 0, sendResumeEmail returns { skipped: true } and no email goes out.
  if (error) {
    // Log + return success anyway so we don't leak DB errors externally,
    // but the lookup failed — caller's email won't arrive.
    console.warn('resume-learner: db lookup failed', error.message)
    return NextResponse.json({ ok: true })
  }

  const learners = (data ?? []) as { id: string; name: string }[]
  await sendResumeEmail({ email, learners })

  return NextResponse.json({ ok: true })
}
