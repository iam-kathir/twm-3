import type { EmailMessage, EmailProvider, EmailSendResult } from "./types.ts";

/**
 * In-memory test email queue for automated tests and local inspection
 */
const mockEmailQueue: EmailMessage[] = [];

export function getMockEmailQueue(): EmailMessage[] {
  return [...mockEmailQueue];
}

export function clearMockEmailQueue(): void {
  mockEmailQueue.length = 0;
}

export class MockTestEmailProvider implements EmailProvider {
  name = "mock";

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    mockEmailQueue.push({ ...message });
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      provider: "mock",
    };
  }
}

export class ResendEmailProvider implements EmailProvider {
  name = "resend";
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string = "TWM Platform <verify@twm.class>") {
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const fromAddress = message.from || process.env.RESEND_FROM_EMAIL || this.defaultFrom;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "TWM-3.1-Email-Service",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          provider: "resend",
          error: data?.message || `Resend HTTP error ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data?.id || `resend-${Date.now()}`,
        provider: "resend",
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "resend",
        error: err?.message || "Network timeout connecting to Resend API",
      };
    }
  }
}

export class SendgridEmailProvider implements EmailProvider {
  name = "sendgrid";
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string = "TWM Platform <verify@twm.class>") {
    this.apiKey = apiKey;
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    const fromAddress = message.from || process.env.SENDGRID_FROM_EMAIL || this.defaultFrom;

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: message.to }] }],
          from: { email: fromAddress },
          subject: message.subject,
          content: [
            { type: "text/plain", value: message.text },
            { type: "text/html", value: message.html },
          ],
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        return {
          success: false,
          provider: "sendgrid",
          error: errText || `SendGrid HTTP error ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: `sendgrid-${Date.now()}`,
        provider: "sendgrid",
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "sendgrid",
        error: err?.message || "Network timeout connecting to SendGrid API",
      };
    }
  }
}

/**
 * Returns the configured transactional email provider based on active environment variables.
 * Prioritizes:
 * 1. Test Mock Provider (in test environments or if explicitly set)
 * 2. Resend (if RESEND_API_KEY is present)
 * 3. SendGrid (if SENDGRID_API_KEY is present)
 * 4. Fails closed with unconfigured provider in production
 */
export function getEmailProvider(): EmailProvider {
  if (process.env.NODE_ENV === "test" || process.env.EMAIL_PROVIDER === "mock") {
    return new MockTestEmailProvider();
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.trim().length > 0) {
    return new ResendEmailProvider(resendKey.trim(), process.env.RESEND_FROM_EMAIL);
  }

  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey && sendgridKey.trim().length > 0) {
    return new SendgridEmailProvider(sendgridKey.trim(), process.env.SENDGRID_FROM_EMAIL);
  }

  // Fallback: If in dev and neither key is set, use mock provider with logged warning
  if (process.env.NODE_ENV !== "production") {
    return new MockTestEmailProvider();
  }

  // In production with no configured provider: fail closed
  return {
    name: "unconfigured",
    async sendEmail(): Promise<EmailSendResult> {
      return {
        success: false,
        provider: "unconfigured",
        error: "Transactional email provider is not configured. Set RESEND_API_KEY or SENDGRID_API_KEY.",
      };
    },
  };
}
