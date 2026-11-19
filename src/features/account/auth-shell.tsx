/**
 * Centered card used by the sign-in / sign-up / reset pages: title, subtitle and form in one box.
 * Fills the space between the store header and footer and centres the card in it, so the page
 * doesn't scroll when the form fits on screen.
 */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="t-page flex flex-1 items-center justify-center px-4 py-4 sm:py-6">
      <div className="t-card w-full max-w-sm p-5 sm:p-6">
        <h1 className="t-heading text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
