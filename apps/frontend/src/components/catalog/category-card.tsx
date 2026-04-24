import Link from 'next/link';
import type { Route } from 'next';

import type { Category, Product } from '@/types/catalog/catalog.types';
import { getCategoryProductCount, getPrimaryProductImage } from '@/utils/catalog';

import { ImageWithFallback } from './image-with-fallback';

type CategoryCardProps = {
  category: Category;
  products: Product[];
};

export function CategoryCard({ category, products }: CategoryCardProps) {
  const representativeProduct = products.find(
    (product) => product.categoryId === category.id,
  );
  const productCount = getCategoryProductCount(category, products);

  return (
    <Link
      href={`/categoria/${category.slug}` as Route}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg bg-[var(--champagne)] focus:outline-none focus:ring-1 focus:ring-[var(--rose-bronze)]"
    >
      <ImageWithFallback
        src={
          representativeProduct ? getPrimaryProductImage(representativeProduct) : null
        }
        alt={`Categoria ${category.name}`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6">
        <h3 className="font-heading text-2xl leading-none text-white">
          {category.name}
        </h3>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
          {productCount} {productCount === 1 ? 'peca' : 'pecas'}
        </p>
      </div>
    </Link>
  );
}
