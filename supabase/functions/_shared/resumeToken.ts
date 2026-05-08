// Shared helpers for the Resume Stress Test token system.
import { AppConfig } from "./appConfig.ts";

const FALLBACK_BASE_URL = AppConfig.BASE_URL;

// Resolve the public base URL for building user-facing links.
// Priority: BASE_URL env var → request origin (protocol + host) → hardcoded fallback.
// Edge Functions are invoked at the Supabase functions host, which is NOT the
// site origin we want for resume links — so we only use the request URL when
// it clearly points at our public site (i.e. not a *.supabase.co host).
export function getBaseUrl(req?: Request): string {
  // Primary source: centralized AppConfig (no longer pulled from secrets).
  const configBase = AppConfig.BASE_URL;
  if (configBase) return configBase.replace(/\/+$/, "");

  if (req) {
    try {
      const u = new URL(req.url);
      if (u.host && !u.host.endsWith(".supabase.co")) {
        return `${u.protocol}//${u.host}`;
      }
      // Fall back to the Origin header if the request URL is the functions host
      const origin = req.headers.get("origin");
      if (origin && !origin.includes(".supabase.co")) {
        return origin.replace(/\/+$/, "");
      }
    } catch {
      // ignore malformed URL
    }
  }

  return FALLBACK_BASE_URL;
}

// Back-compat alias
export function getResumeBaseUrl(req?: Request): string {
  return getBaseUrl(req);
}

// Generate cryptographically secure random token (hex-encoded)
export function generateRawResumeToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface ResumeTokenRecord {
  rawToken: string;
  tokenHash: string;
  last4: string;
  expiresAt: string;
}

// Default expiry: 7 days from creation
export async function buildResumeTokenRecord(
  expiresInMs = 7 * 24 * 60 * 60 * 1000,
): Promise<ResumeTokenRecord> {
  const rawToken = generateRawResumeToken(32);
  const tokenHash = await sha256Hex(rawToken);
  const last4 = rawToken.slice(-4);
  const expiresAt = new Date(Date.now() + expiresInMs).toISOString();
  return { rawToken, tokenHash, last4, expiresAt };
}

export function buildResumeUrl(rawToken: string, req?: Request): string {
  return `${getBaseUrl(req)}/stress-test/resume?token=${encodeURIComponent(rawToken)}`;
}

// Generic line we append to stress-test emails so users always have a recovery path.
export function buildResumeFooterHtml(rawToken: string | null | undefined, req?: Request): string {
  if (!rawToken) return "";
  const url = buildResumeUrl(rawToken, req);
  return `
    <p style="color:#718096;font-size:12px;line-height:1.6;margin:18px 0 0;text-align:center;">
      Having trouble accessing your assessment? You can resume securely here:<br/>
      <a href="${url}" style="color:#1E2A4A;word-break:break-all;">${url}</a><br/>
      <span style="color:#A0AEC0;">This link is valid for 7 days.</span>
    </p>
  `;
}

export function buildResumeFooterText(rawToken: string | null | undefined, req?: Request): string {
  if (!rawToken) return "";
  return `\n\nIf you experience any issues accessing your assessment, continue here:\n${buildResumeUrl(rawToken, req)}\n(This link is valid for 7 days.)`;
}
