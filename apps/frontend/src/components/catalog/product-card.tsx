import Link from 'next/link';
import type { Route } from 'next';

import type { Product } from '@/types/catalog/catalog.types';
import {
  formatPrice,
  getPrimaryProductImage,
  getProductImageAlt,
} from '@/utils/catalog';

import { ImageWithFallback } from './image-with-fallback';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const href = `/produto/${product.slug}` as Route;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] transition duration-200 hover:-translate-y-1 hover:border-[var(--rose-bronze)] hover:shadow-[var(--shadow-md)] focus:outline-none focus:ring-1 focus:ring-[var(--rose-bronze)]"
    >
      <div className="aspect-square overflow-hidden bg-[var(--champagne)]">
        <ImageWithFallback
          src={getPrimaryProductImage(product)}
          alt={getProductImageAlt(product)}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-2 px-3 py-3 sm:space-y-3 sm:px-5 sm:py-5">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs sm:tracking-[0.18em]">
          {product.category.name}
        </p>
        <h3 className="font-heading text-base leading-tight text-[var(--foreground)] sm:text-xl">
          {product.title}
        </h3>
        <p className="text-xs text-[var(--muted)] sm:text-sm">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
