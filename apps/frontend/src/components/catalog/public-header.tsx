'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { publicCatalogNavigationItems } from '@/constants/catalog-taxonomy';
import type { Category } from '@/types/catalog/catalog.types';

type PublicHeaderProps = {
  categories: Category[];
};

export function PublicHeader({ categories }: PublicHeaderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigationItems = publicCatalogNavigationItems.map((item) => ({
    label: item.label,
    mobileOnly: 'mobileOnly' in item ? item.mobileOnly : false,
    href:
      'href' in item
        ? item.href
        : getCategoryHref(categories, item.categorySlug),
  }));
  const desktopNavigationItems = navigationItems.filter((item) => !item.mobileOnly);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const search = String(formData.get('search') ?? '').trim();
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.set('search', search);
    }

    setIsSearchOpen(false);
    setIsOpen(false);
    router.push(
      (searchParams.size > 0 ? `/catalogo?${searchParams}` : '/catalogo') as Route,
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:h-24 lg:px-12">
        <Link href="/" className="font-heading text-4xl text-[var(--foreground)]">
          EloC
        </Link>

        <nav className="hidden items-center gap-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)] lg:flex xl:gap-7 xl:text-sm xl:tracking-[0.18em] 2xl:gap-10 2xl:tracking-[0.22em]">
          {desktopNavigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href as Route}
              className="transition hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 text-sm font-medium uppercase tracking-[0.14em] text-[var(--muted)] lg:flex xl:gap-5 xl:tracking-[0.18em]">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition hover:border-[var(--border)] hover:text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--rose-bronze)]"
            aria-label="Abrir busca"
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((current) => !current)}
          >
            <SearchIcon />
          </button>
          <Link href="/admin/login">Admin</Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-[var(--border)] text-[var(--foreground)] lg:hidden"
          aria-label="Abrir menu de navegação"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="h-px w-5 bg-current" />
          <span className="h-px w-5 bg-current" />
          <span className="h-px w-5 bg-current" />
        </button>
      </div>

      {isSearchOpen ? (
        <div className="hidden border-t border-[var(--border)] bg-[var(--background)] px-6 py-5 lg:block lg:px-12">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-3xl items-center gap-3"
          >
            <input
              name="search"
              autoFocus
              placeholder="Buscar por nome"
              className="min-h-12 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--rose-bronze)]"
            />
            <button
              type="submit"
              className="min-h-12 rounded-md border border-[var(--rose-bronze)] bg-[var(--rose-bronze)] px-6 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[var(--rose-bronze-strong)]"
            >
              Buscar
            </button>
          </form>
        </div>
      ) : null}

      {isOpen ? (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-5 text-sm font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as Route}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 pt-2">
              <input
                name="search"
                placeholder="Buscar por nome"
                className="min-h-12 rounded-md border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--rose-bronze)]"
              />
              <button
                type="submit"
                className="min-h-12 rounded-md border border-[var(--rose-bronze)] bg-[var(--rose-bronze)] px-5 text-xs font-medium uppercase tracking-[0.16em] text-white"
              >
                Buscar
              </button>
            </form>
            <Link href="/admin/login" onClick={() => setIsOpen(false)}>
              Admin
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function getCategoryHref(categories: Category[], categorySlug: string) {
  const category = categories.find(
    (item) =>
      item.slug === categorySlug ||
      normalizeCategoryName(item.name) === categorySlug,
  );

  return category ? `/categoria/${category.slug}` : '/catalogo';
}

function normalizeCategoryName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}
