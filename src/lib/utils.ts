import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hand-rolled instead of Intl: Node's ICU and the browser's (Safari especially) disagree on
// details like the space after "Rp" or the time separator, and any difference between the
// server-rendered text and the client's breaks hydration. These give the same string everywhere.

export function formatIDR(value: number) {
  const n = Math.round(Number.isFinite(value) ? value : 0);
  const digits = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "-" : ""}Rp ${digits}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000; // WIB, no daylight saving

/** "14 Nov 2026", or "14 Nov 2026 15.04" with time — always in Jakarta time (WIB). */
export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—";
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return "—";
  const d = new Date(ms + JAKARTA_OFFSET_MS);
  const date = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  if (!withTime) return date;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${date} ${pad(d.getUTCHours())}.${pad(d.getUTCMinutes())}`;
}
