import Link from 'next/link';
import type { Route } from 'next';

import { CategoryCard } from '@/components/catalog/category-card';
import { ProductCard } from '@/components/catalog/product-card';
import { PublicButton } from '@/components/catalog/public-button';
import { SectionHeading } from '@/components/catalog/section-heading';
import { listCategories } from '@/services/categories/list-categories';
import { listProducts } from '@/services/products/list-products';

export default async function HomePage() {
  const [categories, featuredProducts, catalogProducts] = await Promise.all([
    listCategories({ isActive: true }),
    listProducts({ isActive: true, isFeatured: true, limit: 4 }),
    listProducts({ isActive: true, limit: 100 }),
  ]);

  const productsForFeatured =
    featuredProducts.length > 0 ? featuredProducts : catalogProducts.slice(0, 4);

  return (
    <main>
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-20 text-center lg:min-h-[calc(100vh-6rem)] lg:px-12">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="space-y-8">
            <h1 className="font-heading text-6xl leading-none text-[var(--foreground)] sm:text-7xl lg:text-8xl">
              Elegancia em Cada Detalhe
            </h1>
            <p className="mx-auto max-w-3xl text-lg font-light leading-9 tracking-[0.02em] text-[var(--muted)] sm:text-2xl">
              Descubra nossa colecao exclusiva de pratas e semi joias, onde o
              design contemporaneo encontra a qualidade premium.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PublicButton href="/catalogo" size="lg">
              Explorar catalogo
            </PublicButton>
            <PublicButton
              href={(categories[0] ? `/categoria/${categories[0].slug}` : '/catalogo') as Route}
              variant="secondary"
              size="lg"
            >
              Ver aneis
            </PublicButton>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title="Nossas Categorias"
            subtitle="Explore nossa selecao cuidadosamente curada"
            centered
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                products={catalogProducts}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title="Pecas em Destaque"
            subtitle="Selecao especial da colecao"
            action={
              <Link
                href="/catalogo"
                className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--foreground)] transition hover:text-[var(--accent-strong)]"
              >
                Ver tudo
              </Link>
            }
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {productsForFeatured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--champagne)] px-6 py-16 text-center lg:px-12 lg:py-24">
        <div className="mx-auto max-w-4xl space-y-8">
          <h2 className="font-heading text-4xl leading-none text-[var(--foreground)] sm:text-5xl">
            Sobre a EloC
          </h2>
          <div className="mx-auto max-w-3xl space-y-5 text-sm leading-8 tracking-[0.02em] text-[var(--muted)] sm:text-base">
            <p>
              A EloC nasceu da paixao por criar joias que traduzem elegancia e
              sofisticacao em cada detalhe. Nossa colecao e cuidadosamente
              desenvolvida para mulheres que apreciam design exclusivo e
              qualidade premium.
            </p>
            <p>
              Trabalhamos com pratas e acabamentos nobres, garantindo pecas
              atemporais que acompanham voce em todos os momentos especiais.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
