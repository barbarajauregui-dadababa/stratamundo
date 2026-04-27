/**
 * "Help us improve Strata Mundo" feedback emails.
 *
 * When someone submits feedback through /feedback we send two emails:
 *   1. Confirmation to the contributor — confirms we received their note.
 *   2. Notification to admin (Barbara) — has the full message PLUS a
 *      Reply-To header set to the contributor's address, so when Barbara
 *      hits Reply in her inbox, the email goes back to the contributor
 *      automatically.
 *
 * If RESEND_API_KEY isn't set (local dev without env), this no-ops so the
 * submission still succeeds for testing.
 */

import { Resend } from 'resend'
import { emailLayout, escapeEmailHtml } from './email-layout'

interface FeedbackInput {
  contributor_name: string | null
  contributor_email: string
  message: string
}

interface SendResult {
  contributor: { skipped?: boolean; emailId?: string; error?: string }
  admin: { skipped?: boolean; emailId?: string; error?: string }
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'Strata Mundo <onboarding@resend.dev>'

export async function sendFeedbackEmails(input: FeedbackInput): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { contributor: { skipped: true }, admin: { skipped: true } }
  }
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const adminEmail = process.env.ADMIN_EMAIL
  const cloudscapeUrl = `${siteUrl}/images/cloudscape-denis.jpg`

  const contributorEmailHtml = renderContributorEmail({ ...input, cloudscapeUrl })
  const adminEmailHtml = renderAdminEmail({ ...input, cloudscapeUrl })

  // Both sends in parallel.
  const [contributorRes, adminRes] = await Promise.all([
    resend.emails
      .send({
        from: FROM_ADDRESS,
        to: input.contributor_email,
        subject: 'We received your feedback — Strata Mundo',
        html: contributorEmailHtml,
      })
      .then((r) => ({ emailId: r.data?.id }))
      .catch((err) => ({
        error: err instanceof Error ? err.message : 'unknown email error',
      })),
    adminEmail
      ? resend.emails
          .send({
            from: FROM_ADDRESS,
            to: adminEmail,
            replyTo: input.contributor_email,
            subject: `[Strata Mundo feedback] from ${input.contributor_name ?? input.contributor_email}`,
            html: adminEmailHtml,
          })
          .then((r) => ({ emailId: r.data?.id }))
          .catch((err) => ({
            error: err instanceof Error ? err.message : 'unknown email error',
          }))
      : Promise.resolve({ skipped: true } as { skipped: true }),
  ])

  return { contributor: contributorRes, admin: adminRes }
}

function renderContributorEmail({
  contributor_name,
  message,
  cloudscapeUrl,
}: FeedbackInput & { cloudscapeUrl: string }): string {
  const safeName = contributor_name ? escapeEmailHtml(contributor_name) : 'there'
  return emailLayout({
    cloudscapeUrl,
    body: `
      <h1 style="font-family: Georgia, serif; color: #44291a; font-size: 24px; line-height: 1.3; margin: 0 0 14px; font-weight: 600; text-align: center;">
        We received your feedback
      </h1>
      <p style="font-family: Georgia, serif; font-size: 16px; line-height: 1.65; color: #292524; margin: 0 0 8px;">
        Hi ${safeName},
      </p>
      <ul style="font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #44403c; padding-left: 22px; margin: 0 0 24px;">
        <li>Thank you for taking the time to write to us.</li>
        <li>Barbara reads every note personally and replies when something is actionable.</li>
        <li>Replies usually go out within a few days.</li>
      </ul>
      <p style="margin: 14px 0 4px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #92400e; font-weight: bold;">
        Your message
      </p>
      <p style="margin: 0; padding-left: 12px; border-left: 3px solid #c2864a; font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #44403c; font-style: italic; white-space: pre-wrap;">
        ${escapeEmailHtml(message)}
      </p>
    `,
    footerLine:
      'Strata Mundo gets better because people like you write in.<br>Built with Claude Opus 4.7.',
  })
}

function renderAdminEmail({
  contributor_name,
  contributor_email,
  message,
  cloudscapeUrl,
}: FeedbackInput & { cloudscapeUrl: string }): string {
  return emailLayout({
    cloudscapeUrl,
    body: `
      <h1 style="font-family: Georgia, serif; color: #44291a; font-size: 22px; line-height: 1.3; margin: 0 0 14px; font-weight: 600; text-align: center;">
        New feedback from a learner / parent / contributor
      </h1>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #292524; margin: 0 0 16px;">
        <tr>
          <td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c;"><strong>From</strong></td>
          <td style="padding: 2px 0; vertical-align: top;">${contributor_name ? escapeEmailHtml(contributor_name) + ' &lt;' : ''}<a href="mailto:${escapeEmailHtml(contributor_email)}" style="color: #92400e;">${escapeEmailHtml(contributor_email)}</a>${contributor_name ? '&gt;' : ''}</td>
        </tr>
      </table>
      <p style="margin: 0 0 4px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #92400e; font-weight: bold;">
        Message
      </p>
      <p style="margin: 0; padding-left: 12px; border-left: 3px solid #c2864a; font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #44403c; white-space: pre-wrap;">
        ${escapeEmailHtml(message)}
      </p>
      <p style="margin: 22px 0 0; font-family: Georgia, serif; font-size: 12px; color: #78716c; font-style: italic;">
        Reply directly to this email — your reply will go to ${escapeEmailHtml(contributor_email)}.
      </p>
    `,
    footerLine: 'Feedback channel · stratamundo.com',
  })
}
