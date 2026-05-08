/**
 * Escape user-supplied text for safe interpolation into HTML email bodies.
 *
 * Use this for ANY string that originated from user input (request body or
 * DB columns originally written by the user) before placing it inside an
 * HTML template literal. Do NOT use for system-generated values, internal
 * UUIDs, server-computed numbers, or trusted constants.
 *
 * Replaces the five characters that can break out of HTML text or attribute
 * contexts: & < > " '
 */
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Escape HTML, then convert newlines to <br> for preserving user line breaks
 * in free-text fields (e.g., contact-form messages).
 */
export function escapeHtmlMultiline(input: unknown): string {
  return escapeHtml(input).replace(/\r?\n/g, "<br>");
}

/**
 * Strict email validator for use in HTML attribute contexts (e.g., mailto: hrefs).
 * Returns true only when the value is a non-empty string matching a conservative
 * email pattern with no whitespace, quotes, or angle brackets that could break
 * out of an HTML attribute.
 */
export function isSafeEmailForHref(input: unknown): input is string {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  // Conservative: no quotes, angle brackets, whitespace, or control chars.
  if (/[\s"'<>`]/.test(trimmed)) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
}