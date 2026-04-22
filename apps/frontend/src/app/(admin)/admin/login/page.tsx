import { redirectIfAuthenticatedAdmin } from '@/lib/auth/session';

import { LoginForm } from '@/components/admin/login-form';

export default async function AdminLoginPage() {
  await redirectIfAuthenticatedAdmin();

  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between bg-[var(--surface-contrast)] p-10 text-white lg:flex">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80">
              EloC Admin
            </span>
            <h1 className="text-5xl font-semibold leading-none">
              Painel administrativo com base segura para catalogo e financas.
            </h1>
            <p className="max-w-md text-base leading-7 text-white/70">
              Comecamos pelo shell administrativo e pela autenticacao do painel
              para consolidar padrao visual, protecao de rotas e integracao
              limpa com o backend NestJS.
            </p>
          </div>

         
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
