import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_REVIEW_SECRET
  if (!adminSecret) {
    return NextResponse.json(
      { error: 'ADMIN_REVIEW_SECRET not set on server' },
      { status: 500 },
    )
  }

  let body: {
    submission_id?: string
    action?: string
    notes?: string
    admin_key?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.admin_key !== adminSecret) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }
  if (!body.submission_id || typeof body.submission_id !== 'string') {
    return NextResponse.json({ error: 'submission_id required' }, { status: 400 })
  }
  if (body.action !== 'approve' && body.action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 })
  }

  const newStatus = body.action === 'approve' ? 'human_approved' : 'human_rejected'
  const supabase = await createClient()
  const { error } = await supabase
    .from('activity_submissions')
    .update({
      status: newStatus,
      human_review_notes: body.notes ?? null,
      human_reviewed_by: process.env.ADMIN_EMAIL ?? 'admin',
      human_reviewed_at: new Date().toISOString(),
    })
    .eq('id', body.submission_id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: newStatus })
}
