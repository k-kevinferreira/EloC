'use client';

import type { SafeAdmin } from '@/types/auth/auth.types';

type AdminTopbarProps = {
  admin: SafeAdmin;
  onOpenNavigation: () => void;
};

export function AdminTopbar({ admin, onOpenNavigation }: AdminTopbarProps) {
  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
  }).format(new Date());

  return (
    <header className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur sm:px-5 lg:rounded-[1.75rem] lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenNavigation}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-strong)] text-lg text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:hidden"
            aria-label="Abrir menu"
          >
            ≡
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Painel administrativo
            </p>
            <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">{currentDate}</p>
          </div>
        </div>

        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--muted)]">
          <span className="font-medium">Sessao:</span>{' '}
          <span className="font-semibold text-[var(--foreground)]">{admin.email}</span>
        </div>
      </div>
    </header>
  );
}
