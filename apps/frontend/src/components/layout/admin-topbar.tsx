import type { SafeAdmin } from '@/types/auth/auth.types';

type AdminTopbarProps = {
  admin: SafeAdmin;
};

export function AdminTopbar({ admin }: AdminTopbarProps) {
  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
  }).format(new Date());

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[var(--shadow-md)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Painel administrativo
        </p>
        <p className="mt-2 text-base text-[var(--muted)]">{currentDate}</p>
      </div>

      <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
        Sessao ativa para <span className="font-semibold text-[var(--foreground)]">{admin.email}</span>
      </div>
    </header>
  );
}
