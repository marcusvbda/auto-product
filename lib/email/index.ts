import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`

export async function sendConfirmationEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/confirm-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Confirm your email address',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Welcome${name ? `, ${name}` : ''}!</h2>
        <p>Please confirm your email address to get started.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">
          Confirm email
        </a>
        <p style="color:#666;font-size:14px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">
          Reset password
        </a>
        <p style="color:#666;font-size:14px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

export async function sendInviteEmail(
  to: string,
  companyName: string,
  inviterName: string,
  token: string
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `You're invited to join ${companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>You're invited!</h2>
        <p>${inviterName} has invited you to join <strong>${companyName}</strong>.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">
          Accept invitation
        </a>
        <p style="color:#666;font-size:14px">This invitation expires in 7 days.</p>
      </div>
    `,
  })
}

export async function sendPaymentFailedEmail(to: string, companyName: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment failed for ${companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Payment failed</h2>
        <p>We couldn't process your payment for <strong>${companyName}</strong>.</p>
        <p>Please update your payment method to keep your subscription active.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px">
          Update payment
        </a>
      </div>
    `,
  })
}
