/**
 * Images travel to server actions as a Blob, not a base64 string: Next 16 / React refuse a
 * server-action argument string much past ~0.5 MB ("Maximum array nesting exceeded"), which
 * broke uploads of detailed photos. The browser still compresses to a data URL (for the
 * preview); dataUrlToBlob turns it into bytes for the request, and the server turns them back.
 */
export type ImagePayload = Blob | string;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Browser side: data URL (from canvas.toDataURL) → Blob. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64 = ""] = dataUrl.split(",");
  const type = /^data:([^;]+);base64$/.exec(head)?.[1] ?? "application/octet-stream";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

/**
 * Server side: Blob (or a legacy data-URL string) → data URL, or null when it isn't a JPG/PNG/WebP
 * image or is larger than maxBytes. Callers keep their own data-URL validation after this.
 */
export async function toDataUrl(input: ImagePayload | null | undefined, maxBytes: number): Promise<string | null> {
  if (!input) return null;
  if (typeof input === "string") return input;
  if (typeof (input as Blob).arrayBuffer !== "function") return null;
  if (!IMAGE_TYPES.includes(input.type) || input.size === 0 || input.size > maxBytes) return null;
  return `data:${input.type};base64,${Buffer.from(await input.arrayBuffer()).toString("base64")}`;
}
