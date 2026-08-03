/**
 * Serialize JSON-LD for embedding inside `<script type="application/ld+json">`.
 *
 * OWASP: JSON.stringify alone is unsafe in an HTML script context — a stored
 * `</script>` in a string value terminates the element. Escape HTML-sensitive
 * characters as JSON Unicode escapes (still valid JSON; parsers decode them).
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */
export function serializeJsonLdForHtmlScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
