const HEADER = "-----BEGIN PRIVATE KEY-----";
const FOOTER = "-----END PRIVATE KEY-----";

/**
 * Normalises FIREBASE_PRIVATE_KEY as pasted into a hosting dashboard: escaped "\n",
 * wrapping quotes, a trailing `",` or the surrounding JSON line, odd line widths.
 * Only the base64 between the PEM markers is kept, re-wrapped at 64 columns.
 */
export function formatPrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  const text = key.replace(/\\n/g, "\n");
  const start = text.indexOf(HEADER);
  const end = text.indexOf(FOOTER, start + 1);
  const inner = start !== -1 && end !== -1 ? text.slice(start + HEADER.length, end) : text;
  const body = inner.replace(/[^A-Za-z0-9+/=]/g, "");
  if (!body) return undefined;
  return `${HEADER}\n${(body.match(/.{1,64}/g) ?? []).join("\n")}\n${FOOTER}\n`;
}
