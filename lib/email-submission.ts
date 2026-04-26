/**
 * Email notifications for the activity-submission pipeline.
 *
 * Two emails are sent for each submission:
 *   1. Notify the admin (Barbara) with a deep link to the review page.
 *   2. Acknowledge to the contributor that their submission was received.
 *
 * Uses Resend (https://resend.com). Requires:
 *   - RESEND_API_KEY in env
 *   - ADMIN_EMAIL in env (defaults to barbarajauregui@gmail.com)
 *   - NEXT_PUBLIC_SITE_URL in env (e.g., https://stratamundo.com)
 *
 * If RESEND_API_KEY is not set, both emails are skipped silently and
 * sendSubmissionEmails returns { skipped: true }. The submission still
 * lands in the database — the admin can find it via the admin queue.
 * This lets local dev work without setting up Resend.
 */

import { Resend } from 'resend'
import type { ActivitySubmissionInput, ActivityVetResult } from './ai-vet-activity'

interface SendArgs {
  submissionId: string
  submission: ActivitySubmissionInput
  vet: ActivityVetResult
}

interface SendResult {
  skipped?: boolean
  adminEmailId?: string
  contributorEmailId?: string
  error?: string
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'Strata Mundo <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'barbarajauregui@gmail.com'

export async function sendSubmissionEmails({
  submissionId,
  submission,
  vet,
}: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { skipped: true }
  }
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const adminKey = process.env.ADMIN_REVIEW_SECRET ?? ''
  const reviewUrl = `${siteUrl}/admin/submissions/${submissionId}${adminKey ? `?key=${encodeURIComponent(adminKey)}` : ''}`

  try {
    const adminRes = await resend.emails.send({
      from: FROM_ADDRESS,
      to: ADMIN_EMAIL,
      subject: `[Strata Mundo] New activity submission: ${submission.title}`,
      html: adminEmailHtml({ submissionId, submission, vet, reviewUrl }),
    })

    const contributorRes = await resend.emails.send({
      from: FROM_ADDRESS,
      to: submission.contributor_email,
      subject: 'Thank you for contributing to Strata Mundo',
      html: contributorEmailHtml({ submission, vet }),
    })

    return {
      adminEmailId: adminRes.data?.id,
      contributorEmailId: contributorRes.data?.id,
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'unknown email error',
    }
  }
}

function adminEmailHtml({
  submissionId,
  submission,
  vet,
  reviewUrl,
}: SendArgs & { reviewUrl: string }): string {
  const verdictColor =
    vet.verdict === 'pass' ? '#166534' : vet.verdict === 'borderline' ? '#a16207' : '#991b1b'
  const flagsList =
    vet.flags.length > 0 ? `<p><strong>Flags:</strong> ${vet.flags.join(', ')}</p>` : ''
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #92400e; font-family: 'Cinzel', Georgia, serif;">New activity submission</h1>
      <p style="color: #78716c;">Submission ID: <code>${submissionId}</code></p>

      <h2 style="margin-top: 30px;">${escapeHtml(submission.title)}</h2>
      <p><strong>Modality:</strong> ${submission.modality}</p>
      <p><strong>Standards:</strong> ${submission.standard_ids.join(', ')}</p>
      <p><strong>Description:</strong></p>
      <blockquote style="border-left: 3px solid #c2864a; padding-left: 12px; color: #44403c;">
        ${escapeHtml(submission.description)}
      </blockquote>
      ${submission.url ? `<p><strong>URL:</strong> <a href="${escapeHtml(submission.url)}">${escapeHtml(submission.url)}</a></p>` : ''}
      ${submission.source_site ? `<p><strong>Source:</strong> ${escapeHtml(submission.source_site)}</p>` : ''}
      ${typeof submission.duration_minutes === 'number' ? `<p><strong>Duration:</strong> ${submission.duration_minutes} minutes</p>` : ''}
      ${submission.rationale ? `<p><strong>Why it works:</strong> ${escapeHtml(submission.rationale)}</p>` : ''}

      <p><strong>Contributor:</strong> ${escapeHtml(submission.contributor_name)} &lt;${escapeHtml(submission.contributor_email)}&gt;</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #c2864a;">

      <h3 style="color: ${verdictColor};">AI vet verdict: ${vet.verdict.toUpperCase()}</h3>
      <p>${escapeHtml(vet.reasoning)}</p>
      ${flagsList}

      <div style="margin-top: 30px; padding: 16px; background: #fef3c7; border: 2px solid #c2864a; border-radius: 4px;">
        <a href="${reviewUrl}" style="display: inline-block; background: #92400e; color: #fef3c7; padding: 10px 20px; text-decoration: none; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.18em; text-transform: uppercase; font-size: 12px; font-weight: bold;">
          Review submission &rarr;
        </a>
      </div>
    </div>
  `
}

function contributorEmailHtml({
  submission,
  vet,
}: {
  submission: ActivitySubmissionInput
  vet: ActivityVetResult
}): string {
  const verdictMessage =
    vet.verdict === 'pass'
      ? 'Your submission passed our automated review and is now in the queue for human approval.'
      : vet.verdict === 'borderline'
        ? 'Our automated review flagged your submission for closer human review. The human reviewer will look at it soon and may reach out.'
        : "Our automated review found some issues. A human reviewer will still look at your submission, but if you'd like to revise and resubmit, the issues are listed below."
  const flagsBlock =
    vet.flags.length > 0
      ? `<p><strong>Flags:</strong> ${vet.flags.join(', ')}</p>
         <p style="color: #78716c; font-style: italic;">See the criteria documentation at /methodology for what each flag means.</p>`
      : ''
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #92400e; font-family: 'Cinzel', Georgia, serif;">Thank you for contributing</h1>

      <p>Hi ${escapeHtml(submission.contributor_name)},</p>

      <p>Thank you for submitting <strong>${escapeHtml(submission.title)}</strong> to Strata Mundo.</p>

      <p>${verdictMessage}</p>

      ${flagsBlock}

      <p style="color: #78716c; font-style: italic; margin-top: 30px;">
        Strata Mundo is built on the belief that the best learning resources come from many practitioners. The library grows because of contributions like yours.
      </p>
    </div>
  `
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
