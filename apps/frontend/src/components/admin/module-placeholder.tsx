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
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 shadow-[var(--shadow-md)]">
        <p className="text-lg font-semibold">Base do painel pronta</p>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          O layout, a autenticacao e a navegacao ja suportam a entrada deste modulo
          sem reestruturacao. O proximo passo e subir os contratos e services do
          backend correspondentes para que o frontend consuma uma API estavel.
        </p>
      </div>
    </section>
  );
}
