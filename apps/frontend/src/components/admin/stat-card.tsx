type StatCardProps = {
  label: string;
  value: number;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-4 text-5xl font-semibold leading-none">{value}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{detail}</p>
    </article>
  );
}
