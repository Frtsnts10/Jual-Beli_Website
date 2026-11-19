/* eslint-disable @next/next/no-img-element -- static logo, already sized */

/**
 * Jual's loading state: the JB logo breathing above a sliding brand-coloured bar. Used by the
 * route-level loading.tsx files while a page's data streams in. Animations stop for people who
 * prefer reduced motion (see .jb-loader-* in globals.css).
 */
export function LogoLoader({ label = "Memuat…", fullscreen = false }: { label?: string; fullscreen?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={`flex w-full flex-col items-center justify-center gap-4 ${fullscreen ? "min-h-dvh" : "min-h-[60vh]"}`}>
      <img src="/logo.png" alt="" width={66} height={48} className="jb-loader-logo h-12 w-auto" />
      <div className="h-1 w-28 bg-neutral-200 overflow-hidden rounded-full" aria-hidden>
        <div className="jb-loader-bar h-full w-1/2 rounded-full bg-gradient-to-r from-[#F26A0F] to-[#0B5FE0]" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
