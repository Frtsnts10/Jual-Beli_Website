"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hms = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return d > 0 ? `${d} hari ${hms}` : hms;
}

/** Flash-sale timer. Renders nothing on the server to avoid a hydration mismatch on the seconds. */
export function Countdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const left = new Date(endsAt).getTime() - now;
  if (left <= 0) return <span className={className}>Promo berakhir</span>;
  return <span className={className}>⏱ {parts(left)}</span>;
}
