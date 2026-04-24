import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Product } from '@/types/catalog/catalog.types';

type ListProductsOptions = {
  categoryId?: string;
  subcategoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function listProducts(options: ListProductsOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.categoryId) {
    searchParams.set('categoryId', options.categoryId);
  }

  if (options.subcategoryId) {
    searchParams.set('subcategoryId', options.subcategoryId);
  }

  if (options.isActive !== undefined) {
    searchParams.set('isActive', String(options.isActive));
  }

  if (options.isFeatured !== undefined) {
    searchParams.set('isFeatured', String(options.isFeatured));
  }

  if (options.search) {
    searchParams.set('search', options.search);
  }

  if (options.limit !== undefined) {
    searchParams.set('limit', String(options.limit));
  }

  if (options.offset !== undefined) {
    searchParams.set('offset', String(options.offset));
  }

  const path = searchParams.size > 0 ? `products?${searchParams}` : 'products';

  return requestBackend<Product[]>(path, {
    method: 'GET',
  });
}
