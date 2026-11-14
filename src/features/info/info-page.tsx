/** Shared frame for the storefront's info pages (Tentang / FAQ / Garansi). */
export function InfoPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-neutral-50 px-4 py-10 sm:py-14">
      <article className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">{children}</div>
      </article>
    </main>
  );
}

/** Seller-written text: keep their line breaks, never interpret it as HTML. */
export function Prose({ text }: { text: string }) {
  return <p className="leading-relaxed whitespace-pre-line text-neutral-700 [overflow-wrap:anywhere]">{text}</p>;
}
