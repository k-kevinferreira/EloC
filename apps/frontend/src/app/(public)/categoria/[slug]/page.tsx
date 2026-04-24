import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/catalog/product-card';
import { SectionHeading } from '@/components/catalog/section-heading';
import { listCategories } from '@/services/categories/list-categories';
import { listProducts } from '@/services/products/list-products';

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await listCategories({ isActive: true });
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const products = await listProducts({
    isActive: true,
    categoryId: category.id,
    limit: 100,
  });

  return (
    <main>
      <section className="bg-[var(--champagne)] px-6 py-20 text-center lg:px-12 lg:py-28">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
            Categoria
          </p>
          <h1 className="font-heading text-6xl leading-none text-[var(--foreground)] sm:text-7xl">
            {category.name}
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-8 tracking-[0.03em] text-[var(--muted)]">
            Uma curadoria especial para descobrir pecas com acabamento premium e
            design atemporal.
          </p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title={`Pecas em ${category.name}`}
            subtitle={`${products.length} ${products.length === 1 ? 'item encontrado' : 'itens encontrados'}`}
          />

          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center text-[var(--muted)]">
              Ainda nao ha pecas ativas nesta categoria.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
