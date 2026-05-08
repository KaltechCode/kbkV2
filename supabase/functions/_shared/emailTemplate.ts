/**
 * Unified Email Template Builder
 * 
 * Creates a consistent, premium, executive-level email layout
 * used by ALL outgoing emails from KB&K Legacy Shield.
 */

const BRAND_NAVY = "#0A2240";
const BRAND_NAVY_LIGHT = "#1E2A4A";
const BRAND_ACCENT = "#38B2ED";
const TEXT_PRIMARY = "#1E2A4A";
const TEXT_BODY = "#4A5568";
const TEXT_MUTED = "#718096";
const TEXT_LIGHT = "#A0AEC0";
const CARD_BG = "#F4F5F7";
const FOOTER_BG = "#F7FAFC";
const BORDER_COLOR = "#E2E8F0";
const WHITE = "#FFFFFF";

interface EmailTemplateOptions {
  /** Subtitle shown below logo in header (e.g., "FINANCIAL REPORT", "VERIFICATION REQUIRED") */
  headerSubtitle?: string;
  /** Greeting name (e.g., "John"). Renders as "Hi John," */
  firstName?: string;
  /** Custom greeting line (overrides default "Hi {firstName},") */
  customGreeting?: string;
  /** 1-2 sentence context statement below greeting */
  contextStatement?: string;
  /** HTML content for the primary content card */
  cardContent?: string;
  /** Advisory interpretation paragraph below the card */
  interpretation?: string;
  /** Primary CTA button text */
  ctaText?: string;
  /** Primary CTA button URL */
  ctaUrl?: string;
  /** Secondary support text below CTA */
  secondaryText?: string;
  /** Additional content between card and CTA (raw HTML) */
  additionalContent?: string;
  /** Whether to use light logo (for dark header). Default true. */
  useLightLogo?: boolean;
}

export function buildUnifiedEmail(options: EmailTemplateOptions): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/email-assets/kbk-logo-light.png`;
  const year = new Date().getFullYear();

  const greetingHtml = options.customGreeting
    ? `<h1 style="color:${TEXT_PRIMARY};font-size:22px;font-weight:700;margin:0 0 16px 0;">${options.customGreeting}</h1>`
    : options.firstName
      ? `<h1 style="color:${TEXT_PRIMARY};font-size:22px;font-weight:700;margin:0 0 16px 0;">Hi ${options.firstName},</h1>`
      : '';

  const contextHtml = options.contextStatement
    ? `<p style="color:${TEXT_BODY};font-size:16px;line-height:1.6;margin:0;">${options.contextStatement}</p>`
    : '';

  const cardHtml = options.cardContent
    ? `<tr><td style="padding:0 32px 24px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${CARD_BG};border-radius:10px;overflow:hidden;">
          <tr><td style="padding:24px 28px;">${options.cardContent}</td></tr>
        </table>
      </td></tr>`
    : '';

  const interpretationHtml = options.interpretation
    ? `<tr><td style="padding:0 32px 28px 32px;">
        <p style="color:${TEXT_BODY};font-size:15px;line-height:1.7;margin:0;">${options.interpretation}</p>
      </td></tr>`
    : '';

  const additionalHtml = options.additionalContent
    ? `<tr><td style="padding:0 32px 24px 32px;">${options.additionalContent}</td></tr>`
    : '';

  const ctaHtml = options.ctaText && options.ctaUrl
    ? `<tr><td style="padding:0 32px 24px 32px;text-align:center;">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${options.ctaUrl}" style="height:52px;v-text-anchor:middle;width:340px;" arcsize="12%" strokecolor="${BRAND_NAVY}" fillcolor="${BRAND_NAVY}">
          <w:anchorlock/>
          <center style="color:${WHITE};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${options.ctaText}</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${options.ctaUrl}" target="_blank" style="display:inline-block;background-color:${BRAND_NAVY};color:${WHITE};padding:16px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;text-align:center;line-height:1.4;">${options.ctaText}</a>
        <!--<![endif]-->
      </td></tr>`
    : '';

  const secondaryHtml = options.secondaryText
    ? `<tr><td style="padding:0 32px 32px 32px;text-align:center;">
        <p style="color:${TEXT_MUTED};font-size:14px;line-height:1.6;margin:0;">${options.secondaryText}</p>
      </td></tr>`
    : '';

  const headerSubtitleHtml = options.headerSubtitle
    ? `<p style="color:#8CB4E0;font-size:11px;margin:10px 0 0 0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">${options.headerSubtitle}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#EAEEF3;margin:0;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#EAEEF3;">
    <tr>
      <td style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:${WHITE};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(10,34,64,0.08);">
          
          <!-- HEADER: Authority Bar -->
          <tr>
            <td style="background-color:${BRAND_NAVY};padding:24px 32px;text-align:center;">
              <img src="${logoUrl}" alt="KB&K Legacy Shield" width="180" style="display:inline-block;max-width:180px;height:auto;border:0;" />
              ${headerSubtitleHtml}
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:32px 32px 20px 32px;">
              ${greetingHtml}
              ${contextHtml}
            </td>
          </tr>

          <!-- PRIMARY CONTENT CARD -->
          ${cardHtml}

          <!-- INTERPRETATION -->
          ${interpretationHtml}

          <!-- ADDITIONAL CONTENT -->
          ${additionalHtml}

          <!-- PRIMARY CTA -->
          ${ctaHtml}

          <!-- SECONDARY TEXT -->
          ${secondaryHtml}

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 32px;">
              <div style="border-top:1px solid ${BORDER_COLOR};"></div>
            </td>
          </tr>

          <!-- DISCLAIMER -->
          <tr>
            <td style="padding:20px 32px;">
              <p style="font-size:11px;color:${TEXT_LIGHT};line-height:1.6;margin:0;text-align:center;">
                This communication is for informational purposes only and does not constitute financial advice. Please consult with a qualified financial advisor for personalized recommendations.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:${FOOTER_BG};padding:20px 32px;text-align:center;border-top:1px solid ${BORDER_COLOR};">
              <p style="color:${TEXT_BODY};font-size:13px;font-weight:600;margin:0;">Empowering your financial future with personalized planning.</p>
              <p style="color:${TEXT_MUTED};font-size:12px;margin:8px 0 0 0;">&copy; ${year} KB&amp;K Legacy Shield. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build a simple admin notification email (internal use only, not client-facing).
 * Uses a slightly different header color to distinguish from client emails.
 */
export function buildAdminNotificationEmail(options: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
}): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#EAEEF3;margin:0;padding:0;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#EAEEF3;">
<tr><td style="padding:24px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:${WHITE};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(10,34,64,0.08);">
  <tr><td style="background-color:${BRAND_NAVY};padding:24px 32px;text-align:center;">
    <p style="color:${WHITE};font-size:18px;font-weight:700;margin:0;">${options.title}</p>
    ${options.subtitle ? `<p style="color:#8CB4E0;font-size:11px;margin:8px 0 0;text-transform:uppercase;letter-spacing:2px;font-weight:600;">${options.subtitle}</p>` : ''}
  </td></tr>
  <tr><td style="padding:28px 32px;">
    ${options.bodyHtml}
  </td></tr>
  <tr><td style="background-color:${FOOTER_BG};padding:16px 32px;text-align:center;border-top:1px solid ${BORDER_COLOR};">
    <p style="color:${TEXT_MUTED};font-size:12px;margin:0;">&copy; ${year} KB&amp;K Legacy Shield — Internal</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
