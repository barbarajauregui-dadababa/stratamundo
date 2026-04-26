-- Migration: allow 'other' as a valid modality on activity_submissions.
-- Run this in the Supabase SQL editor AFTER the initial migration
-- (2026-04-26-activity-submissions.sql).
-- Safe to re-run.

ALTER TABLE activity_submissions
  DROP CONSTRAINT IF EXISTS activity_submissions_modality_check;

ALTER TABLE activity_submissions
  ADD CONSTRAINT activity_submissions_modality_check
  CHECK (modality IN ('video', 'manipulative', 'game_or_interactive', 'worksheet', 'other'));
