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
      <section className="px-6 py-8 lg:px-12 lg:py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,0.75fr)] lg:items-start">
          <div className="mx-auto w-full max-w-[430px] lg:mx-0">
            <ProductGallery product={product} />
          </div>

          <div className="space-y-5 lg:pt-2">
            <div className="space-y-2.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                {product.category.name}
              </p>
              <h1 className="font-heading text-3xl leading-none text-[var(--foreground)] sm:text-4xl">
                {product.title}
              </h1>
              <p className="text-lg font-light text-[var(--foreground)]">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.shortDescription ? (
              <p className="text-sm leading-6 tracking-[0.02em] text-[var(--muted)]">
                {product.shortDescription}
              </p>
            ) : null}

            {product.description ? (
              <div className="border-y border-[var(--border)] py-5">
                <h2 className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                  Descricao
                </h2>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  {product.description}
                </p>
              </div>
            ) : null}

            <dl className="grid gap-3 text-xs text-[var(--muted)] sm:grid-cols-2">
              <div>
                <dt className="font-medium uppercase tracking-[0.16em]">Codigo</dt>
                <dd className="mt-1.5">{product.code}</dd>
              </div>
              <div>
                <dt className="font-medium uppercase tracking-[0.16em]">
                  Categoria
                </dt>
                <dd className="mt-1.5">{product.category.name}</dd>
              </div>
              {product.subcategory ? (
                <div>
                  <dt className="font-medium uppercase tracking-[0.16em]">
                    Linha
                  </dt>
                  <dd className="mt-1.5">{product.subcategory.name}</dd>
                </div>
              ) : null}
            </dl>

            <div>
              <a
                href={`https://wa.me/?text=${contactMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2.5 rounded-md border border-[var(--rose-bronze)] bg-[var(--rose-bronze)] px-6 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[var(--rose-bronze-strong)]"
              >
                <WhatsAppIcon />
                Consultar disponibilidade
              </a>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="px-6 py-12 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 font-heading text-3xl leading-none text-[var(--foreground)] sm:text-4xl">
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

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12.04 2a9.86 9.86 0 0 0-8.45 14.93L2.3 21.7l4.9-1.28A9.95 9.95 0 0 0 12.04 22 10 10 0 0 0 12.04 2Zm0 18.28a8.18 8.18 0 0 1-4.18-1.15l-.3-.18-2.9.76.78-2.82-.2-.31a8.13 8.13 0 1 1 6.8 3.7Zm4.46-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.67 6.67 0 0 1-1.96-1.21 7.35 7.35 0 0 1-1.36-1.69c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.15 1.52.09.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

async function getProduct(slug: string) {
  try {
    return await getProductBySlug(slug);
  } catch {
    return null;
  }
}
