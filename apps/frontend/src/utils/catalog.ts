import type { Category, Product } from '@/types/catalog/catalog.types';

export type PublicProductImage = {
  url: string;
  alt: string;
  isPrimary: boolean;
};

export function formatPrice(price: string | number) {
  const value = typeof price === 'number' ? price : Number(price);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(value) ? value : 0);
}

export function getPublicProductImages(product: Product): PublicProductImage[] {
  if (product.images.length > 0) {
    return [...product.images]
      .sort((firstImage, secondImage) => {
        if (firstImage.isPrimary !== secondImage.isPrimary) {
          return firstImage.isPrimary ? -1 : 1;
        }

        return firstImage.displayOrder - secondImage.displayOrder;
      })
      .map((image) => ({
        url: image.url,
        alt: image.altText ?? product.title,
        isPrimary: image.isPrimary,
      }));
  }

  if (!product.imageUrl) {
    return [];
  }

  return [
    {
      url: product.imageUrl,
      alt: product.title,
      isPrimary: true,
    },
  ];
}

export function getPrimaryProductImage(product: Product) {
  return getPublicProductImages(product)[0]?.url ?? null;
}

export function getProductImageAlt(product: Product) {
  return getPublicProductImages(product)[0]?.alt ?? product.title;
}

export function getCategoryProductCount(
  category: Category,
  products: Product[],
) {
  return products.filter((product) => product.categoryId === category.id).length;
}

export function sortProducts(products: Product[], sort: string) {
  return [...products].sort((firstProduct, secondProduct) => {
    if (sort === 'price-asc') {
      return Number(firstProduct.price) - Number(secondProduct.price);
    }

    if (sort === 'price-desc') {
      return Number(secondProduct.price) - Number(firstProduct.price);
    }

    if (sort === 'name') {
      return firstProduct.title.localeCompare(secondProduct.title, 'pt-BR');
    }

    return firstProduct.displayOrder - secondProduct.displayOrder;
  });
}
