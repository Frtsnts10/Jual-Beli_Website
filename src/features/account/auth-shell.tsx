/** Centered card used by the sign-in / sign-up / reset pages: title, subtitle and form in one box. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="t-page min-h-[calc(100svh-3.5rem)] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-sm t-card p-5 sm:p-6">
        <h1 className="t-heading text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
