'use client';

import { useActionState } from 'react';

import { loginAdminAction, type LoginActionState } from '@/lib/auth/actions';

const initialState: LoginActionState = {
  errors: {},
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState);

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          Autenticacao administrativa
        </p>
        <h2 className="text-4xl font-semibold">Entrar</h2>
        <p className="text-base leading-7 text-[var(--muted)]">
          Use um admin existente no backend para abrir o painel e validar a base administrativa.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@eloc.local"
            className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
          {state.errors.email ? (
            <p className="text-sm text-[var(--danger)]">{state.errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha administrativa"
            className="w-full rounded-2xl border border-[var(--border-strong)] bg-[var(--surface-strong)] px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
          {state.errors.password ? (
            <p className="text-sm text-[var(--danger)]">{state.errors.password}</p>
          ) : null}
        </div>

        {state.message ? (
          <div className="rounded-2xl border border-[rgba(177,59,46,0.18)] bg-[rgba(177,59,46,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {state.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--surface-contrast)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? 'Entrando...' : 'Acessar painel'}
        </button>
      </form>
    </div>
  );
}
