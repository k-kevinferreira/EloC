import Link from 'next/link';
import type { Route } from 'next';

import type { Subcategory } from '@/types/catalog/catalog.types';

type MaterialFilterButtonsProps = {
  pathname: string;
  query?: Record<string, string | undefined>;
  selectedSubcategoryId?: string;
  subcategories: Subcategory[];
};

const materialFilterSlugs = ['prata', 'dourado'] as const;

export function MaterialFilterButtons({
  pathname,
  query = {},
  selectedSubcategoryId,
  subcategories,
}: MaterialFilterButtonsProps) {
  const materialFilters = materialFilterSlugs
    .map((slug) => {
      const subcategory = subcategories.find((item) => {
        return item.slug === slug || normalizeFilterValue(item.name) === slug;
      });

      return subcategory
        ? {
            id: subcategory.id,
            label: toTitleCase(slug),
          }
        : null;
    })
    .filter((filter) => filter !== null);

  if (materialFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      {materialFilters.map((filter) => {
        const isSelected = selectedSubcategoryId === filter.id;

        return (
          <Link
            key={filter.id}
            href={
              buildHref({
                pathname,
                query,
                subcategoryId: isSelected ? undefined : filter.id,
              }) as Route
            }
            className={[
              'inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold uppercase tracking-[0.14em] transition',
              isSelected
                ? 'border-[var(--rose-bronze)] bg-[var(--rose-bronze)] text-white'
                : 'border-[var(--border)] bg-[var(--surface-strong)] text-[var(--foreground)] hover:border-[var(--rose-bronze)]',
            ].join(' ')}
            aria-pressed={isSelected}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}

function buildHref({
  pathname,
  query,
  subcategoryId,
}: {
  pathname: string;
  query: Record<string, string | undefined>;
  subcategoryId?: string;
}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  if (subcategoryId) {
    params.set('subcategoria', subcategoryId);
  }

  return params.size > 0 ? `${pathname}?${params}` : pathname;
}

function normalizeFilterValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
