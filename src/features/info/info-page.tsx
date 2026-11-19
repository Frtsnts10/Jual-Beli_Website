/** Shared frame for the storefront's info pages (Tentang / FAQ / Garansi). */
export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="t-page flex-1 px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="t-heading mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <div className="t-card p-5 sm:p-8">{children}</div>
      </article>
    </main>
  );
}

/** Seller-written text: keep their line breaks, never interpret it as HTML. */
export function Prose({ text }: { text: string }) {
  return <p className="leading-relaxed whitespace-pre-line text-neutral-700 [overflow-wrap:anywhere]">{text}</p>;
}
