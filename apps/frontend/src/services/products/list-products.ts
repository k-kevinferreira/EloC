import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Product } from '@/types/catalog/catalog.types';

type ListProductsOptions = {
  limit?: number;
};

export async function listProducts(options: ListProductsOptions = {}) {
  const searchParams = new URLSearchParams();

  if (options.limit !== undefined) {
    searchParams.set('limit', String(options.limit));
  }

  const path = searchParams.size > 0 ? `products?${searchParams}` : 'products';

  return requestBackend<Product[]>(path, {
    method: 'GET',
  });
}
