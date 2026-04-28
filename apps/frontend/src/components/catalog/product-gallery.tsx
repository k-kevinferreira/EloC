'use client';

import { useMemo, useState } from 'react';

import type { Product } from '@/types/catalog/catalog.types';
import { getPublicProductImages } from '@/utils/catalog';

import { ImageWithFallback } from './image-with-fallback';

type ProductGalleryProps = {
  product: Product;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => {
    return getPublicProductImages(product);
  }, [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-[var(--champagne)]">
        <ImageWithFallback
          src={selectedImage?.url ?? null}
          alt={selectedImage?.alt ?? product.title}
          className="h-full w-full object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              className={[
                'aspect-square overflow-hidden rounded-md border bg-[var(--champagne)] transition',
                selectedIndex === index
                  ? 'border-[var(--rose-bronze)]'
                  : 'border-[var(--border)] opacity-80 hover:opacity-100',
              ].join(' ')}
              aria-label={`Selecionar imagem ${index + 1}`}
              onClick={() => setSelectedIndex(index)}
            >
              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
