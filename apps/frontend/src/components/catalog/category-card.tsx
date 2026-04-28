import Link from 'next/link';
import type { Route } from 'next';

import type { Category, Product } from '@/types/catalog/catalog.types';
import {
  getCategoryProductCount,
  getPrimaryProductImage,
  getPublicProductImages,
} from '@/utils/catalog';

import { ImageWithFallback } from './image-with-fallback';

type CategoryCardProps = {
  category: Category;
  products: Product[];
};

export function CategoryCard({ category, products }: CategoryCardProps) {
  const representativeProduct = products.find(
    (product) =>
      product.categoryId === category.id &&
      getPublicProductImages(product).length > 0,
  );
  const productCount = getCategoryProductCount(category, products);

  return (
    <Link
      href={`/categoria/${category.slug}` as Route}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-[var(--champagne)] focus:outline-none focus:ring-1 focus:ring-[var(--rose-bronze)] sm:aspect-[3/4]"
    >
      <ImageWithFallback
        src={
          representativeProduct ? getPrimaryProductImage(representativeProduct) : null
        }
        alt={`Categoria ${category.name}`}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
        <h3 className="font-heading text-xl leading-none text-white sm:text-2xl">
          {category.name}
        </h3>
        <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/80 sm:mt-3 sm:text-xs sm:tracking-[0.18em]">
          {productCount} {productCount === 1 ? 'peca' : 'pecas'}
        </p>
      </div>
    </Link>
  );
}
