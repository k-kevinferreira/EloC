import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/catalog/product-card';
import { ProductGallery } from '@/components/catalog/product-gallery';
import { getProductBySlug } from '@/services/products/get-product-by-slug';
import { listProducts } from '@/services/products/list-products';
import { formatPrice } from '@/utils/catalog';

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (
    await listProducts({
      isActive: true,
      categoryId: product.categoryId,
      limit: 5,
    })
  )
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const contactMessage = encodeURIComponent(
    `Ola, tenho interesse na peca ${product.title} (${product.code}).`,
  );

  return (
    <main>
      <section className="px-6 py-12 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <ProductGallery product={product} />

          <div className="space-y-8 lg:pt-8">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                {product.category.name}
              </p>
              <h1 className="font-heading text-5xl leading-none text-[var(--foreground)] sm:text-6xl">
                {product.title}
              </h1>
              <p className="text-2xl font-light text-[var(--foreground)]">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.shortDescription ? (
              <p className="text-base leading-8 tracking-[0.02em] text-[var(--muted)]">
                {product.shortDescription}
              </p>
            ) : null}

            {product.description ? (
              <div className="border-y border-[var(--border)] py-8">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  Descricao
                </h2>
                <p className="text-sm leading-8 text-[var(--muted)]">
                  {product.description}
                </p>
              </div>
            ) : null}

            <dl className="grid gap-4 text-sm text-[var(--muted)] sm:grid-cols-2">
              <div>
                <dt className="font-medium uppercase tracking-[0.16em]">Codigo</dt>
                <dd className="mt-2">{product.code}</dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-[0.16em]">
                  Categoria
                </dt>
                <dd className="mt-2">{product.category.name}</dd>
              </div>
              {product.subcategory ? (
                <div>
                  <dt className="font-medium uppercase tracking-[0.16em]">
                    Linha
                  </dt>
                  <dd className="mt-2">{product.subcategory.name}</dd>
                </div>
              ) : null}
            </dl>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={`https://wa.me/?text=${contactMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--rose-bronze)] bg-[var(--rose-bronze)] px-8 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[var(--rose-bronze-strong)]"
              >
                Consultar disponibilidade
              </a>
              <a
                href="mailto:contato@eloc.com.br"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-8 text-sm font-medium uppercase tracking-[0.16em] text-[var(--foreground)] transition hover:border-[var(--rose-bronze)]"
              >
                Enviar email
              </a>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 font-heading text-4xl leading-none text-[var(--foreground)] sm:text-5xl">
              Voce tambem pode gostar
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

async function getProduct(slug: string) {
  try {
    return await getProductBySlug(slug);
  } catch {
    return null;
  }
}
