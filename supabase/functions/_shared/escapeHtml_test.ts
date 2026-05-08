import {
  assertEquals,
  assert,
  assertFalse,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  escapeHtml,
  escapeHtmlMultiline,
  isSafeEmailForHref,
} from "./escapeHtml.ts";

Deno.test("escapeHtml renders <a href> as literal text (no clickable link)", () => {
  const input = `<a href="https://evil.com">Click</a>`;
  const out = escapeHtml(input);
  assertEquals(
    out,
    "&lt;a href=&quot;https://evil.com&quot;&gt;Click&lt;/a&gt;",
  );
  assertFalse(out.includes("<a "));
  assertFalse(out.includes('href="'));
  // No raw angle brackets or quotes remain anywhere in the output
  assertFalse(out.includes("<"));
  assertFalse(out.includes(">"));
  assertFalse(out.includes('"'));
});

Deno.test("escapeHtml renders <script> as literal text (no execution)", () => {
  const input = `<script>alert(1)</script>`;
  const out = escapeHtml(input);
  assertEquals(out, "&lt;script&gt;alert(1)&lt;/script&gt;");
  assertFalse(out.includes("<script"));
  // Output is plain text: no raw `<` or `>` survive
  assertFalse(out.includes("<"));
  assertFalse(out.includes(">"));
});

Deno.test("escapeHtml prevents quote breakout from HTML attributes", () => {
  // Simulate injection attempt against a value placed inside attr="..."
  const malicious = `" onmouseover="alert(1)`;
  const safe = escapeHtml(malicious);
  // Both double and single quotes must be encoded
  assertFalse(safe.includes('"'));
  assertFalse(safe.includes("'"));
  assert(safe.includes("&quot;"));

  // Final attribute string is safe to parse
  const rendered = `<input value="${safe}">`;
  // The only unescaped " characters should be the two wrapping the value.
  const quoteCount = (rendered.match(/"/g) || []).length;
  assertEquals(quoteCount, 2);
});

Deno.test("escapeHtml encodes single quotes (&#039;)", () => {
  assertEquals(escapeHtml("O'Brien"), "O&#039;Brien");
});

Deno.test("escapeHtml handles null/undefined safely", () => {
  assertEquals(escapeHtml(null), "");
  assertEquals(escapeHtml(undefined), "");
});

Deno.test("escapeHtmlMultiline preserves line breaks AFTER escaping", () => {
  const input = "line1\nline2\r\n<b>line3</b>";
  const out = escapeHtmlMultiline(input);
  assertEquals(out, "line1<br>line2<br>&lt;b&gt;line3&lt;/b&gt;");
  // The <br> tags introduced are real (not escaped), but original tags are escaped
  assert(out.includes("<br>"));
  assertFalse(out.includes("<b>"));
});

Deno.test("isSafeEmailForHref accepts well-formed addresses", () => {
  assert(isSafeEmailForHref("jane.doe+test@example.com"));
  assert(isSafeEmailForHref("a_b-c@sub.example.co"));
});

Deno.test("isSafeEmailForHref rejects malicious / malformed values", () => {
  assertFalse(isSafeEmailForHref(""));
  assertFalse(isSafeEmailForHref("not-an-email"));
  assertFalse(isSafeEmailForHref('"><script>alert(1)</script>'));
  assertFalse(isSafeEmailForHref('a@b.com" onmouseover="x'));
  assertFalse(isSafeEmailForHref("a@b"));
  assertFalse(isSafeEmailForHref("a b@example.com"));
  assertFalse(isSafeEmailForHref(null));
  assertFalse(isSafeEmailForHref(undefined));
  assertFalse(isSafeEmailForHref(12345));
});