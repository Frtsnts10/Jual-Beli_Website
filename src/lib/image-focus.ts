import type { CSSProperties } from "react";

/**
 * Where a product photo is anchored inside its frame, set by the seller in the dashboard.
 * x/y are the focal point in % of the image (0–100, 50/50 = centre), zoom ≥ 1. Stored as
 * products.image_focus (null = centred, no zoom). Frames differ per template (square, 4:3,
 * 16:9, tall bento tiles), so a focal point + zoom is kept instead of a crop: the chosen part
 * stays in view whatever the frame's shape.
 */
export interface ImageFocus {
  x: number;
  y: number;
  zoom: number;
}

export const MAX_ZOOM = 3;

const clamp = (n: unknown, min: number, max: number, fallback: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;

/** Valid focus or null (null also for the default, so untouched photos store nothing). */
export function normalizeFocus(f: unknown): ImageFocus | null {
  if (!f || typeof f !== "object") return null;
  const o = f as Record<string, unknown>;
  const focus = {
    x: Math.round(clamp(o.x, 0, 100, 50) * 10) / 10,
    y: Math.round(clamp(o.y, 0, 100, 50) * 10) / 10,
    zoom: Math.round(clamp(o.zoom, 1, MAX_ZOOM, 1) * 100) / 100,
  };
  return focus.x === 50 && focus.y === 50 && focus.zoom === 1 ? null : focus;
}

/** Inline style for an object-cover <img> filling its frame. */
export function focusStyle(f: ImageFocus | null | undefined): CSSProperties | undefined {
  if (!f) return undefined;
  const pos = `${f.x}% ${f.y}%`;
  return { objectPosition: pos, transformOrigin: pos, transform: f.zoom > 1 ? `scale(${f.zoom})` : undefined };
}
