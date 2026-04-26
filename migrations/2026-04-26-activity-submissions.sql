-- Migration: activity_submissions table
-- Created 2026-04-26 for the "Contribute an activity" feature.
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run; uses IF NOT EXISTS / OR REPLACE everywhere.

CREATE TABLE IF NOT EXISTS activity_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Activity details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('video', 'manipulative', 'game_or_interactive', 'worksheet')),
  url TEXT,
  source_site TEXT,
  duration_minutes INTEGER,
  rationale TEXT,

  -- Standards mapping (CCSS-M ids, e.g. ['3.NF.A.1', '4.NF.A.1'])
  standard_ids TEXT[] NOT NULL,

  -- Contributor
  contributor_name TEXT NOT NULL,
  contributor_email TEXT NOT NULL,

  -- Vetting + approval pipeline
  status TEXT NOT NULL DEFAULT 'pending_ai_vet'
    CHECK (status IN (
      'pending_ai_vet',
      'ai_passed',
      'ai_borderline',
      'ai_rejected',
      'human_approved',
      'human_rejected'
    )),
  ai_vet_verdict TEXT,
  ai_vet_reasoning TEXT,
  ai_vet_flags TEXT[],
  ai_vet_at TIMESTAMPTZ,
  human_review_notes TEXT,
  human_reviewed_by TEXT,
  human_reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_activity_submissions_status ON activity_submissions(status);
CREATE INDEX IF NOT EXISTS idx_activity_submissions_created ON activity_submissions(created_at DESC);

ALTER TABLE activity_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a new activity (the contribute form is public).
DROP POLICY IF EXISTS "anyone_can_submit" ON activity_submissions;
CREATE POLICY "anyone_can_submit" ON activity_submissions
  FOR INSERT TO public
  WITH CHECK (true);

-- Reads are open for v1 demo (admin queue is rendered server-side and
-- gated by a hard-coded admin email check). Tighten later by joining
-- against an admins table.
DROP POLICY IF EXISTS "public_read" ON activity_submissions;
CREATE POLICY "public_read" ON activity_submissions
  FOR SELECT TO public
  USING (true);

-- Updates only via the API route (server-side; uses anon key but the
-- route validates the admin email cookie before mutating). For tighter
-- security, swap to a service-role key in the API route + restrict this
-- policy further.
DROP POLICY IF EXISTS "admin_can_update" ON activity_submissions;
CREATE POLICY "admin_can_update" ON activity_submissions
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);
