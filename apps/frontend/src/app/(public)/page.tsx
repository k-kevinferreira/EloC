import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
      <section className="flex flex-1 items-center justify-center">
        <div className="flex max-w-3xl flex-col items-center space-y-8 text-center">
          <span className="inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-[var(--shadow-md)] backdrop-blur">
            Painel administrativo
          </span>

          <div className="space-y-5">
            <h1 className="text-5xl font-semibold leading-none text-[var(--foreground)] sm:text-6xl">
              Gestao administrativa clara, organizada e pronta para o seu catalogo.
            </h1>

            <p className="text-lg leading-8 text-[var(--muted)]">
              Centralize o controle de produtos, categorias e estrutura do
              catalogo em um painel moderno, consistente e preparado para a
              rotina administrativa do negocio.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
      </section>
    </main>
  );
}