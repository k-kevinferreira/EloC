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

      <div className="space-y-3 px-5 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
          {product.category.name}
        </p>
        <h3 className="font-heading text-xl leading-tight text-[var(--foreground)]">
          {product.title}
        </h3>
        <p className="text-sm text-[var(--muted)]">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
