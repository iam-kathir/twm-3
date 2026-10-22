export const EMAIL_SERVICE_IDENTIFIER = "twm-email-service";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  provider: "resend" | "sendgrid" | "mock" | "unconfigured";
  error?: string;
}

export interface EmailProvider {
  name: string;
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;
}
