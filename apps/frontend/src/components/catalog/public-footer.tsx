import Link from 'next/link';
import type { Route } from 'next';

import {
  buildWhatsAppUrl,
  instagramUrl,
} from '@/constants/public-links';
import type { Category } from '@/types/catalog/catalog.types';

type PublicFooterProps = {
  categories: Category[];
};

export function PublicFooter({ categories }: PublicFooterProps) {
  const visibleCategories = categories.slice(0, 4);
  const whatsappUrl = buildWhatsAppUrl('Olá, vim pelo site da EloC.');

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--champagne)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
        <div className="space-y-6">
          <Link href="/" className="font-heading text-3xl text-[var(--foreground)]">
            EloC
          </Link>
          <p className="max-w-xs text-sm leading-7 text-[var(--muted)]">
            Pratas e semijoias com design exclusivo e qualidade premium.
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Navegação
          </h2>
          <nav className="flex flex-col gap-4 text-sm text-[var(--muted)]">
            <Link href="/catalogo">Catálogo</Link>
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}` as Route}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Atendimento
          </h2>
          <div className="space-y-4 text-sm leading-7 text-[var(--muted)]">
            <p>Seg - Sex: 9h as 18h</p>
            <p>Sab: 9h as 13h</p>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="space-y-5">
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Redes sociais
          </h2>
          <div className="flex gap-5 text-sm text-[var(--muted)]">
            <a href={instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-[var(--border)] px-6 py-8 text-center text-xs tracking-[0.08em] text-[var(--muted)] lg:px-12">
        <p>© 2026 EloC - Pratas e Semijoias. Todos os direitos reservados.</p>
        <p className="mt-2">
          Desenvolvido por{' '}
          <a
            href="https://github.com/k-kevinferreira"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--foreground)] transition hover:text-[var(--rose-bronze)]"
          >
            Kevin Ferreira
          </a>
        </p>
      </div>
    </footer>
  );
}


