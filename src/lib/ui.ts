/**
 * Shared control sizes for the storefront, so every form looks the same: inputs and buttons
 * are all 44px tall (comfortable to tap), header controls 36px. Inputs use 16px text on phones
 * (smaller makes iOS zoom in on focus) and 14px from `sm` up.
 */
const box = "t-input w-full min-w-0 px-3 text-base font-normal outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 sm:text-sm";
export const field = `h-11 ${box}`;
export const textarea = `py-2.5 ${box}`;

const btn = "t-btn inline-flex h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50";
export const btnPrimary = `${btn} bg-[var(--accent)] text-[var(--accent-fg)]`;
export const btnOutline = `${btn} t-btn-line bg-white text-neutral-900 hover:bg-neutral-50`;
export const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`;
export const btnDangerOutline = `${btn} t-btn-line border-red-300! bg-white text-red-600 hover:bg-red-50`;
export const btnMuted = `${btn} bg-neutral-200 text-neutral-500`;

/** Header controls (account / sign-in pill, menu button). */
export const navControl = "t-btn inline-flex h-9 shrink-0 items-center justify-center gap-1.5 text-sm font-medium";

/** Theme-aware building blocks (tokens in globals.css, set per template via data-theme). */
export const page = "t-page flex-1 px-4";
export const card = "t-card";
export const cardDashed = "t-card-dashed";
export const soft = "t-soft";
export const heading = "t-heading";
export const pill = "t-pill";
