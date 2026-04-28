import Link from 'next/link';
import type { Route } from 'next';

type MaterialFilterButtonsProps = {
  pathname: string;
  query?: Record<string, string | undefined>;
  selectedMaterialSlug?: string;
};

const materialFilterSlugs = ['prata', 'dourado'] as const;

export function MaterialFilterButtons({
  pathname,
  query = {},
  selectedMaterialSlug,
}: MaterialFilterButtonsProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
      {materialFilterSlugs.map((slug) => {
        const isSelected = selectedMaterialSlug === slug;

        return (
          <Link
            key={slug}
            href={
              buildHref({
                pathname,
                query,
                materialSlug: isSelected ? undefined : slug,
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
            {toTitleCase(slug)}
          </Link>
        );
      })}
    </div>
  );
}

function buildHref({
  materialSlug,
  pathname,
  query,
}: {
  materialSlug?: string;
  pathname: string;
  query: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }

  if (materialSlug) {
    params.set('subcategoria', materialSlug);
  }

  return params.size > 0 ? `${pathname}?${params}` : pathname;
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
