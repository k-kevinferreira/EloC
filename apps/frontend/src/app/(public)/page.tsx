import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
      <section className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-[var(--shadow-md)] backdrop-blur">
            Base administrativa do EloC
          </span>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-none text-[var(--foreground)] sm:text-6xl">
              Painel administrativo pronto para catalogo agora e financas no proximo ciclo.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Esta fundacao concentra autenticacao segura, shell de administracao,
              leitura do catalogo e um padrao de interface reutilizavel para os
              modulos operacionais e financeiros que ainda vao entrar no backend.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-full bg-[var(--surface-contrast)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Entrar no painel
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Ver dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--muted)]">Autenticacao</p>
              <p className="mt-3 text-2xl font-semibold">JWT + cookie httpOnly</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Token administrativo mantido no servidor para reduzir exposicao no navegador.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--muted)]">Catalogo</p>
              <p className="mt-3 text-2xl font-semibold">Leitura integrada</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Dashboard e telas iniciais consumindo os contratos reais de categorias, subcategorias e produtos.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--muted)]">Escalabilidade</p>
              <p className="mt-3 text-2xl font-semibold">Shell reutilizavel</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Navegacao, layout e padroes prontos para `entries`, `expenses` e `shipments`.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
              <p className="text-sm font-medium text-[var(--muted)]">Arquitetura</p>
              <p className="mt-3 text-2xl font-semibold">Frontend como consumidor</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Regra de negocio continua no backend; o painel trabalha sobre contratos explicitos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
