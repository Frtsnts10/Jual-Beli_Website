/** Card used by every account page: title, gray description, then the form (if any). */
export function Section({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <section className="t-card p-5 sm:p-6">
      <h2 className="t-heading font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
