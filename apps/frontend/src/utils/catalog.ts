import type { Category, Product } from '@/types/catalog/catalog.types';

export function formatPrice(price: string | number) {
  const value = typeof price === 'number' ? price : Number(price);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isFinite(value) ? value : 0);
}

export function getPrimaryProductImage(product: Product) {
  const primaryImage =
    product.images.find((image) => image.isPrimary) ?? product.images[0];

  return primaryImage?.url ?? product.imageUrl ?? null;
}

export function getProductImageAlt(product: Product) {
  const primaryImage =
    product.images.find((image) => image.isPrimary) ?? product.images[0];

  return primaryImage?.altText ?? product.title;
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
