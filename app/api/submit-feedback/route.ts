import { NextRequest, NextResponse } from 'next/server'
import { sendFeedbackEmails } from '@/lib/email-feedback'

interface SubmitBody {
  contributor_name?: unknown
  contributor_email?: unknown
  message?: unknown
}

export async function POST(req: NextRequest) {
  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name =
    typeof body.contributor_name === 'string' && body.contributor_name.trim().length > 0
      ? body.contributor_name.trim()
      : null
  if (
    typeof body.contributor_email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contributor_email)
  ) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }
  if (typeof body.message !== 'string' || body.message.trim().length < 5) {
    return NextResponse.json(
      { error: 'Message must be at least 5 characters.' },
      { status: 400 },
    )
  }

  const emailResult = await sendFeedbackEmails({
    contributor_name: name,
    contributor_email: body.contributor_email.trim().toLowerCase(),
    message: body.message.trim(),
  })

  return NextResponse.json({ ok: true, email: emailResult })
}
