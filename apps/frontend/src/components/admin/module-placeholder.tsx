type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <section className="max-w-4xl space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-5 shadow-[var(--shadow-md)] sm:p-6">
        <p className="text-base font-semibold">Próximo passo recomendado</p>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
          Consolidar os contratos do backend para este módulo e só depois evoluir a
          interface de escrita e consulta no painel. A navegação e o shell já estão
          preparados para receber essa etapa sem reestruturacao.
        </p>
      </div>
    </section>
  );
}
