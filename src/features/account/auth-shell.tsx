/** Centered card used by the sign-in / sign-up / reset pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">{children}</div>
      </div>
    </main>
  );
}
