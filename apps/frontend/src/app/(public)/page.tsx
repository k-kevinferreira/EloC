import Link from 'next/link';

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
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-14 text-center lg:min-h-[calc(100vh-6rem)] lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-6">
            <h1 className="font-heading text-5xl leading-none text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Elegância em Cada Detalhe
            </h1>
            <p className="mx-auto max-w-3xl text-base font-light leading-8 tracking-[0.02em] text-[var(--muted)] sm:text-xl">
              Descubra nossa coleção exclusiva de pratas e semijoias, onde o
              design contemporâneo encontra a qualidade premium.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <PublicButton href="/catalogo" size="lg">
              Explorar catálogo
            </PublicButton>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title="Nossas Categorias"
            subtitle="Explore nossa seleção cuidadosamente curada"
            centered
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
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
            title="Peças em Destaque"
            subtitle="Seleção especial da coleção"
            action={
              <Link
                href="/catalogo"
                className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--foreground)] transition hover:text-[var(--accent-strong)]"
              >
                Ver tudo
              </Link>
            }
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
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
              A EloC nasceu da paixão por criar joias que traduzem elegância e
              sofisticação em cada detalhe. Nossa coleção é cuidadosamente
              desenvolvida para mulheres que apreciam design exclusivo e
              qualidade premium.
            </p>
            <p>
              Trabalhamos com pratas e acabamentos nobres, garantindo peças
              atemporais que acompanham você em todos os momentos especiais.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
