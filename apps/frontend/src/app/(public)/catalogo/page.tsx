import Link from 'next/link';
import type { Route } from 'next';

import { MaterialFilterButtons } from '@/components/catalog/material-filter-buttons';
import { ProductCard } from '@/components/catalog/product-card';
import { SectionHeading } from '@/components/catalog/section-heading';
import { listCategories } from '@/services/categories/list-categories';
import { listProducts } from '@/services/products/list-products';
import { sortProducts } from '@/utils/catalog';

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type CatalogHrefOptions = {
  categoryId?: string;
  search?: string;
  sort?: string;
  materialSlug?: string;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const search = getSingleParam(params.search);
  const categoryId = getSingleParam(params.categoria);
  const materialSlug = getMaterialFilterParam(params.subcategoria);
  const sort = getSingleParam(params.ordenar) ?? 'featured';

  const [categories, products] = await Promise.all([
    listCategories({ isActive: true }),
    listProducts({
      isActive: true,
      categoryId,
      subcategorySlug: materialSlug,
      search,
      limit: 100,
    }),
  ]);

  const sortedProducts = sortProducts(products, sort);

  return (
    <main className="px-6 py-16 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Catálogo"
          subtitle="Encontre a peça ideal para o seu momento"
          centered
        />

        <form className="mb-10 grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_auto_auto]">
          {materialSlug ? (
            <input type="hidden" name="subcategoria" value={materialSlug} />
          ) : null}

          <input
            name="search"
            defaultValue={search ?? ''}
            placeholder="Buscar por nome"
            className="min-h-12 rounded-md border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--rose-bronze)]"
          />

          <select
            name="categoria"
            defaultValue={categoryId ?? ''}
            className="min-h-12 rounded-md border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--rose-bronze)]"
          >
            <option value="">Todas categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="ordenar"
            defaultValue={sort}
            className="min-h-12 rounded-md border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--rose-bronze)]"
          >
            <option value="featured">Destaques</option>
            <option value="name">Nome</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>

          <button
            type="submit"
            className="min-h-12 rounded-md border border-[var(--rose-bronze)] bg-[var(--rose-bronze)] px-6 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[var(--rose-bronze-strong)] sm:col-start-3"
          >
            Filtrar
          </button>
        </form>

        <MaterialFilterButtons
          pathname="/catalogo"
          query={{
            categoria: categoryId,
            ordenar: sort !== 'featured' ? sort : undefined,
            search,
          }}
          selectedMaterialSlug={materialSlug}
        />

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href={
              buildCatalogHref({
                search,
                sort,
                materialSlug,
              }) as Route
            }
            className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)] transition hover:border-[var(--rose-bronze)]"
          >
            Tudo
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={
                buildCatalogHref({
                  categoryId: category.id,
                  search,
                  sort,
                  materialSlug,
                }) as Route
              }
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)] transition hover:border-[var(--rose-bronze)]"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-[var(--muted)]">
            Nenhuma peça encontrada com os filtros selecionados.
          </div>
        )}
      </div>
    </main>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function getMaterialFilterParam(value: string | string[] | undefined) {
  const param = getSingleParam(value);

  if (param === 'prata' || param === 'dourado') {
    return param;
  }

  return undefined;
}

function buildCatalogHref({
  categoryId,
  materialSlug,
  search,
  sort,
}: CatalogHrefOptions) {
  const params = new URLSearchParams();

  if (search) {
    params.set('search', search);
  }

  if (categoryId) {
    params.set('categoria', categoryId);
  }

  if (materialSlug) {
    params.set('subcategoria', materialSlug);
  }

  if (sort && sort !== 'featured') {
    params.set('ordenar', sort);
  }

  return params.size > 0 ? `/catalogo?${params}` : '/catalogo';
}
