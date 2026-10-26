export interface OtpEmailProps {
  name: string;
  otp: string;
  expiryMinutes?: number;
  rollNo?: string;
}

export function buildOtpEmailContent(props: OtpEmailProps): { html: string; text: string; subject: string } {
  const expiry = props.expiryMinutes ?? 10;
  const subject = `[TWM] Your College Verification Code: ${props.otp}`;

  const text = `
Hello ${props.name},

Your verification code for TWM (Track. Win. Maintain.) is:

${props.otp}

This code expires in ${expiry} minutes.

Enter this code on your onboarding or profile screen to verify your institutional college email and activate your class leaderboard standing.

Security Notice:
- TWM administrators or faculty will NEVER ask you for this code.
- If you did not request this verification, please disregard this email.
- Never share your one-time verification code with anyone.

---
TWM 3.1 — Institutional Developer Activity & Cohort Platform
`.trim();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3F5F9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07090E; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="540" style="max-width: 540px; background-color: #0E121A; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 18, 26, 0) 100%); /* taste-skill-ignore: transactional email header tint, outside the web UI */">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">TWM <span style="color: #10B981;">3.1</span></span>
                    <span style="display: block; font-size: 11px; color: #8E98AB; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Class Developer Platform</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 700; color: #10B981;">
                      EMAIL VERIFICATION
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0;">Hello ${props.name},</h1>
              <p style="font-size: 14px; line-height: 22px; color: #8E98AB; margin: 0 0 28px 0;">
                You are connecting your institutional email to your <strong>TWM developer profile</strong>. Use the 6-digit verification code below to confirm email ownership:
              </p>

              <!-- OTP Digits Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center" style="background-color: #151B24; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 14px; padding: 22px 16px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);">
                    <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #10B981; display: inline-block;">
                      ${props.otp}
                    </span>
                    <span style="display: block; font-size: 12px; color: #8E98AB; margin-top: 8px;">
                      Expires in <strong>${expiry} minutes</strong> (Single-use only)
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Security Callout -->
              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #737D92;">
                  <strong style="color: #F3F5F9;">Security Notice:</strong> TWM administrators and faculty will never request your verification code. If you did not initiate this sign-in request, please ignore this email.
                </p>
              </div>

              <p style="font-size: 13px; line-height: 20px; color: #8E98AB; margin: 0;">
                Once verified, your profile will be tied to your official class roster standing with zero-fabrication guarantees.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #07090E; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #737D92;">
                TWM 3.1 &bull; Track. Win. Maintain. &bull; Class-Scoped Developer Activity Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { html, text, subject };
}
