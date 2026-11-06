/**
 * TWM 3.1 — Server Environment & Configuration Pre-Flight Validator
 * Reference: Plan §17.1, §17.4, §18.1
 *
 * Ensures fail-closed security configuration before request handling.
 */

export interface EnvValidationResult {
  isValid: boolean;
  mode: "development" | "test" | "production";
  issues: string[];
  warnings: string[];
  features: {
    githubOAuth: boolean;
    emailDelivery: boolean;
    emailProvider: string;
    allowedCollegeDomains: string[];
    sessionSecured: boolean;
  };
}

const DEFAULT_INSECURE_SECRET = "twm_dev_session_secret_change_in_production_min_32_characters_12345";

export function validateServerEnv(): EnvValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const rawNodeEnv = process.env.NODE_ENV || "development";
  const mode: "development" | "test" | "production" =
    rawNodeEnv === "production" ? "production" : rawNodeEnv === "test" ? "test" : "development";

  // 1. Session Secret Validation (§17.1)
  const sessionSecret = process.env.TWM_SESSION_SECRET;
  let sessionSecured = false;

  if (!sessionSecret || sessionSecret.trim() === "") {
    if (mode === "production") {
      issues.push("TWM_SESSION_SECRET is mandatory in production but is not set.");
    } else {
      warnings.push("TWM_SESSION_SECRET is not configured; using fallback development key.");
    }
  } else if (sessionSecret.length < 32) {
    if (mode === "production") {
      issues.push(`TWM_SESSION_SECRET must be at least 32 characters long (currently ${sessionSecret.length} chars).`);
    } else {
      warnings.push(`TWM_SESSION_SECRET is short (${sessionSecret.length} chars). Recommend >= 32 characters.`);
    }
  } else if (mode === "production" && sessionSecret === DEFAULT_INSECURE_SECRET) {
    issues.push("TWM_SESSION_SECRET cannot be the default development secret in production.");
  } else {
    sessionSecured = true;
  }

  // 2. Institutional College Domains (§6.1, §17.4)
  const rawDomains = process.env.COLLEGE_EMAIL_DOMAINS;
  const allowedCollegeDomains = (rawDomains || "karunya.edu,vitstudent.ac.in,student.annauniv.edu")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter((d) => d.length > 0);

  if (!rawDomains) {
    warnings.push("COLLEGE_EMAIL_DOMAINS not set in environment; default institutional domain allowlist active.");
  }

  // 3. GitHub OAuth Configuration (§6.1)
  const hasClientId = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID.trim() !== "");
  const hasClientSecret = Boolean(process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CLIENT_SECRET.trim() !== "");
  const githubOAuth = hasClientId && hasClientSecret;

  if (mode === "production" && !githubOAuth) {
    warnings.push("GitHub OAuth credentials (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET) not fully configured; OAuth fallback inactive.");
  }

  // 4. Email Provider Configuration (§6.1)
  const emailProvider = (process.env.EMAIL_PROVIDER || "mock").toLowerCase();
  let emailDelivery = false;

  if (emailProvider === "resend") {
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== "") {
      emailDelivery = true;
    } else if (mode === "production") {
      issues.push("EMAIL_PROVIDER is set to 'resend' but RESEND_API_KEY is missing.");
    }
  } else if (emailProvider === "sendgrid") {
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim() !== "") {
      emailDelivery = true;
    } else if (mode === "production") {
      issues.push("EMAIL_PROVIDER is set to 'sendgrid' but SENDGRID_API_KEY is missing.");
    }
  } else if (emailProvider === "mock") {
    if (mode === "production") {
      warnings.push("EMAIL_PROVIDER is set to 'mock' in production; live OTP emails will not be dispatched.");
    }
  } else {
    issues.push(`Unknown EMAIL_PROVIDER '${emailProvider}'. Expected 'resend', 'sendgrid', or 'mock'.`);
  }

  return {
    isValid: issues.length === 0,
    mode,
    issues,
    warnings,
    features: {
      githubOAuth,
      emailDelivery,
      emailProvider,
      allowedCollegeDomains,
      sessionSecured,
    },
  };
}
