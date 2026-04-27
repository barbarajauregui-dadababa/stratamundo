/**
 * Welcome email sent when a new learner is set up. Gives the contributor
 * a permanent link back to /learner/<id> so they can resume any time.
 *
 * Uses Resend (same client as activity submissions). If RESEND_API_KEY is
 * not set, sending is skipped silently and we return { skipped: true } —
 * the form still completes, but the learner's bookmark URL is the only
 * recovery path.
 */

import { Resend } from 'resend'

interface SendArgs {
  learnerId: string
  learnerName: string
  email: string
}

interface SendResult {
  skipped?: boolean
  emailId?: string
  error?: string
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'Strata Mundo <onboarding@resend.dev>'

export async function sendWelcomeEmail({
  learnerId,
  learnerName,
  email,
}: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { skipped: true }
  }
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const voyageUrl = `${siteUrl}/learner/${learnerId}`

  try {
    const res = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `${learnerName}'s math mastery voyage on Strata Mundo`,
      html: welcomeHtml({ learnerName, voyageUrl }),
    })
    return { emailId: res.data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'unknown email error' }
  }
}

function welcomeHtml({
  learnerName,
  voyageUrl,
}: {
  learnerName: string
  voyageUrl: string
}): string {
  const safeName = escapeHtml(learnerName)
  return `
    <div style="background: #e4d5b2; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 600px; width: 100%; margin: 0 auto; background: #fbf6e7; border: 2px solid #b75000; border-collapse: separate;">
        <tr>
          <td style="padding: 36px 36px 24px;">

            <!-- Brand wordmark -->
            <div style="text-align: center;">
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #92400e; font-weight: bold;">
                ◇ Strata Mundo ◇
              </p>
              <p style="margin: 6px 0 0; font-family: Georgia, serif; font-style: italic; font-size: 14px; color: #78716c;">
                Your math mastery voyage.
              </p>
            </div>

            <!-- Brass ornamental rule -->
            <div style="text-align: center; margin: 22px 0 28px;">
              <span style="display: inline-block; height: 1px; width: 100px; background: #b75000; vertical-align: middle;"></span>
              <span style="display: inline-block; color: #b75000; font-size: 14px; padding: 0 10px; vertical-align: middle;">◇</span>
              <span style="display: inline-block; height: 1px; width: 100px; background: #b75000; vertical-align: middle;"></span>
            </div>

            <!-- Greeting headline -->
            <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #44291a; font-size: 26px; line-height: 1.2; margin: 0 0 18px; font-weight: 600; text-align: center;">
              Welcome aboard
            </h1>

            <!-- Body -->
            <p style="font-family: Georgia, serif; font-size: 16px; line-height: 1.65; color: #292524; margin: 0 0 12px;">
              <strong style="color: #44291a;">${safeName}'s</strong> math mastery voyage is set up and ready.
            </p>

            <ul style="font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #44403c; padding-left: 22px; margin: 0 0 28px;">
              <li>Bookmark the link below — that's how ${safeName} returns any time.</li>
              <li>Save this email too, in case the bookmark gets lost.</li>
            </ul>

            <!-- CTA card -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 28px;">
              <tr>
                <td style="padding: 28px 24px; background: #fef3c7; border: 2px solid #c2864a; border-radius: 3px; text-align: center;">
                  <a href="${voyageUrl}" style="display: inline-block; background: #92400e; color: #fef3c7; padding: 14px 30px; text-decoration: none; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 0.22em; text-transform: uppercase; font-size: 13px; font-weight: bold; border: 1px solid #d4a45f; border-radius: 2px; box-shadow: 0 2px 0 #6b2d09;">
                    Open ${safeName}'s voyage &rarr;
                  </a>
                  <p style="margin: 16px 0 0; font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #78716c; word-break: break-all;">
                    ${voyageUrl}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Closing rule -->
            <div style="text-align: center; margin: 28px 0 18px;">
              <span style="display: inline-block; height: 1px; width: 60px; background: #c2864a; vertical-align: middle;"></span>
            </div>

            <!-- Footer -->
            <p style="font-family: Georgia, serif; font-size: 12px; line-height: 1.6; color: #78716c; font-style: italic; text-align: center; margin: 0;">
              A diagnostic that reads <em>how</em> a learner reasons, a tailored plan, and a probe loop that verifies mastery.
              <br>
              Built with Claude Opus 4.7.
            </p>

          </td>
        </tr>
      </table>
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
