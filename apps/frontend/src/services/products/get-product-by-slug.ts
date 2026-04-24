import 'server-only';

import { requestBackend } from '@/lib/http/backend-api';
import type { Product } from '@/types/catalog/catalog.types';

export async function getProductBySlug(slug: string) {
  return requestBackend<Product>(`products/${slug}`, {
    method: 'GET',
  });
}
